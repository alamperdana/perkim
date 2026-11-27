# Rencana: Menu Pengaturan Website

## 1. Tujuan

Mengubah identitas website dari halaman admin tanpa menyentuh kode atau `.env`:

- Nama website (menggantikan `APP_NAME` di judul halaman dan sidebar peta)
- Logo website
- Favicon
- Informasi instansi: nama lengkap, deskripsi singkat, alamat, telepon, email, dan teks hak cipta (usulan, lihat bagian 9)
- Riwayat perubahan pengaturan: siapa mengubah apa dan kapan

## 2. Kondisi Saat Ini (hasil pemeriksaan kode)

| Aspek | Kondisi |
|---|---|
| Menu | Submenu **Pengaturan** (`konfigurasi/pengaturan`) sudah ada di `MenuSeeder`, dengan permission create, read, update, delete, sort. Halaman dan route belum ada |
| Judul halaman | `app.blade.php` memakai `config('app.name')`, tidak bisa diubah dari UI |
| Favicon | Tidak ada `<link rel="icon">` di `app.blade.php`. Browser memakai `public/favicon.ico` |
| Logo | Sidebar `index.tsx` memakai ikon `Building` (lucide), bukan file gambar |
| Tabel pengaturan | Belum ada |
| Penyimpanan file | Disk `public` sudah ada, dan `public/storage` sudah ter-link ke `storage/app/public` |
| Pola CRUD | Controller di `App\Http\Controllers\Konfigurasi`, form request di `App\Http\Requests\Konfigurasi`, `$this->authorize(...)`, halaman memakai `AuthenticatedLayout` |
| Helper respons | `responseSuccess()` untuk permintaan JSON di `app/Utils/helper.php` |
| Seeder | `DatabaseSeeder` memanggil `MenuSeeder`, `RoleHasPermissionSeeder`, dan seeder lain secara berurutan |

## 3. Keputusan Desain

1. **Penyimpanan nilai**: tabel `settings` berisi `key` (unik), `value` (text, nullable), dan `timestamps`. Pola key-value dipilih agar pengaturan baru cukup menambah satu baris di seeder, tanpa migrasi baru.
2. **Akses nilai**: model `Setting` dengan `Setting::get($key, $default)` dan `Setting::set($key, $value)`. Hasil dibaca lewat `Cache::rememberForever`, dan cache dihapus saat `set`.
3. **File logo dan favicon**: disimpan di disk `public` (`settings/`). Path disimpan di tabel `settings`, dan URL dibentuk dengan `Storage::disk('public')->url($path)`.
4. **Judul dan favicon di HTML**: `app.blade.php` membaca `app_name` dan `favicon_url`. Jika kosong, fallback ke `config('app.name')` dan `/favicon.ico`.
5. **Logo di sidebar**: ikon `Building` tetap sebagai fallback. Jika logo diisi, tampilkan `<img>` dari `logo_url` di sidebar peta (`index.tsx`) **dan** sidebar admin (`app-sidebar.tsx`). `logo_url` dikirim lewat shared props Inertia.
6. **Route**: `Route::get('konfigurasi/pengaturan', ...)` dan `Route::put('konfigurasi/pengaturan', ...)` di group `konfigurasi.` yang sudah ada. Nama route menjadi `konfigurasi.pengaturan.edit` dan `konfigurasi.pengaturan.update`.
7. **Satu file per jenis**: logo dan favicon masing-masing hanya satu file. Tidak ada varian ukuran atau mode gelap. Unggahan baru menggantikan file lama.
8. **Riwayat perubahan**: tabel `setting_histories` (`setting_key`, `old_value`, `new_value`, `user_id` nullable, `created_at`). Setiap `Setting::set` yang mengubah nilai mencatat satu baris. Halaman pengaturan menampilkan 20 riwayat terakhir. Data riwayat tidak pernah diubah atau dihapus dari UI.

## 4. Komponen yang Akan Dibuat

| Jenis | Nama | Lokasi |
|---|---|---|
| Migrasi | `create_settings_table` | `database/migrations/` |
| Migrasi | `create_setting_histories_table` | `database/migrations/` |
| Model | `Setting` | `app/Models/Setting.php` |
| Model | `SettingHistory` | `app/Models/SettingHistory.php` |
| Controller | `PengaturanController` | `app/Http/Controllers/Konfigurasi/PengaturanController.php` |
| Form request | `PengaturanRequest` | `app/Http/Requests/Konfigurasi/PengaturanRequest.php` |
| Seeder | `SettingSeeder` | `database/seeders/SettingSeeder.php`, nilai awal `app_name` = PERKIM. Ditambahkan ke `DatabaseSeeder` |
| Halaman | `pengaturan.tsx` | `resources/js/pages/konfigurasi/pengaturan.tsx` |
| Test | `PengaturanTest` | `tests/Feature/PengaturanTest.php` |
| Perubahan | `app.blade.php`, `HandleInertiaRequests.php`, `routes/web.php`, `resources/js/pages/peta/index.tsx` (sidebar peta), `resources/js/components/layout/app-sidebar.tsx` (sidebar admin) | |

