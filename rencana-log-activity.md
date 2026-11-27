# Rencana: Log Aktivitas (konfigurasi/log-activity)

## 1. Tujuan

Mencatat dan menampilkan aktivitas pengguna di aplikasi, termasuk siapa melakukan apa dan kapan:

- Tambah data (create)
- Ubah data (update)
- Hapus data (delete, termasuk hapus permanen)
- Login dan logout
- Ubah akses role dan user (permission)
- Ubah pengaturan website

Halaman ini hanya untuk melihat riwayat. Log tidak bisa diubah atau dihapus dari UI.

## 2. Kondisi Saat Ini (hasil pemeriksaan kode)

| Aspek | Kondisi |
|---|---|
| Menu | Submenu **Log Aktifitas** (`konfigurasi/log-activity`) sudah ada di `MenuSeeder`, permission `read` |
| Route dan halaman | Belum ada |
| Paket log | Tidak ada `spatie/laravel-activitylog` di `composer.json`. Dipakai tabel sendiri |
| Riwayat pengaturan | Sudah ada tabel `setting_histories` dengan pola tanpa `updated_at` |
| Event login | `SuccessfulLoginListener` sudah terdaftar di `EventServiceProvider` (hanya flash message) |
| Pola controller | `$this->authorize(...)`, `Inertia::render`, `RoleController` sebagai contoh CRUD |
| Model yang dipantau | `User`, `Role`, `Permission`, `Tahun`, `Menu`, `Setting` |

## 3. Keputusan Desain

1. **Tabel `activity_logs`**: lihat bagian 5. Tanpa `updated_at`, karena log tidak pernah diubah.
2. **Pencatatan otomatis lewat trait `LogsActivity`** di model `User`, `Role`, `Permission`, `Tahun`, dan `Menu`. Trait memakai event `created`, `updated`, `deleted`, `forceDeleted`, dan `restored` dari Eloquent, sehingga controller tidak perlu diubah. `Tahun` memakai soft delete, jadi "hapus" yang dilakukan di UI tercatat sebagai `deleted`, dan "hapus permanen" sebagai `forceDeleted`.
3. **Pencatatan manual** untuk login, logout, dan perubahan akses (`syncPermissions`). Event ini tidak tertangkap event model, jadi dicatat lewat service dari listener atau controller. Untuk akses, log menyimpan daftar permission lama dan baru.
4. **Hanya field yang berubah yang dicatat**: `properti` berisi `['field' => ['lama' => ..., 'baru' => ...]]`. Pada `created`, `properti` berisi nilai baru. Pada `deleted`, `properti` berisi nilai terakhir.
5. **Field sensitif dikecualikan**: `password`, `remember_token`, dan `session_id` tidak pernah masuk ke `properti`.
6. **Deskripsi dibuat dari nama model dan event**, misalnya "Menambahkan Tahun 2027". Deskripsi disusun di trait, bukan dari input user.
7. **Akses halaman** dengan `authorize('read konfigurasi/log-activity')`. Tidak ada tombol ubah atau hapus.
8. **Filter halaman**: tanggal dari dan sampai, user, event, dan pencarian deskripsi. Pagination 25 baris per halaman.
9. **Retensi**: log disimpan tanpa batas waktu dan tidak dihapus otomatis (keputusan user).
10. **Login gagal dicatat** dengan event `login_gagal`. `deskripsi` berisi username yang dicoba, tanpa password. `user_id` diisi `null` karena user belum terautentikasi.
11. **IP address dicatat** di setiap log lewat `request()->ip()`. Jika aplikasi berjalan di belakang proxy, perlu konfigurasi `trustProxies` agar IP asli terbaca. Ini belum diperiksa (lihat bagian 10).
12. **Tanpa fitur export** di versi pertama (keputusan user).
13. **Model `Setting` ikut dicatat** di log aktivitas (keputusan user). Pencatatan dilakukan lewat `ActivityLogger` saat `Setting::set` mengubah nilai, dan tetap disimpan juga di `setting_histories`.
14. **Informasi besaran log di halaman Pengaturan** (keputusan user). Ditampilkan di `PengaturanController::edit` sebagai read-only:
    - Jumlah baris `activity_logs` dan total ukuran tabel dengan indeks: `pg_total_relation_size('activity_logs')`, ditampilkan dengan `pg_size_pretty`. Database aplikasi adalah PostgreSQL (`DB_CONNECTION=pgsql`).
    - Tanggal baris tertua dan terbaru, supaya terlihat seberapa cepat log bertambah.
    - Ukuran file `storage/logs/laravel.log` jika ada. File ini terpisah dari database.
    - Jika driver bukan PostgreSQL, ukuran tabel ditampilkan `Tidak tersedia`, dan jumlah baris tetap dihitung dengan `count()`.
    - Format ukuran dihitung di backend. Halaman tidak menghitung ulang dari data di browser.
