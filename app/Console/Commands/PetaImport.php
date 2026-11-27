<?php

namespace App\Console\Commands;

use App\Models\PetaWilayah;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use RuntimeException;

class PetaImport extends Command
{
    protected $signature = 'peta:import';

    protected $description = 'Impor ulang tabel peta_wilayah dari database/data/peta_wilayah.json';

    public function handle(): int
    {
        $path = database_path('data/peta_wilayah.json');

        if (! File::exists($path)) {
            throw new RuntimeException("Berkas cadangan tidak ditemukan: {$path}");
        }

        $baris = json_decode(File::get($path), true);

        if (! is_array($baris)) {
            throw new RuntimeException('Format berkas cadangan tidak valid.');
        }

        DB::transaction(function () use ($baris) {
            PetaWilayah::query()->delete();

            foreach (array_chunk($baris, 100) as $potongan) {
                PetaWilayah::query()->insert(array_map(function (array $item) {
                    $now = now();

                    return array_merge($item, [
                        'geometry' => json_encode($item['geometry']),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }, $potongan));
            }
        });

        $this->info('Diimpor '.count($baris).' baris dari database/data/peta_wilayah.json');

        return self::SUCCESS;
    }
}
