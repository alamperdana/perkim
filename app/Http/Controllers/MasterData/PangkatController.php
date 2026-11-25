<?php

namespace App\Http\Controllers\MasterData;

use App\DataTables\MasterData\PangkatDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\PangkatRequest;
use App\Models\Pangkat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PangkatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, PangkatDataTable $pangkatDataTable)
    {
        if ($request->wantsJson() && !$request->inertia()) {
            return $pangkatDataTable->ajax();
        }

        return Inertia::render('master-data/pangkat', [
            'daftarPangkat' => Pangkat::orderBy('id')->get(),
            'can' => [
                'create' => auth()->user()->can('create master-data/pangkat'),
                'update' => auth()->user()->can('update master-data/pangkat'),
                'delete' => auth()->user()->can('delete master-data/pangkat'),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PangkatRequest $request, Pangkat $pangkat)
    {
        $pangkat->fill($request->only(['pangkat', 'golongan', 'pnsyes']));
        $pangkat->save();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess();
        }

        return redirect()->route('master-data.pangkat.index')->with('success', 'Data pangkat berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PangkatRequest $request, Pangkat $pangkat)
    {
        $pangkat->fill($request->only(['pangkat', 'golongan', 'pnsyes']));
        $pangkat->save();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess(true);
        }

        return redirect()->route('master-data.pangkat.index')->with('success', 'Data pangkat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Pangkat $pangkat)
    {
        $pangkat->delete();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccessDelete();
        }

        return redirect()->route('master-data.pangkat.index')->with('success', 'Data pangkat berhasil dihapus.');
    }
}