15. **Filter halaman log** (keputusan user):
    - **Jenis aksi**: tambah (`created`), ubah (`updated`), hapus (`deleted`), hapus permanen (`forceDeleted`), pulihkan (`restored`), login, login gagal, logout, ubah akses, dan ubah pengaturan.
    - **User pelaku**: dropdown berisi user dari tabel `users`. Pilihan "Sistem" untuk `user_id` `null`, dan "Login gagal" untuk event `login_gagal`.
    - **Rentang tanggal**: `tanggal_dari` dan `tanggal_sampai`. Filter memakai `created_at` dengan batas akhir `23:59:59` pada `tanggal_sampai`. Jika kosong, default adalah 30 hari terakhir.
    - Filter bisa dikombinasikan dan disimpan di query string, supaya halaman bisa dibagikan dan dibuka ulang.


## 4. Komponen yang Akan Dibuat

| Jenis | Nama | Lokasi |
|---|---|---|
| Migrasi | `create_activity_logs_table` | `database/migrations/` |
| Model | `ActivityLog` | `app/Models/ActivityLog.php` |
| Trait | `LogsActivity` | `app/Traits/LogsActivity.php` |
| Service | `ActivityLogger` | `app/Services/ActivityLogger.php` (dipakai untuk login, logout, dan akses) |
| Listener | `SuccessfulLoginListener` (diubah), `LogoutListener` (baru), dan `FailedLoginListener` (baru) untuk event `Failed` | `app/Listeners/` |
| Info besaran log | Method private di `PengaturanController` atau service kecil, dan prop `infoLog` di halaman pengaturan | `app/Http/Controllers/Konfigurasi/PengaturanController.php`, `resources/js/pages/konfigurasi/pengaturan.tsx` |
| Controller | `LogActivityController` | `app/Http/Controllers/Konfigurasi/LogActivityController.php` |
| Halaman | `log-activity.tsx` | `resources/js/pages/konfigurasi/log-activity.tsx` |
| Test | `LogActivityTest` | `tests/Feature/LogActivityTest.php` |
| Perubahan | `EventServiceProvider`, `AksesRoleController`, `AksesUserController`, `routes/web.php`, dan model `User`, `Role`, `Permission`, `Tahun`, `Menu` (pasang trait) | |

## 5. Struktur Data

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint | Primary key |
| `user_id` | bigint, nullable | User pelaku. `null` jika sistem atau user sudah dihapus. `nullOnDelete` |
| `event` | string(30) | Jenis aksi: `created`, `updated`, `deleted`, `forceDeleted`, `restored`, `login`, `login_gagal`, `logout`, `akses_diubah`, `pengaturan_diubah` |
| `model_type` | string(150), nullable | Nama kelas model, misalnya `App\Models\Tahun` |
| `model_id` | bigint, nullable | ID data yang diubah |
| `deskripsi` | string(255) | Kalimat ringkas yang tampil di tabel |
| `properti` | json, nullable | Nilai lama dan baru per field |
| `ip_address` | string(45), nullable | IPv4 atau IPv6, diambil dari `request()->ip()` |
| `user_agent` | string(255), nullable | Browser atau perangkat |
| `created_at` | timestamp | Waktu kejadian |

Indeks: `event`, `created_at`, dan gabungan `model_type` + `model_id`.

## 6. Validasi dan Keamanan

- Halaman dibuka dengan `authorize('read konfigurasi/log-activity')`.
- Filter `tanggal_dari` dan `tanggal_sampai` berformat `Y-m-d`, dan `tanggal_dari` tidak boleh lebih besar dari `tanggal_sampai`.
- `event` hanya menerima nilai dari daftar yang sudah ditentukan.
- Tidak ada route ubah atau hapus untuk log.
- Field sensitif dikecualikan (lihat bagian 3 nomor 5).
- Pencatatan tidak boleh menggagalkan aksi utama. Jika insert log gagal, error dicatat ke log Laravel dan aksi user tetap berjalan.

