# Dashboard Peta (Leaflet) di Route `/`

Dokumen ini berisi langkah implementasi halaman dashboard peta publik. Halaman tampil di route `/`, tidak memerlukan login, dan menampilkan tombol Login.

> **Mode pengerjaan: DURING.** Selama proses pengerjaan, data peta (geometri GeoJSON dan koordinat lat/lng) disimpan di database PostgreSQL, bukan di file statis `public/geo/`. Tujuannya agar peta tetap bisa dibuka dari data lokal walaupun server tidak bisa diakses. Data di database lokal menjadi sumber utama. File mentah di root hanya dipakai sebagai bahan impor.

## 1. Ringkasan Keputusan

| Aspek | Keputusan | Alasan |
|---|---|---|
| Route | `/` menampilkan dashboard peta | Permintaan pengguna. Redirect ke login di `routes/web.php` dihapus. |
| Sumber data | Tabel `peta_wilayah` di PostgreSQL (`DB_CONNECTION=pgsql`), berisi geometri dan lat/lng | Permintaan pengguna. Data tetap tersedia dari database lokal saat server tidak bisa diakses. |
| Akses | Publik (tanpa middleware `auth`) | Permintaan pengguna. |
| Tombol Login | Mengarah ke `route('login')` | Route login sudah ada di `routes/auth.php`. |
| Wilayah | Hanya `WADMKK === 'Kota Jambi'` | Data Muaro Jambi di file yang sama tidak boleh tampil. |
| Basemap | Konfigurasi terpusat, bisa diganti (OSM, Esri, GIS DPUPR) | Permintaan pengguna. |
| Filter | Kecamatan, lalu kelurahan yang bergantung pada kecamatan | Permintaan pengguna. |

Kondisi repo saat dokumen ini ditulis:
- `leaflet` belum ada di `package.json`. Pencarian `leaflet|maplibre|mapbox|esri` tidak menemukan apa pun.
- `/` saat ini `redirect()->route('login')` di `routes/web.php`.
- `DashboardController::index()` merender `dashboard` dan berada di balik `auth`. Route itu tetap dipakai.
- `BatasKecamatan.geojson` dan `BatasKelurahan.geojson` belum di-track git. `KabKota.geojson` sudah di-track.
- Jumlah fitur Kota Jambi: `KabKota` 1, `BatasKecamatan` 11, `BatasKelurahan` 68.
- Ukuran file: `BatasKelurahan.geojson` sekitar 1,5 MB, `BatasKecamatan.geojson` sekitar 530 KB. Data perlu disaring sebelum dikirim ke browser.

## 2. Simpan Data Wilayah ke Database (hanya Kota Jambi)

Data wilayah disimpan di PostgreSQL agar bisa dibaca dari database lokal. Jangan kirim file mentah ke browser, dan jangan simpan hasil saringan di `public/geo/`.

### 2.1 Migrasi `peta_wilayah`

Buat migrasi: `php artisan make:migration create_peta_wilayah_table`.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint, PK | Konvensi Laravel. |
| `level` | string(20) | `kabkota`, `kecamatan`, atau `kelurahan`. Diberi index. |
| `nama` | string | Dari `NAMOBJ`. |
| `kode_kecamatan` | string, nullable | Dari `KDCPUM` untuk kecamatan. |
| `kode_kelurahan` | string, nullable | Dari `KDEPUM` untuk kelurahan. |
| `nama_kecamatan` | string, nullable | Dari `WADMKC`. Dipakai sebagai induk kelurahan. |
| `nama_kabkota` | string | Dari `WADMKK`. |
| `lat` | decimal(10,7) | Titik tengah (centroid) wilayah, lintang. |
| `lng` | decimal(10,7) | Titik tengah (centroid) wilayah, bujur. |
| `geometry` | jsonb | Geometri fitur GeoJSON, tanpa properti lain. |
| `timestamps` | | Konvensi Laravel. |

