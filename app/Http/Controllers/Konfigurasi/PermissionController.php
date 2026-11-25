<?php

namespace App\Http\Controllers\Konfigurasi;

use App\DataTables\Konfigurasi\PermissionDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\Konfigurasi\PermissionRequest;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, PermissionDataTable $permissionDataTable)
    {
        $this->authorize('read konfigurasi/permissions');

        if ($request->wantsJson() && !$request->inertia()) {
            return $permissionDataTable->ajax();
        }

        return Inertia::render('konfigurasi/permissions', [
            'daftarPermission' => Permission::orderBy('id')->get(),
            'can' => [
                'create' => auth()->user()->can('create konfigurasi/permissions'),
                'update' => auth()->user()->can('update konfigurasi/permissions'),
                'delete' => auth()->user()->can('delete konfigurasi/permissions'),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PermissionRequest $request)
    {
        $this->authorize('create konfigurasi/permissions');

        $permission = new Permission($request->validated());
        $permission->save();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess();
        }

        return redirect()->route('konfigurasi.permissions.index')->with('success', 'Permission berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PermissionRequest $request, Permission $permission)
    {
        $this->authorize('update konfigurasi/permissions');

        $permission->fill($request->validated());
        $permission->save();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess(true);
        }

        return redirect()->route('konfigurasi.permissions.index')->with('success', 'Permission berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Permission $permission)
    {
        $this->authorize('delete konfigurasi/permissions');

        $permission->delete();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccessDelete();
        }

        return redirect()->route('konfigurasi.permissions.index')->with('success', 'Permission berhasil dihapus.');
    }
}
