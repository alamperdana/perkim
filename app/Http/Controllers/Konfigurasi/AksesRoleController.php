<?php

namespace App\Http\Controllers\Konfigurasi;

use App\DataTables\Konfigurasi\RoleDataTable;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Repositories\MenuRepository;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AksesRoleController extends Controller
{
    public function __construct(protected MenuRepository $menuRepository)
    {
        $this->menuRepository = $menuRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, RoleDataTable $roleDataTable)
    {
        $this->authorize('read konfigurasi/akses-role');

        if ($request->wantsJson() && !$request->inertia()) {
            return $roleDataTable->ajax();
        }

        return Inertia::render('konfigurasi/akses-role', [
            'daftarRole' => Role::orderBy('id')->get(['id', 'name', 'guard_name']),
            'menus' => $this->menuRepository->getMenuTreeForAkses(),
            'can' => [
                'update' => auth()->user()->can('update konfigurasi/akses-role'),
            ],
        ]);
    }

    /**
     * Ambil permission yang dimiliki role, untuk fitur copy dari role.
     */
    public function getPermissionsByRole(Role $role)
    {
        return response()->json([
            'permissions' => $role->permissions()->pluck('name'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $this->authorize('update konfigurasi/akses-role');

        $lama = $role->permissions()->pluck('name')->sort()->values()->all();
        $role->syncPermissions($request->input('permissions', []));
        $baru = $role->fresh()->permissions()->pluck('name')->sort()->values()->all();

        if ($lama !== $baru) {
            ActivityLogger::catat(
                event: 'akses_diubah',
                deskripsi: 'Mengubah akses role ' . $role->name,
                model: $role,
                properti: ['permissions' => ['lama' => $lama, 'baru' => $baru]],
            );
        }

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess(true);
        }

        return redirect()->route('konfigurasi.akses-role.index')->with('success', 'Akses role berhasil diperbarui.');
    }
}