## 7. Langkah Implementasi (urutan)

1. Buat migrasi `activity_logs`.
2. Buat model `ActivityLog`, trait `LogsActivity`, dan service `ActivityLogger`.
3. Pasang trait di `User`, `Role`, `Permission`, `Tahun`, dan `Menu`.
4. Ubah `SuccessfulLoginListener`, tambah `LogoutListener`, dan daftarkan di `EventServiceProvider`.
5. Catat perubahan akses di `AksesRoleController::update` dan `AksesUserController::update`.
6. Buat `LogActivityController` dengan `index` (filter dan pagination).
7. Tambah route `konfigurasi.log-activity.index` di `routes/web.php`.
8. Buat halaman `log-activity.tsx` dengan tabel, filter, dan pagination.
9. Tulis test: create, update, dan delete tercatat; password tidak tercatat; login tercatat; halaman ditolak tanpa permission; filter tanggal berfungsi.
10. Jalankan `php artisan migrate`, `php artisan test`, dan `npx vite build`.

## 8. Batasan dan Asumsi

- Pencatatan hanya untuk aksi lewat Eloquent. Perubahan lewat SQL langsung atau `DB::table` tidak tercatat.
- `user_id` diisi dari user yang sedang login. Di console atau seeder, pelaku tercatat `null`.
- Login gagal dicatat dengan event `login_gagal`, memakai `user_id` `null` dan username yang dicoba di `deskripsi`.
- Karena log tanpa batas, tabel `activity_logs` akan terus bertambah. Halaman Pengaturan menampilkan besarannya agar pengguna bisa memantau. Pembersihan tetap perlu dilakukan manual jika suatu saat diperlukan.
- Aksi yang tidak memicu event Eloquent per model tidak tercatat otomatis:
  - `MenuController::sort` memakai `BatchFacade::update` (Mavinoo), jadi perlu dicatat manual dengan satu log `updated` untuk urutan menu.
  - `MenuController::destroy` menghapus permission dengan `Permission::whereIn(...)->delete()`. Event `deleted` per permission tidak akan muncul. Penghapusan menu sudah tercatat lewat `Menu`, dan permission yang ikut terhapus dicatat di `properti` lewat `ActivityLogger`.
  - `MenuController::update` mengganti nama permission lewat `save()` per baris, sehingga ini tercatat sebagai `updated` pada `Permission`. Akan membuat banyak log jika URL menu berubah. Perlu diputuskan apakah cukup satu log.
- Pada `updated`, `properti` hanya berisi field yang berubah. Jika tidak ada perubahan, log tidak dibuat.
- Deskripsi memakai Bahasa Indonesia, mengikuti label di halaman.
- Tidak ada fitur ekspor.
- Besaran ukuran tabel bersifat perkiraan, karena dihitung dari metadata database dan bisa berbeda dengan ukuran sebenarnya di disk.

## 9. Pertanyaan yang Masih Terbuka

Sudah diputuskan oleh user:

1. Log disimpan tanpa batas waktu.
2. Login gagal ikut dicatat.
3. Tidak ada fitur export.
4. Model `Setting` ikut dicatat di log aktivitas.
5. IP address dicatat. Besaran log ditampilkan di halaman Pengaturan.

Masih perlu konfirmasi:

1. Apakah "besaran file log" yang dimaksud adalah ukuran tabel `activity_logs` di database, ukuran `storage/logs/laravel.log`, atau keduanya? Rencana ini memakai keduanya.
2. Apakah model `Menu`, `Permission`, dan `Tahun` tetap dicatat, atau cukup `User`, `Role`, dan `Setting`?

## 10. Hal yang Belum Diperiksa

- Belum ada paket log di project. Jika lebih suka `spatie/laravel-activitylog`, struktur ini bisa diganti tanpa mengubah halaman.
- Model `Menu` ada di `app/Models/Konfigurasi/Menu.php` (namespace `App\Models\Konfigurasi`). Trait `LogsActivity` perlu dipasang di sana dengan `use` yang sesuai.
- `EventServiceProvider::shouldDiscoverEvents()` bernilai `true`, sehingga listener baru bisa ditemukan otomatis. Perlu dicek agar tidak ada listener ganda.
- Konfigurasi `trustProxies` di `bootstrap/app.php` belum diperiksa. Jika aplikasi berjalan di belakang proxy atau load balancer, IP yang tercatat bisa berupa IP proxy, bukan IP pengguna.