Catatan:
- `geometry` memakai `jsonb` karena ekstensi PostGIS belum terpasang dan belum dikonfirmasi di repo.
- `KDEPUM` pada `KabKota` kosong. Jangan mengandalkannya untuk kode kelurahan. Kolom `kode_kelurahan` diisi hanya untuk `level = kelurahan`.
- Lat/lng dihitung dari centroid geometri saat seeding. Nilainya disimpan agar query peta dan verifikasi tidak perlu menghitung ulang.

### 2.2 Model dan Seeder

1. Buat model `App\Models\PetaWilayah` dengan `$fillable` sesuai kolom di atas, dan `casts` untuk `geometry` sebagai `array`.
2. Buat `database/seeders/PetaWilayahSeeder.php`. Seeder ini:
   - Membaca tiga file mentah di root (`KabKota.geojson`, `BatasKecamatan.geojson`, `BatasKelurahan.geojson`).
   - Menyaring fitur `WADMKK === 'Kota Jambi'`.
   - Menghitung lat/lng centroid, lalu menyimpan per baris dengan `upsert` berdasarkan `level` dan `kode` (atau `nama` jika kode kosong), agar seeder aman dijalankan ulang.
3. Daftarkan di `DatabaseSeeder`, atau jalankan manual dengan `php artisan db:seed --class=PetaWilayahSeeder`.
4. File mentah di root tidak dihapus oleh langkah ini. Keputusan menghapus atau mengarsipkannya diserahkan ke pengguna. Jangan commit file mentah tanpa persetujuan.

### 2.3 Cadangan Lokal

Agar data bisa dipulihkan tanpa file mentah, buat perintah `php artisan peta:export` yang menulis isi tabel ke `database/data/peta_wilayah.json`. Perintah `php artisan peta:import` membacanya kembali ke tabel. Dengan begitu, database lokal bisa diisi ulang walaupun file mentah tidak ada. File ekspor ini boleh di-commit karena ukurannya sudah disaring.

Verifikasi: jumlah baris per `level` harus 1 (`kabkota`), 11 (`kecamatan`), dan 68 (`kelurahan`). Jalankan:

```bash
php artisan tinker --execute="echo \App\Models\PetaWilayah::selectRaw('level, count(*) as total')->groupBy('level')->pluck('total','level');"
```


## 3. Pasang Leaflet

```bash
npm install leaflet
npm install -D @types/leaflet
```

Leaflet dipakai langsung, tanpa `react-leaflet`, agar dependensi sedikit. Gaya wajib diimpor di komponen peta: `import 'leaflet/dist/leaflet.css';`. Pastikan `npm run build` tetap lulus.

## 4. Basemap yang Bisa Diganti

Buat `resources/js/lib/map-basemaps.ts`:

```ts
export type BasemapId = 'osm' | 'esri' | 'dpupr';

export interface BasemapConfig {
    id: BasemapId;
    label: string;
    url: string;
    attribution: string;
    maxZoom: number;
    enabled: boolean;
}

export const BASEMAPS: Record<BasemapId, BasemapConfig> = {
    osm: {
        id: 'osm',
        label: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        enabled: true,
    },
    esri: {
        id: 'esri',
        label: 'Esri World Imagery',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
        enabled: true,
    },
    dpupr: {
        id: 'dpupr',
        label: 'GIS DPUPR',
        url: '[URL_TILE_GIS_DPUPR]',
        attribution: '[ATRIBUSI_GIS_DPUPR]',
        maxZoom: 19,
        enabled: false,
    },
};

export const DEFAULT_BASEMAP: BasemapId = 'osm';
```

- `dpupr` memakai placeholder dan `enabled: false`. Selector hanya menampilkan basemap yang `enabled`. Setelah URL resmi DPUPR tersedia, ganti placeholder dan set `enabled: true`.
- Atribusi OSM dan Esri wajib tampil di peta.
- Jika layanan DPUPR berupa WMS, ganti `L.tileLayer` dengan `L.tileLayer.wms` di komponen. Struktur konfigurasi tetap sama.

## 5. Route dan Controller

