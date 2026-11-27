<?php

namespace App\Console\Commands;

use App\Models\PetaWilayah;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class PetaExport extends Command
{
    protected $signature = 'peta:export';

    protected $description = 'Ekspor tabel peta_wilayah ke database/data/peta_wilayah.json';

    public function handle(): int
    {
        $data = PetaWilayah::query()
            ->orderBy('id')
            ->get(['level', 'nama', 'kode_kecamatan', 'kode_kelurahan', 'nama_kecamatan', 'nama_kabkota', 'lat', 'lng', 'geometry'])
            ->toArray();

        File::ensureDirectoryExists(database_path('data'));
        File::put(
            database_path('data/peta_wilayah.json'),
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );

        $this->info('Diekspor '.count($data).' baris ke database/data/peta_wilayah.json');

        return self::SUCCESS;
    }
}
