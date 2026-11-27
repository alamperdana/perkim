<?php

namespace App\Http\Controllers\Konfigurasi;

use App\DataTables\MasterData\UserDataTable;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Repositories\MenuRepository;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AksesUserController extends Controller
{
    public function __construct(protected MenuRepository $menuRepository)
    {
        $this->menuRepository = $menuRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, UserDataTable $userDataTable)
    {
        $this->authorize('read konfigurasi/akses-user');

        if ($request->wantsJson() && !$request->inertia()) {
            return $userDataTable->ajax();
        }

        return Inertia::render('konfigurasi/akses-user', [
            'daftarUser' => User::orderBy('id')->get(['id', 'name', 'username']),
            'menus' => $this->menuRepository->getMenuTreeForAkses(),
            'can' => [
                'update' => auth()->user()->can('update konfigurasi/akses-user'),
            ],
        ]);
    }

    /**
     * Ambil permission langsung milik user, untuk fitur copy dari user.
     */
    public function getPermissionsByUser(User $user)
    {
        return response()->json([
            'permissions' => $user->getDirectPermissions()->pluck('name'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('update konfigurasi/akses-user');

        $lama = $user->getDirectPermissions()->pluck('name')->sort()->values()->all();
        $user->syncPermissions($request->input('permissions', []));
        $baru = $user->fresh()->getDirectPermissions()->pluck('name')->sort()->values()->all();

        if ($lama !== $baru) {
            ActivityLogger::catat(
                event: 'akses_diubah',
                deskripsi: 'Mengubah akses user ' . $user->name,
                model: $user,
                properti: ['permissions' => ['lama' => $lama, 'baru' => $baru]],
            );
        }

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess(true);
        }

        return redirect()->route('konfigurasi.akses-user.index')->with('success', 'Akses user berhasil diperbarui.');
    }
}