## 5. Validasi dan Keamanan

- `app_name`: wajib, string, maks 100 karakter.
- `app_full_name`, `description`, `address`, `phone`, `email`, `copyright`: opsional, string. `email` divalidasi dengan `email`, `description` maks 255 karakter, `address` maks 500 karakter, `phone` maks 30 karakter, `copyright` maks 150 karakter.
- `logo`: opsional, `file`, `mimes:png,jpg,jpeg,svg,webp`, maks 2 MB. Tidak memakai aturan `image` karena Laravel menolak SVG dengan aturan itu.
- `favicon`: opsional, `file`, `mimes:png,ico`, maks 512 KB. SVG tidak diterima sebagai favicon (keputusan di bagian 9 nomor 2).
- Halaman dibuka dengan `authorize('read konfigurasi/pengaturan')`, dan simpan dengan `authorize('update konfigurasi/pengaturan')`.
- Saat file baru diunggah, file lama dihapus dari disk `public` agar tidak menumpuk.
- Nama file dibuat acak (`Str::random`), tidak memakai nama asli dari user.

## 6. Langkah Implementasi (urutan)

1. Buat migrasi `settings` dan `setting_histories`.
2. Buat model `Setting` dengan `get`, `set`, dan cache.
3. Buat `SettingSeeder` dan tambahkan ke `DatabaseSeeder`.
4. Buat `PengaturanRequest` dan `PengaturanController` (`edit` dan `update`).
5. Tambahkan route di `routes/web.php`.
6. Buat halaman `pengaturan.tsx` dengan form nama, logo, favicon, dan preview file saat ini.
7. Ubah `app.blade.php` untuk judul dan favicon dinamis.
8. Tambahkan `app_name`, `logo_url`, dan `favicon_url` ke shared props di `HandleInertiaRequests`.
9. Ubah sidebar `index.tsx` dan `app-sidebar.tsx` agar memakai logo jika ada.
10. Tulis test: halaman tampil, simpan nama, unggah logo, validasi tipe file, dan user tanpa permission ditolak.
11. Jalankan `php artisan migrate`, `php artisan test`, `npm run build`, dan `tsc` untuk file yang diubah.

## 7. Batasan dan Asumsi

- `public/favicon.ico` lama tidak dihapus. Hanya dilewati bila favicon di pengaturan sudah diisi.
- Logo dipakai di sidebar peta dan sidebar admin. Ukuran logo di sidebar dibatasi agar tidak merusak layout saat sidebar collapse (icon mode).
- Perubahan favicon baru terlihat setelah browser memuat ulang. Browser sering menyimpan cache favicon.
- Tampilan di browser tidak bisa diuji dari shell. Perlu dicek manual di `https://perkim.test/`.
- `APP_NAME` di `.env` tetap menjadi fallback.

## 8. Keputusan yang Sudah Diambil

- Logo dipakai di sidebar peta **dan** sidebar admin (dikonfirmasi user).
- Logo dan favicon masing-masing satu file (dikonfirmasi user).
- Riwayat perubahan dibuat (dikonfirmasi user).

## 9. Pertanyaan yang Masih Terbuka

1. Siapa yang boleh mengubah? Saat ini diusulkan role admin saja.
2. Format favicon: cukup `.ico`/`.png`, atau juga `.svg`?
3. Setujui daftar pengaturan tambahan di bagian 1 (nama lengkap, deskripsi, alamat, telepon, email, hak cipta), atau kurangi sebagian?

## 10. Hal yang Belum Diperiksa

- **Hasil pemeriksaan database (sudah diverifikasi):**
  - `permission_id` 20 ternyata `read master-data`, bukan permission pengaturan. Seeder lama memberi permission itu ke role `operator` dan `user`. Seeder sudah diubah agar mencari permission lewat nama dan memakai `insertOrIgnore`.
  - Permission pengaturan ada di id 33 sampai 36 (`create`, `read`, `update`, `delete` `konfigurasi/pengaturan`), dibuat oleh `MenuSeeder`. Role `super admin`, `operator`, dan `user` tidak punya permission pengaturan. `super admin` lolos lewat `Gate::before` di `AuthServiceProvider`.
- **Route dan controller sudah dicek.** `PengaturanController` memakai `authorize('read ...')` dan `authorize('update ...')`, sesuai nama permission yang dibuat `MenuSeeder`.
- **Sidebar sudah dicek.** `app-sidebar.tsx` memakai `usePage` dan membaca `appName` serta `logoUrl`. `peta/index.tsx` melakukan hal yang sama.
- **Migrasi `settings` belum dijalankan** di database development saat pemeriksaan ini (status `Pending`).


