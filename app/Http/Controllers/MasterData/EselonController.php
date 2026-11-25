<?php

namespace App\Http\Controllers\MasterData;

use App\DataTables\MasterData\EselonDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\EselonRequest;
use App\Models\Eselon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EselonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, EselonDataTable $datatables)
    {
        $this->authorize('read master-data/eselon');

        if ($request->wantsJson() && !$request->inertia()) {
            return $datatables->ajax();
        }

        return Inertia::render('master-data/eselon', [
            'daftarEselon' => Eselon::orderBy('id')->get(),
            'can' => [
                'create' => auth()->user()->can('create master-data/eselon'),
                'update' => auth()->user()->can('update master-data/eselon'),
                'delete' => auth()->user()->can('delete master-data/eselon'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('pages.master-data.eselon-form', [
            'data' => new Eselon(),
            'action' => route('master-data.eselon.store')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(EselonRequest $request, Eselon $eselon)
    {
        $this->authorize('create master-data/eselon');

        $eselon->fill($request->only('nama_eselon'));
        $eselon->save();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess();
        }

        return redirect()->route('master-data.eselon.index')->with('success', 'Data eselon berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Eselon $eselon)
    {
        return view('pages.master-data.eselon-form', [
            'data' => $eselon,
            'action' => null
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Eselon $eselon)
    {
        return view('pages.master-data.eselon-form', [
            'data' => $eselon,
            'action' => route('master-data.eselon.update', $eselon->id)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(EselonRequest $request, Eselon $eselon)
    {
        $this->authorize('update master-data/eselon');

        $eselon->fill($request->only('nama_eselon'));
        $eselon->save();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess(true);
        }

        return redirect()->route('master-data.eselon.index')->with('success', 'Data eselon berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Eselon $eselon)
    {
        $this->authorize('delete master-data/eselon');

        $eselon->delete();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccessDelete();
        }

        return redirect()->route('master-data.eselon.index')->with('success', 'Data eselon dipindahkan ke arsip.');
    }

    /**
     * Fungsi untuk menampilkan data yang dihapus
     */
    public function archive(Request $request)
    {
        $this->authorize('read master-data/eselon');

        if ($request->wantsJson() && !$request->inertia()) {
            return Eselon::onlyTrashed()->get();
        }

        return Inertia::render('master-data/eselon-arsip', [
            'daftarArsip' => Eselon::onlyTrashed()->orderBy('deleted_at', 'desc')->get(),
            'can' => [
                'update' => auth()->user()->can('update master-data/eselon'),
                'delete' => auth()->user()->can('delete master-data/eselon'),
            ],
        ]);
    }

    /**
     * Fungsi untuk restore eselon
     */
    public function restore(Request $request, $id)
    {
        $this->authorize('update master-data/eselon');

        $eselon = Eselon::onlyTrashed()->find($id);
        if ($eselon) {
            $eselon->restore();
        }

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccessRestore();
        }

        return redirect()->route('master-data.eselon.archive')->with('success', 'Data eselon berhasil dipulihkan.');
    }

    /**
     * Fungsi untuk hapus permanen
     */
    public function destroyPermanent(Request $request, $id)
    {
        $this->authorize('delete master-data/eselon');

        $eselon = Eselon::onlyTrashed()->find($id);
        if ($eselon) {
            $eselon->forceDelete();
        }

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccessForceDelete();
        }

        return redirect()->route('master-data.eselon.archive')->with('success', 'Data eselon berhasil dihapus permanen.');
    }
}
