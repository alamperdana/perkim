<?php

namespace App\Http\Controllers\MasterData;

use App\DataTables\MasterData\UserDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\UserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, UserDataTable $userDataTable)
    {
        if ($request->wantsJson() && !$request->inertia()) {
            return $userDataTable->ajax();
        }

        return Inertia::render('master-data/users', [
            'daftarUser' => User::with(['roles:id,name'])
                ->orderBy('id')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->values(),
                    'is_online' => $user->isOnline(),
                    'last_activity' => $user->last_activity?->translatedFormat('d M Y H:i'),
                    'last_activity_human' => $user->last_activity?->diffForHumans(),
                ]),
            'daftarRole' => Role::orderBy('name')->get(['id', 'name']),
            'can' => [
                'create' => auth()->user()->can('create master-data/users'),
                'update' => auth()->user()->can('update master-data/users'),
                'delete' => auth()->user()->can('delete master-data/users'),
            ],
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request, User $user)
    {
        $this->authorize('create master-data/users');


        $user->fill($request->only(['email', 'name', 'username']));
        $user->password = bcrypt($request->password);

        $user->markEmailAsVerified();
        $user->save();
        $user->assignRole($request->roles);

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess(false);
        }

        return redirect()->route('master-data.users.index')->with('success', 'Data user berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $request, User $user)
    {
        $this->authorize('update master-data/users');


        $user->fill($request->only(['email', 'name', 'username']));

        if ($request->filled('password')) {
            $user->password = bcrypt($request->password);
        }

        $user->save();
        $user->syncRoles($request->roles);

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess(true);
        }

        return redirect()->route('master-data.users.index')->with('success', 'Data user berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user)
    {
        $this->authorize('delete master-data/users');

        $user->delete();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccessDelete();
        }

        return redirect()->route('master-data.users.index')->with('success', 'Data user berhasil dihapus.');
    }
}

