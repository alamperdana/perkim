<?php

namespace App\Http\Controllers\Konfigurasi;

use App\DataTables\Konfigurasi\RoleDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\Konfigurasi\RoleRequest;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, RoleDataTable $roleDataTable)
    {
        $this->authorize('read konfigurasi/roles');

        if ($request->wantsJson() && !$request->inertia()) {
            return $roleDataTable->ajax();
        }

        return Inertia::render('konfigurasi/roles', [
            'daftarRole' => Role::orderBy('id')->get(),
            'can' => [
                'create' => auth()->user()->can('create konfigurasi/roles'),
                'update' => auth()->user()->can('update konfigurasi/roles'),
                'delete' => auth()->user()->can('delete konfigurasi/roles'),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RoleRequest $request)
    {
        $this->authorize('create konfigurasi/roles');

        $role = new Role($request->validated());
        $role->save();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess();
        }

        return redirect()->route('konfigurasi.roles.index')->with('success', 'Role berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RoleRequest $request, Role $role)
    {
        $this->authorize('update konfigurasi/roles');

        $role->fill($request->validated());
        $role->save();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess(true);
        }

        return redirect()->route('konfigurasi.roles.index')->with('success', 'Role berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Role $role)
    {
        $this->authorize('delete konfigurasi/roles');

        $role->delete();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccessDelete();
        }

        return redirect()->route('konfigurasi.roles.index')->with('success', 'Role berhasil dihapus.');
    }
}
