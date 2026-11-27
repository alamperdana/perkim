<?php

namespace App\Http\Controllers\Konfigurasi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Konfigurasi\PengaturanRequest;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\SettingHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PengaturanController extends Controller
{
    /**
     * Teks yang disimpan lewat form. Logo dan favicon ditangani terpisah.
     */
    private const FIELD_TEKS = [
        'app_name',
        'app_full_name',
        'description',
        'address',
        'phone',
        'email',
        'copyright',
    ];

    /**
     * Label field untuk riwayat perubahan.
     */
    private const LABEL = [
        'app_name' => 'Nama website',
        'app_full_name' => 'Nama lengkap instansi',
        'description' => 'Deskripsi',
        'address' => 'Alamat',
        'phone' => 'Telepon',
        'email' => 'Email',
        'copyright' => 'Teks hak cipta',
        'logo_path' => 'Logo',
        'favicon_path' => 'Favicon',
    ];

    public function edit(Request $request)
    {
        $this->authorize('read konfigurasi/pengaturan');

        $setting = collect(self::FIELD_TEKS)
            ->mapWithKeys(fn (string $key) => [$key => Setting::get($key)])
            ->put('logo_url', $this->urlFile(Setting::get('logo_path')))
            ->put('favicon_url', $this->urlFile(Setting::get('favicon_path')));

        $riwayat = SettingHistory::with('user:id,name')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(20)
            ->get()
            ->map(fn (SettingHistory $h) => [
                'id' => $h->id,
                'key' => $h->setting_key,
                'label' => self::LABEL[$h->setting_key] ?? $h->setting_key,
                'old_value' => $h->old_value,
                'new_value' => $h->new_value,
                'user' => $h->user?->name,
                'created_at' => $h->created_at?->format('d-m-Y H:i'),
            ]);

        return Inertia::render('konfigurasi/pengaturan', [
            'setting' => $setting,
            'riwayat' => $riwayat,
            'infoLog' => $this->infoLog(),
            'can' => [
                'update' => auth()->user()->can('update konfigurasi/pengaturan'),
            ],
        ]);
    }

    public function update(PengaturanRequest $request)
    {
        $this->authorize('update konfigurasi/pengaturan');

        $data = $request->validated();

        foreach (self::FIELD_TEKS as $key) {
            Setting::set($key, $data[$key] ?? null);
        }

        if ($request->hasFile('logo')) {
            $logo = $request->file('logo');
            $this->simpanFile('logo_path', $logo);
            $this->buatFavicon($logo);
        }

        return redirect()
            ->route('konfigurasi.pengaturan.edit')
            ->with('success', 'Pengaturan berhasil disimpan.');
    }

    /**
     * Simpan file baru dengan nama acak, lalu hapus file lama.
     */
    private function simpanFile(string $key, \Illuminate\Http\UploadedFile $file): void
    {
        $lama = Setting::get($key);
        $ekstensi = $file->getClientOriginalExtension();
        $path = $file->storeAs('settings', Str::random(40) . '.' . strtolower($ekstensi), 'public');

        Setting::set($key, $path);

        if ($lama && Storage::disk('public')->exists($lama)) {
            Storage::disk('public')->delete($lama);
        }
    }

    /**
     * Buat favicon 64x64 PNG dari logo yang diunggah. Logo SVG tidak bisa dibaca GD,
     * jadi favicon dihapus dan halaman memakai ikon default.
     */
    private function buatFavicon(\Illuminate\Http\UploadedFile $logo): void
    {
        $lama = Setting::get('favicon_path');

        if (strtolower($logo->getClientOriginalExtension()) === 'svg') {
            Setting::set('favicon_path', null);
            if ($lama && Storage::disk('public')->exists($lama)) {
                Storage::disk('public')->delete($lama);
            }

            return;
        }

        $sumber = imagecreatefromstring(file_get_contents($logo->getRealPath()));
        if ($sumber === false) {
            return;
        }

        $ukuran = 64;
        $lebar = imagesx($sumber);
        $tinggi = imagesy($sumber);
        $skala = min($ukuran / $lebar, $ukuran / $tinggi);
        $baru = max(1, (int) round($lebar * $skala));
        $tinggiBaru = max(1, (int) round($tinggi * $skala));

        $kanvas = imagecreatetruecolor($ukuran, $ukuran);
        imagealphablending($kanvas, false);
        imagesavealpha($kanvas, true);
        imagefill($kanvas, 0, 0, imagecolorallocatealpha($kanvas, 0, 0, 0, 127));
        imagecopyresampled(
            $kanvas, $sumber,
            (int) (($ukuran - $baru) / 2), (int) (($ukuran - $tinggiBaru) / 2), 0, 0,
            $baru, $tinggiBaru, $lebar, $tinggi
        );

        ob_start();
        imagepng($kanvas);
        $isi = ob_get_clean();

        imagedestroy($sumber);
        imagedestroy($kanvas);

        $path = 'settings/' . Str::random(40) . '.png';
        Storage::disk('public')->put($path, $isi);

        Setting::set('favicon_path', $path);

        if ($lama && Storage::disk('public')->exists($lama)) {
            Storage::disk('public')->delete($lama);
        }
    }

    private function urlFile(?string $path): ?string
    {
        return $path ? Storage::disk('public')->url($path) : null;
    }

    /**
     * Besaran log aktivitas untuk ditampilkan sebagai informasi read-only.
     * Ukuran tabel hanya tersedia di PostgreSQL; driver lain menampilkan "Tidak tersedia".
     */
    private function infoLog(): array
    {
        $tabel = 'activity_logs';
        $jumlah = ActivityLog::count();
        $tertua = ActivityLog::min('created_at');
        $terbaru = ActivityLog::max('created_at');

        $ukuranTabel = 'Tidak tersedia';
        if (DB::connection()->getDriverName() === 'pgsql') {
            $bytes = DB::selectOne(
                'SELECT pg_total_relation_size(?) AS bytes',
                [$tabel]
            )->bytes;
            $ukuranTabel = DB::selectOne('SELECT pg_size_pretty(?::bigint) AS ukuran', [$bytes])->ukuran;
        }

        $pathLaravel = storage_path('logs/laravel.log');
        $ukuranFile = file_exists($pathLaravel) ? $this->formatUkuran(filesize($pathLaravel)) : 'Tidak ada file';

        return [
            'jumlah_baris' => $jumlah,
            'ukuran_tabel' => $ukuranTabel,
            'tanggal_tertua' => $tertua ? Carbon::parse($tertua)->format('d-m-Y H:i') : null,
            'tanggal_terbaru' => $terbaru ? Carbon::parse($terbaru)->format('d-m-Y H:i') : null,
            'ukuran_file_log' => $ukuranFile,
        ];
    }

    private function formatUkuran(int $bytes): string
    {
        $satuan = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        $nilai = (float) $bytes;
        while ($nilai >= 1024 && $i < count($satuan) - 1) {
            $nilai /= 1024;
            $i++;
        }

        return round($nilai, 2) . ' ' . $satuan[$i];
    }
}
