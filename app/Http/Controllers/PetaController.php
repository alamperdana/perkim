<?php

namespace App\Http\Controllers;

use App\Models\PetaWilayah;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class PetaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('peta/index');
    }

    public function data(): JsonResponse
    {
        $fitur = PetaWilayah::query()
            ->orderBy('level')
            ->orderBy('nama')
            ->get()
            ->map(fn (PetaWilayah $w) => [
                'type' => 'Feature',
                'properties' => [
                    'level' => $w->level,
                    'NAMOBJ' => $w->nama,
                    'KDCPUM' => $w->kode_kecamatan,
                    'KDEPUM' => $w->kode_kelurahan,
                    'WADMKC' => $w->nama_kecamatan,
                    'WADMKK' => $w->nama_kabkota,
                    'lat' => $w->lat,
                    'lng' => $w->lng,
                ],
                'geometry' => $w->geometry,
            ])
            ->values();

        return response()->json($fitur);
    }
}
