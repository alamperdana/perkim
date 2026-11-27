<?php

namespace App\Http\Controllers\Konfigurasi;

use App\DataTables\Konfigurasi\MenuDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\Konfigurasi\MenuRequest;
use App\Models\Konfigurasi\Menu;
use App\Models\Permission;
use App\Repositories\MenuRepository;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Mavinoo\Batch\BatchFacade;

class MenuController extends Controller
{
    public function __construct(private MenuRepository $repository) 
    {
        $this->repository = $repository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, MenuDataTable $menuDataTable)
    {
        $this->authorize('read konfigurasi/menu');

        if ($request->wantsJson() && !$request->inertia()) {
            return $menuDataTable->ajax();
        }

        $query = Menu::with('mainMenu');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('category', 'ilike', "%{$search}%")
                  ->orWhere('url', 'ilike', "%{$search}%");
            });
        }

        $menus = $query->orderBy('orders', 'asc')->get();
        $mainMenuList = Menu::whereNull('main_menu_id')->orderBy('orders', 'asc')->get(['id', 'name']);

        return Inertia::render('konfigurasi/menu', [
            'menus' => $menus,
            'mainMenuList' => $mainMenuList,
            'filters' => [
                'search' => $request->search ?? '',
            ],
            'can' => [
                'create' => auth()->user()->can('create konfigurasi/menu'),
                'update' => auth()->user()->can('update konfigurasi/menu'),
                'delete' => auth()->user()->can('delete konfigurasi/menu'),
                'sort' => auth()->user()->can('sort konfigurasi/menu'),
            ],
        ]);
    }

    public function sort(Request $request)
    {
        $this->authorize('sort konfigurasi/menu');

        $menus = $this->repository->getMenus();

        $data = [];
        $i = 0;
        foreach($menus as $mm) {
            $i++;
            $data[] = ['id' => $mm->id, 'orders' => $i];
            foreach($mm->subMenus as $sm) {
                $i++;
                $data[] = ['id' => $sm->id, 'orders' => $i];
            }
        }

        Cache::forget('menus');
        
        BatchFacade::update(new Menu(), $data, 'id');

        // BatchFacade tidak memicu event model, jadi urutan dicatat manual satu kali.
        ActivityLogger::catat(
            event: 'updated',
            deskripsi: 'Mengubah urutan menu',
            properti: ['jumlah_menu' => count($data)],
        );

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess(true);
        }

        return redirect()->route('konfigurasi.menu.index')->with('success', 'Urutan menu berhasil diselaraskan.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Menu $menu)
    {
        $this->authorize('create konfigurasi/menu');

        return view('pages.konfigurasi.menu-form', [
            'action' => route('konfigurasi.menu.store'),
            'data' => $menu,
            'mainMenus' => $this->repository->getMainMenus()
        ]);
    }

    private function fillData(MenuRequest $request, Menu $menu)
    {
        $menu->fill($request->validated());
        $menu->fill([
            'orders' => $request->orders,
            'icon' => $request->icon,
            'category' => $request->category,
            'main_menu_id' => $request->level_menu === 'main_menu' ? null : $request->main_menu, 
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MenuRequest $request, Menu $menu)
    {
        DB::beginTransaction();
        try {
            $this->authorize('create konfigurasi/menu');
    
            $this->fillData($request, $menu);
            $menu->save();
    
            foreach ($request->permissions ?? [] as $permission) {
                Permission::create(['name' => $permission . " {$menu->url}"])->menus()->attach($menu);
            }

            Cache::forget('menus');
            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();

            if ($request->wantsJson() && !$request->inertia()) {
                return responseError($th);
            }

            return back()->with('error', 'Gagal menambahkan menu: ' . $th->getMessage());
        }

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess();
        }

        return redirect()->route('konfigurasi.menu.index')->with('success', 'Menu berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Menu $menu)
    {
        return view('pages.konfigurasi.menu-form', [
            'data' => $menu,
            'mainMenus' => $this->repository->getMainMenus()
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Menu $menu)
    {
        $this->authorize('update konfigurasi/menu');

        return view('pages.konfigurasi.menu-form', [
            'action' => route('konfigurasi.menu.update', $menu->id),
            'data' => $menu,
            'mainMenus' => $this->repository->getMainMenus()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MenuRequest $request, Menu $menu)
    {
        DB::beginTransaction();
        try {
            $this->authorize('update konfigurasi/menu');

            $oldUrl = $menu->getOriginal('url');
            $newUrl = $request->url;

            $this->fillData($request, $menu);
            $menu->save();

            if ($oldUrl !== $newUrl) {
                // Rename lewat query builder agar tidak menghasilkan log per permission.
                // Perubahan URL sudah tercatat satu kali dari $menu->save() di atas.
                $permissions = Permission::where('name', 'like', "%{$oldUrl}%")->get();
                foreach ($permissions as $permission) {
                    DB::table('permissions')
                        ->where('id', $permission->id)
                        ->update(['name' => str_replace($oldUrl, $newUrl, $permission->name)]);
                }
                app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
            }

            Cache::forget('menus');
            DB::commit();

            if ($request->wantsJson() && !$request->inertia()) {
                return responseSuccess(true);
            }

            return redirect()->route('konfigurasi.menu.index')->with('success', 'Menu berhasil diperbarui.');
        } catch (\Throwable $th) {
            DB::rollBack();
            logger()->error("Update failed: " . $th->getMessage());

            if ($request->wantsJson() && !$request->inertia()) {
                return responseError($th->getMessage());
            }

            return back()->with('error', 'Gagal memperbarui menu: ' . $th->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Menu $menu)
    {
        DB::beginTransaction();
        try {
            $this->authorize('delete konfigurasi/menu');

            $permissionIds = $menu->permissions()->pluck('permissions.id')->toArray();
            $namaPermissionDihapus = Permission::whereIn('id', $permissionIds)->pluck('name')->toArray();
            $menu->permissions()->detach();
            Permission::whereIn('id', $permissionIds)->delete();
            // Delete massal tidak memicu event model, jadi permission yang ikut terhapus dicatat di sini.
            $menu->deleteQuietly();
            ActivityLogger::catat(
                event: 'deleted',
                deskripsi: "Menghapus menu {$menu->name}",
                model: $menu,
                properti: ['permission_dihapus' => $namaPermissionDihapus],
            );

            Cache::forget('menus');
            DB::commit();

            if ($request->wantsJson() && !$request->inertia()) {
                return responseSuccessDelete();
            }

            return redirect()->route('konfigurasi.menu.index')->with('success', 'Menu berhasil dihapus.');
        } catch (\Throwable $th) {
            DB::rollBack();
            logger()->error("Deletion failed: " . $th->getMessage());

            if ($request->wantsJson() && !$request->inertia()) {
                return responseError($th->getMessage());
            }

            return back()->with('error', 'Gagal menghapus menu: ' . $th->getMessage());
        }
    }
}