Ubah `routes/web.php`:

1. Hapus `Route::get('/', function () { return redirect()->route('login'); });`.
2. Tambahkan:

```php
use App\Http\Controllers\PetaController;

Route::get('/', [PetaController::class, 'index'])->name('peta');
```

3. Biarkan `Route::get('/dashboard', ...)->middleware('auth')` tetap ada.

Buat `app/Http/Controllers/PetaController.php`:

```php
<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PetaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('peta/index');
    }
}
```

Controller merender halaman dan menyediakan endpoint data dari database.

```php
use Illuminate\Http\JsonResponse;
use App\Models\PetaWilayah;

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
                'lat' => (float) $w->lat,
                'lng' => (float) $w->lng,
            ],
            'geometry' => $w->geometry,
        ]);

    return response()->json($fitur);
}
```

Tambahkan route: `Route::get('/peta/data', [PetaController::class, 'data'])->name('peta.data');`. Endpoint ini publik, sama seperti `/`. Respons dikelompokkan per `level` di frontend.

Test yang perlu diperiksa karena mengasumsikan `/` mengarah ke login atau redirect:
- `tests/Feature/ExampleTest.php:15` (`$this->get('/')`)
- `tests/Feature/Auth/AuthenticationTest.php:72` (`assertRedirect('/')`). Pastikan ini bukan asersi tentang `/` sebagai redirect setelah login, sebelum diubah.
- `tests/Feature/ProfileTest.php:91` (`assertRedirect('/')`). Periksa konteksnya sebelum diubah.

Tambahkan test baru untuk `/` (200 tanpa login, dan menampilkan komponen `peta/index`).


## 6. Halaman React `peta/index.tsx`

Buat `resources/js/pages/peta/index.tsx`. Halaman ini memakai layout publik sederhana, bukan `AuthenticatedLayout`, karena tamu tidak punya sidebar.

Struktur:
- Header: judul aplikasi, selector basemap, tombol Login (`<Link href={route('login')}>` dengan komponen `Button` dari `resources/js/components/ui/button.tsx`).
- Panel filter: select Kecamatan dan select Kelurahan. Kelurahan nonaktif sampai kecamatan dipilih.
- Area peta: `div` tinggi tetap (misalnya `h-[calc(100vh-8rem)] min-h-[360px]`), agar Leaflet punya ukuran.

Data:
1. Muat data dari `route('peta.data')` (`/peta/data`) dengan `fetch`, lalu kelompokkan fitur per `properties.level` menjadi tiga kelompok: `kabkota`, `kecamatan`, dan `kelurahan`.
2. State `loading`, `error`, dan data. Tampilkan indikator loading, pesan error dengan tombol coba lagi, dan pesan "Data tidak ditemukan" jika array kosong (R-27).
3. Filter kelurahan dengan `feature.properties.WADMKC === kecamatanTerpilih`. Nama kecamatan dicocokkan dari `WADMKC`, karena `BatasKelurahan` menyimpan nama kecamatan di `WADMKC`.
4. Saat filter berubah, hapus layer GeoJSON lama dan gambar ulang. Jangan membuat instance map baru setiap render.

Peta:
- Inisialisasi `L.map` sekali di `useEffect` dengan ref `div`, simpan instance di `useRef`, dan hapus saat unmount:

```tsx
useEffect(() => {
    if (!mapRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: true });
    mapInstanceRef.current = map;
    return () => {
        map.remove();
        mapInstanceRef.current = null;
    };
}, []);
```

`React.StrictMode` memanggil efek dua kali saat development. Cleanup di atas wajib ada agar tidak ada dua peta yang menumpuk.

