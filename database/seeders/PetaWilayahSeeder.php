<?php

namespace Database\Seeders;

use App\Models\PetaWilayah;
use Illuminate\Database\Seeder;
use RuntimeException;

class PetaWilayahSeeder extends Seeder
{
    private const KABKOTA_FILE = 'KabKota.geojson';
    private const KECAMATAN_FILE = 'BatasKecamatan.geojson';
    private const KELURAHAN_FILE = 'BatasKelurahan.geojson';
    private const WILAYAH_INDUK = 'Kota Jambi';

    /**
     * Seed wilayah Kota Jambi dari file GeoJSON mentah di root project.
     */
    public function run(): void
    {
        $sumber = [
            'kabkota' => self::KABKOTA_FILE,
            'kecamatan' => self::KECAMATAN_FILE,
            'kelurahan' => self::KELURAHAN_FILE,
        ];

        foreach ($sumber as $level => $berkas) {
            foreach ($this->bacaFitur($berkas) as $fitur) {
                $properti = $fitur['properties'];

                if (trim((string) ($properti['WADMKK'] ?? '')) !== self::WILAYAH_INDUK) {
                    continue;
                }

                [$lat, $lng] = $this->centroid($fitur['geometry']);
                $kodeKecamatan = $this->kodeBersih($properti['KDCPUM'] ?? null);
                $kodeKelurahan = $level === 'kelurahan' ? $this->kodeBersih($properti['KDEPUM'] ?? null) : null;

                $kunci = ['level' => $level, 'nama' => trim((string) $properti['NAMOBJ'])];

                if ($level === 'kecamatan') {
                    $kunci['kode_kecamatan'] = $kodeKecamatan;
                }

                if ($level === 'kelurahan') {
                    $kunci['kode_kelurahan'] = $kodeKelurahan;
                }

                PetaWilayah::updateOrCreate(
                    $kunci,
                    [
                        'nama_kecamatan' => $level === 'kabkota' ? null : $this->kodeBersih($properti['WADMKC'] ?? null),
                        'nama_kabkota' => trim((string) $properti['WADMKK']),
                        'lat' => $lat,
                        'lng' => $lng,
                        'geometry' => $fitur['geometry'],
                    ]
                );
            }
        }
    }

    /**
     * @return array<int, array{properties: array<string, mixed>, geometry: array<string, mixed>}>
     */
    private function bacaFitur(string $berkas): array
    {
        $path = base_path($berkas);

        if (! is_file($path)) {
            throw new RuntimeException("Berkas GeoJSON tidak ditemukan: {$path}");
        }

        $json = json_decode((string) file_get_contents($path), true);

        if (! is_array($json) || ! isset($json['features']) || ! is_array($json['features'])) {
            throw new RuntimeException("Format GeoJSON tidak valid: {$berkas}");
        }

        return $json['features'];
    }

    private function kodeBersih(mixed $nilai): ?string
    {
        $bersih = trim((string) $nilai);

        return $bersih === '' ? null : $bersih;
    }

    /**
     * Titik tengah sederhana dari rata-rata semua koordinat geometri.
     *
     * @param  array<string, mixed>  $geometry
     * @return array{0: float, 1: float}
     */
    private function centroid(array $geometry): array
    {
        $titik = [];
        $this->kumpulkanTitik($geometry['coordinates'] ?? [], $titik);

        if ($titik === []) {
            throw new RuntimeException('Geometri tidak memiliki koordinat.');
        }

        $lngs = array_column($titik, 0);
        $lats = array_column($titik, 1);

        return [
            round(array_sum($lats) / count($lats), 7),
            round(array_sum($lngs) / count($lngs), 7),
        ];
    }

    /**
     * @param  array<int, mixed>  $node
     * @param  array<int, array{0: float, 1: float}>  $titik
     */
    private function kumpulkanTitik(array $node, array &$titik): void
    {
        if (count($node) >= 2 && is_numeric($node[0]) && is_numeric($node[1])) {
            $titik[] = [(float) $node[0], (float) $node[1]];

            return;
        }

        foreach ($node as $anak) {
            if (is_array($anak)) {
                $this->kumpulkanTitik($anak, $titik);
            }
        }
    }
}
