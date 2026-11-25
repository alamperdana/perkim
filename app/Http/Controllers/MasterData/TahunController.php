<?php

namespace App\Http\Controllers\MasterData;

use App\DataTables\MasterData\TahunDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\TahunRequest;
use App\Models\Tahun;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TahunController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, TahunDataTable $tahunDataTable)
    {
        if ($request->wantsJson() && !$request->inertia()) {
            return $tahunDataTable->ajax();
        }

        $tahun = Tahun::orderBy('tahun', 'desc')->get();
        $archivedCount = Tahun::onlyTrashed()->count();

        return Inertia::render('master-data/tahun', [
            'daftarTahun' => $tahun,
            'archivedCount' => $archivedCount,
            'currentYear' => (int) date('Y'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('pages.master-data.tahun-form', [
            'data' => new Tahun(),
            'action' => route('master-data.tahun.store')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TahunRequest $request, Tahun $tahun)
    {
        $tahun->fill($request->only(['tahun']));
        $tahun->save();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess();
        }

        return redirect()->route('master-data.tahun.index')->with('success', 'Tahun anggaran berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tahun $tahun)
    {
        return view('pages.master-data.tahun-form', [
            'data' => $tahun,
            'action' => null
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tahun $tahun)
    {
        return view('pages.master-data.tahun-form', [
            'data' => $tahun,
            'action' => route('master-data.tahun.update', $tahun->id)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TahunRequest $request, Tahun $tahun)
    {
        $tahun->fill($request->only(['tahun']));
        $tahun->save();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccess(true);
        }

        return redirect()->route('master-data.tahun.index')->with('success', 'Tahun anggaran berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Tahun $tahun)
    {
        $tahun->delete();

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccessDelete();
        }

        return redirect()->route('master-data.tahun.index')->with('success', 'Tahun anggaran dipindahkan ke arsip.');
    }

    // Fungsi untuk menampilkan data yang dihapus
    public function archive()
    {
        $archivedTahun = Tahun::onlyTrashed()->orderBy('deleted_at', 'desc')->get();
        return view('pages.master-data.tahun-arsip', compact('archivedTahun'));
    }

    // Fungsi untuk restore tahun
    public function restore(Request $request, $id)
    {
        $tahun = Tahun::onlyTrashed()->find($id);
        if ($tahun) {
            $tahun->restore();
        }

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccessRestore();
        }

        return redirect()->route('master-data.tahun.index')->with('success', 'Tahun anggaran berhasil dipulihkan.');
    }

    // Fungsi untuk hapus permanen
    public function destroyPermanent(Request $request, $id)
    {
        $tahun = Tahun::onlyTrashed()->find($id);
        if ($tahun) {
            $tahun->forceDelete();
        }

        if ($request->wantsJson() && !$request->inertia()) {
            return responseSuccessForceDelete();
        }

        return redirect()->route('master-data.tahun.index')->with('success', 'Tahun anggaran berhasil dihapus permanen.');
    }
}