- Tambahkan `L.tileLayer` dari `BASEMAPS[basemapTerpilih]`. Saat basemap berganti, hapus tile lama dan pasang yang baru. Layer GeoJSON tidak ikut dihapus.
- Gambar fitur `level = kabkota` dengan `L.geoJSON`, lalu `map.fitBounds(layer.getBounds())`.
- Gambar kecamatan sebagai overlay garis tipis. Saat kecamatan dipilih, sorot kecamatan itu dengan gaya berbeda. Kecamatan lain tetap tampil.
- Gambar kelurahan hanya untuk kecamatan terpilih. Jika kecamatan belum dipilih, kelurahan tidak digambar.
- Tambahkan `bindTooltip` berisi `NAMOBJ` pada setiap fitur.
- Sinkronisasi klik peta ke select bersifat opsional untuk versi pertama. Jika dikerjakan, pastikan select dan peta tetap sinkron.

## 7. Aksesibilitas dan Responsif

Sesuai antislop R-03, R-32, dan R-39:
- Select filter punya `<label>` yang terlihat. Ikon dekoratif diberi `aria-hidden="true"`.
- Tombol Login dan tombol coba lagi bisa dijangkau keyboard, punya fokus yang terlihat, dan minimal 44px tinggi di layar kecil.
- Di layar kecil, panel filter di atas peta. Peta tidak terpotong dan tidak ada overflow horizontal.
- Animasi `fitBounds` dimatikan jika `prefers-reduced-motion: reduce` (opsi `animate: false`).
- Atribusi basemap tetap terlihat dan tidak tertutup panel.

Tidak perlu gradien, glow, atau badge dekoratif. Hierarki cukup dengan judul, label, dan satu tombol utama (Login).


## 8. Verifikasi

Jalankan:

```bash
npm run build
php artisan test
php artisan route:list --name=peta
php artisan migrate
php artisan db:seed --class=PetaWilayahSeeder
php artisan peta:export
```

Uji offline: setelah data ada di database, hentikan koneksi ke server (atau jalankan dari database lokal saja), lalu buka `/` dan `/peta/data`. Data kecamatan dan kelurahan harus tetap tampil dari database. Catat hasilnya sebagai bukti.

Cek di browser (`https://perkim.test/`):
1. Tanpa login, `/` menampilkan peta, bukan redirect ke login.
2. Hanya batas Kota Jambi yang tampil. Tidak ada wilayah Muaro Jambi.
3. Pilih kecamatan: hanya kelurahan di kecamatan itu yang digambar.
4. Kosongkan kecamatan: kelurahan hilang dari peta.
5. Ganti basemap OSM dan Esri: tile berganti, atribusi sesuai, batas tetap tampil.
6. Tombol Login membuka `/login`.
7. Console browser tanpa error.
8. Lebar mobile (sekitar 375px): tidak ada overflow horizontal.
9. Navigasi keyboard: Tab mencapai select, selector basemap, dan tombol Login.
10. Matikan jaringan: pesan error muncul dan tombol coba lagi bekerja.

Catat hasil setiap langkah sebagai bukti, bukan klaim.

## 9. Keputusan Terbuka

1. Nilai URL dan atribusi GIS DPUPR. Sampai ada, opsi DPUPR tidak ditampilkan.
2. Apakah file mentah di root (`BatasKecamatan.geojson`, `BatasKelurahan.geojson`) dihapus setelah disaring, atau diarsipkan.
3. Apakah klik fitur di peta wajib menyinkronkan filter (versi pertama bisa dilewati).
4. Apakah dashboard berbasis login (`/dashboard`) tetap dipertahankan sebagai halaman terpisah. Rencana ini mengasumsikan ya.
5. Apakah PostGIS akan dipasang. Jika ya, kolom `geometry` bisa diganti tipe `geometry` dan query spasial bisa dipakai. Rencana ini memakai `jsonb` karena belum ada konfirmasi.
6. Mode offline: data di database lokal dan file `database/data/peta_wilayah.json` menjamin data tidak hilang. Aplikasi tetap perlu dijalankan dari mesin lokal (`php artisan serve` atau Herd/Valet di `perkim.test`) dengan PostgreSQL lokal. Basemap OSM dan Esri tetap butuh internet untuk tile. Jika perlu peta tanpa internet, basemap lokal harus disiapkan terpisah.
