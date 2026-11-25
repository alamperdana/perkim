# Panduan Upgrade Laravel 10 → 13 dan PHP 8.5

Dokumen ini berisi langkah upgrade bertahap untuk project **perkim**. Upgrade dilakukan lewat Laravel 11 dan 12 karena lompatan langsung tidak aman.

## 1. Kondisi Saat Ini

| Komponen | Saat ini (lock) | Target | Catatan |
|---|---|---|---|
| PHP (composer.json) | `^8.1` | `^8.5` | Laravel 13 butuh PHP 8.3+ |
| PHP (CLI sistem) | 8.2.29 | 8.5.x | Tersedia di `/opt/homebrew/opt/php/bin/php` (8.5.12) |
| laravel/framework | v10.48.29 | `^13.0` | Stable terbaru v13.44.1 |
| inertiajs/inertia-laravel | v1.3.4 | `^3.8` | Frontend sudah `@inertiajs/react ^3.11` |
| laravel/sanctum | v3.3.3 | `^4.5` | |
| laravel/tinker | `^2.8` | `^3.2` | |
| laravel/breeze (dev) | `^1.29` | `^2.4` | |
| phpunit/phpunit (dev) | `^10.1` | `^12.0` | Sesuai panduan Laravel 13 |
| pestphp/pest (dev) | tidak terpasang | tidak wajib | Panduan 13 menyebut `^4.0` jika dipakai |
| nunomaduro/collision (dev) | `^7.0` | `^8.9` | |
| barryvdh/laravel-dompdf | `^3.1` | `^3.1` | Sudah mendukung Laravel 13 |
| barryvdh/laravel-debugbar (dev) | `^3.14` | `^4.4` | |
| laravel/pint (dev) | `^1.0` | `^1.32` | |
| laravel/sail (dev) | `^1.18` | `^1.71` | |
| spatie/laravel-ignition (dev) | `^2.0` | `^2.13` | Butuh PHP 8.4+ |
| spatie/laravel-permission | `^6.9` | `^8.5` | Butuh PHP 8.3+, cek migrasi |
| realrashid/sweet-alert | `^7.2` (terkunci v7.3.0) | `^8.0` | Butuh PHP 8.3+ |
| yajra/laravel-datatables | `^10.0` (terkunci v10.1.0) | `^13.0` | Butuh PHP 8.3+, API berubah besar |
| mavinoo/laravel-batch | `^2.4` | `^3.3` | |
| tightenco/ziggy | `^2.7` | `^2.7` | Sudah kompatibel |
| itsgoingd/clockwork (dev) | `^5.3` | `^5.3` | |
| guzzlehttp/guzzle | `^7.2` | `^7.2` | Tidak wajib naik |
| mockery/mockery (dev) | `^1.4.4` | `^1.6` | |
| fakerphp/faker (dev) | `^1.9.1` | `^1.24` | |

Frontend (`package.json`) sudah versi terbaru: `@inertiajs/react` ^3.11.0, `react` ^19.3.1, `vite` ^6.3.2 (rilis terbaru 8.x), `tailwindcss` ^4.3.5, `typescript` ^7.0.2.

Catatan penting:
- `@inertiajs/react` v3 butuh `inertiajs/inertia-laravel` v3. Backend saat ini v1.3.4, jadi keduanya harus dinaikkan bersama di Tahap 4.
- Vite 6.x masih berjalan. Upgrade ke Vite 8 dibuat terpisah setelah backend stabil.
- Versi di tabel adalah rilis stabil dari Packagist per tanggal dokumen. Jalankan `composer outdated` sebelum eksekusi untuk memastikan.

## 2. Prasyarat

1. **Buat branch dan checkpoint**
   ```bash
   cd /Users/perdana/Work/LaravelApp/perkim
   git status
   git checkout -b upgrade/laravel-13
   ```
2. **Backup database** dengan `mysqldump` atau tool Anda. Simpan di luar folder project.
3. **Catat baseline**: jalankan `php artisan route:list` (saat ini 85 baris) dan simpan outputnya untuk perbandingan.
4. **Gunakan PHP 8.5 untuk project**:
   ```bash
   export PATH="/opt/homebrew/opt/php/bin:$PATH"
   php -v          # harus 8.5.x
   composer --version
   ```
   Ekstensi yang dipakai ada di build ini: `pdo_mysql`, `mbstring`, `gd`, `zip`, `intl`, `bcmath`, `fileinfo`, `openssl`, `curl`, `dom`, `xml`, `tokenizer`, `ctype`, `json`, `sodium`, `exif`.
5. **Update Composer**: `composer self-update`.

## 3. Tahap A: Laravel 10 → 11 (PHP 8.2+)

Referensi: panduan upgrade Laravel 11 (`laravel/docs` branch 11.x).

**Status (hasil eksekusi):**
- Laravel 11.57.2 terpasang. `route:list` 85 baris (sama dengan baseline).
- Inertia **v2.0.28** (bukan v1): v1.3.x tidak mendukung PHP 8.5, dan install dengan PHP 8.5 gagal.
- `yajra/laravel-datatables` **^11.0** dengan seluruh subpaket v11. v12+ butuh Laravel 12+.
- `dompdf` tidak dinaikkan: `sabberworm/php-css-parser` belum mendukung PHP 8.5.
- Verifikasi memakai PHP 8.4.28 (Homebrew `php@8.4`), karena dompdf menahan PHP 8.5.
- Kernel dan Handler dihapus. Middleware pindah ke `bootstrap/app.php`. `RouteServiceProvider` dipertahankan (dipakai konstanta `HOME`), pendaftarannya di `config/app.php` dihapus.
- `phpunit.xml` diarahkan ke database `perkim_test`. Factory `username` ditambahkan.
- **Belum selesai:** 9 test gagal karena komponen Blade Breeze (`input-label`, `primary-button`, `auth-session-status`). Dugaan awal: sudah ada sebelum upgrade, belum diverifikasi.

1. Ubah `composer.json` dan jalankan update. Untuk Laravel 11, naikkan:
   - `laravel/framework` → `^11.0`
   - `nunomaduro/collision` → `^8.1`
   - `laravel/sanctum` → `^4.0`
   - `inertiajs/inertia-laravel` → `^2.0` (v1.3.x tidak mendukung PHP 8.5; v2.0.28 mendukung PHP `^8.1` dan Laravel `^10|^11|^12|^13`)
   - `laravel/tinker` → `^2.9`
   - `barryvdh/laravel-dompdf` ikuti versi yang mendukung Laravel 11
   - `mavinoo/laravel-batch` ikuti versi yang mendukung Laravel 11
   - `laravel/breeze` → `^2.0`
   ```bash
   composer update laravel/framework nunomaduro/collision laravel/sanctum inertiajs/inertia-laravel --with-all-dependencies
   ```
2. **Migrasi struktur aplikasi (Laravel 11 menghapus Kernel dan Handler).** Pindahkan konfigurasi ke `bootstrap/app.php`:
   - `app/Http/Kernel.php`: pindahkan `$middleware`, `$middlewareGroups`, dan `$middlewareAliases` ke `withMiddleware()`.
   - `app/Exceptions/Handler.php`: pindahkan logika ke `withExceptions()`.
   - `app/Console/Kernel.php`: pindahkan `schedule()` ke `routes/console.php` dengan `Schedule::`, dan `commands()` jadi auto-discovery.
   - `app/Providers/RouteServiceProvider.php`: pindahkan definisi route ke `bootstrap/app.php` (`withRouting`) dan rate limiter ke `AppServiceProvider`.
   - Hapus file kernel dan handler setelah isinya dipindahkan.
3. **Sanctum**: publish migrasi dengan `php artisan vendor:publish --tag=sanctum-migrations`, lalu update `config/sanctum.php` sesuai panduan 11.
4. **Spatie once**: jika ada dependency `spatie/once`, hapus. Project ini tidak memakainya (hasil pengecekan).
5. **Validasi**: jalankan `php artisan optimize:clear`, `php artisan route:list` dan bandingkan dengan baseline, lalu jalankan test.
6. Commit: `git commit -am "chore: upgrade ke Laravel 11"`.

## 4. Tahap B: Laravel 11 → 12 (PHP 8.2+)

Referensi: panduan upgrade Laravel 12 (`laravel/docs` branch 12.x).

1. Update dependency:
   - `laravel/framework` → `^12.0`
   - `laravel/sanctum` → `^4.5`
   - `laravel/tinker` → `^2.10`, nanti dinaikkan lagi di Tahap C
   - `inertiajs/inertia-laravel` → `^2.0` (dicek ulang di Tahap D; belum diverifikasi di Packagist)
   - `laravel/breeze` → `^2.4`
   - `spatie/laravel-permission`, `realrashid/sweet-alert`, `mavinoo/laravel-batch`: pilih versi yang mendukung Laravel 12

**Status Tahap B (hasil eksekusi):**
- Laravel **12.74.0** terpasang. Route identik dengan Laravel 11 (method, URI, nama). Jumlah 85.
- `yajra/laravel-datatables` **^12.0** (subpaket v12). `realrashid/sweet-alert` **^8.0** (PHP ^8.3).
- `nunomaduro/collision` **^8.8** dan `phpunit/phpunit` **^11.5** (dev). Collision v8.5 tidak cocok dengan Laravel 12.
- `laravel/breeze` **^2.4**, `laravel/sanctum` **^4.0**, `inertiajs/inertia-laravel` **^2.0**.
- Carbon: pemakaian aman (`setLocale`, `now`, `diffInMinutes`, `diffForHumans`). Tidak ada API yang dihapus.
- Tidak ditemukan pemakaian `HasUuids`, `Storage::`, rule `image`, atau `pagination::`.
- Test: 16 lulus, 9 gagal. Kegagalan sama dengan akhir Tahap A (komponen Blade Breeze), belum diverifikasi penyebab aslinya.
- `spatie/laravel-permission` **^8.5** (8.5.0, PHP ^8.3, Laravel ^12|^13). Lompat dari ^6.9. Migrasi perlu dicek di upgrade notes.
- `mavinoo/laravel-batch` **^3.3** (3.3.0, PHP ^8.1, Laravel ^10|^11|^12|^13).
- Test setelah kedua paket dinaikkan: 16 lulus, 9 gagal (sama seperti sebelumnya).

## 5. Tahap C: Laravel 12 → 13 (PHP 8.3+)

Referensi: panduan upgrade Laravel 13 (`laravel/docs` branch 13.x).

1. Update `composer.json`:
   - `laravel/framework` → `^13.0`
   - `laravel/tinker` → `^3.0`
   - `laravel/boost` → `^2.0` (opsional, hanya untuk bantuan upgrade AI)
   - `phpunit/phpunit` → `^12.0`
   - `pestphp/pest` → `^4.0` (jika dipakai)
   - `php` → `^8.5`
   ```bash
   composer require php:^8.5 --no-update
   composer update laravel/framework laravel/tinker phpunit/phpunit --with-all-dependencies
   ```
2. **Request Forgery Protection (High Impact).** Panduan 13 mengubah perilaku perlindungan CSRF. Periksa `app/Http/Middleware/VerifyCsrfToken.php` dan `config/session.php` sesuai panduan 13 sebelum menjalankan test.
3. **Cache `serializable_classes` (Medium).** Atur `serializable_classes` di `config/cache.php` secara eksplisit (`false` atau daftar class yang diizinkan) sesuai panduan 13.
4. **Database `upsert` pada MySQL/MariaDB (Medium).** Jika memakai `upsert()` (mavinoo/laravel-batch juga dapat memakainya), uji ulang hasilnya. Hasil pencarian project tidak menemukan pemakaian `upsert(` langsung di `app/`, `routes/`, `database/`, dan `config/`.
5. **Session `serialization` (Low).** Cek `config/session.php` dan atur nilai `serialization` sesuai panduan 13.
6. **Cache prefix dan nama cookie session (Low).** Perubahan ini bisa membuat user logout sekali setelah deploy. Jadwalkan saat trafik rendah.
7. **Pagination Bootstrap view names (Low).** Ganti referensi `pagination::default` dan `pagination::simple-default` jika ada.
8. **Global scope di nested where (Low).** Project memakai `onlyTrashed()` di beberapa controller, tetapi tidak di dalam closure `where(...)`. Pemakaian sudah aman, tetapi tetap dicek di tiap controller dengan `grep -rn "where(function" app`.
9. **Symfony polyfill PHP 8.5.** Laravel 13 memakai `symfony/polyfill-php85`. Hindari helper global `array_first()` dan `array_last()` sendiri. Gunakan `Illuminate\Support\Arr::first()`.
10. Jalankan `php artisan optimize:clear`, `php artisan route:list`, lalu test.
11. Commit: `git commit -am "chore: upgrade ke Laravel 13 dan PHP 8.5"`.

## 6. Tahap D: Inertia dan Frontend

1. **Inertia backend**: naikkan `inertiajs/inertia-laravel` ke `^3.8` (sesuai `@inertiajs/react` ^3.11). Panduan upgrade Inertia v3 mengubah middleware, root view, dan konfigurasi SSR. Ikuti panduan resmi: https://inertiajs.com/docs/v3/getting-started/upgrade-guide.
2. Di `app/Http/Middleware/HandleInertiaRequests.php`, periksa perubahan API adapter v3 sebelum menjalankan aplikasi.
3. **Frontend**: pastikan `@inertiajs/react` tetap `^3.11`. Upgrade `vite` ke 8.x dilakukan terpisah dan diuji dengan `npm run build`.
4. Build aset: `npm install && npm run build`, lalu cek halaman utama di browser.

## 7. Komponen Pihak Ketiga

| Paket | Target | Catatan |
|---|---|---|
| spatie/laravel-permission | `^8.5` | Butuh PHP 8.3+. Cek migrasi dan `config/permission.php` pada upgrade notes. |
| realrashid/sweet-alert | `^8.0` | Butuh PHP 8.3+. |
| yajra/laravel-datatables | `^13.0` | Paket dipecah menjadi beberapa paket (buttons, editor, export, html, dll). Semua `App\DataTables\*` perlu dicek. |
| mavinoo/laravel-batch | `^3.3` | Cek API setelah upgrade. |
| barryvdh/laravel-debugbar | `^4.4` | Dev only. |
| spatie/laravel-ignition | `^2.13` | Dev only. |

Upgrade paket pihak ketiga dilakukan **per paket** dengan `composer require paket:^versi --with-all-dependencies`, lalu test sebelum lanjut ke paket berikutnya.

## 8. Checklist Verifikasi

- [ ] `php -v` menunjukkan 8.5.x
- [ ] `composer validate` tanpa error
- [ ] `composer install` di server dengan PHP 8.5
- [ ] `php artisan route:list` sama dengan baseline (kecuali perubahan yang disengaja)
- [ ] `php artisan config:cache`, `route:cache`, `view:cache` berjalan
- [ ] `php artisan test` (atau `vendor/bin/phpunit`) lulus
- [ ] Login, logout, dan halaman Master Data (CRUD, arsip, restore) berfungsi
- [ ] DataTables tampil dan paginasi, sorting, serta export berfungsi
- [ ] Upload file dan PDF (`barryvdh/laravel-dompdf`) berfungsi
- [ ] Notifikasi SweetAlert tampil
- [ ] Permission role (`spatie/laravel-permission`) berfungsi
- [ ] `npm run build` sukses

## 9. Rollback

1. Jika gagal di tahap tertentu, kembali ke commit tahap sebelumnya: `git reset --hard <commit>` di branch upgrade.
2. Pulihkan database dari backup jika migrasi sudah dijalankan.
3. Di server produksi, jalankan deploy dengan `php artisan down` dulu, lalu `php artisan up` setelah verifikasi.

## 10. Catatan Deploy ke Produksi

- Jalankan upgrade di staging dulu, dengan salinan database produksi.
- Gunakan `php artisan down --retry=60` saat migrasi.
- Setelah deploy, jalankan `php artisan optimize:clear` lalu `php artisan optimize`.
- Pantau log `storage/logs/laravel.log` selama 1 jam pertama.

2. **Carbon 3**: Laravel 12 hanya mendukung Carbon 3. Project memakai `Carbon::setLocale('id')` di `app/Providers/AppServiceProvider.php` dan `app/DataTables/MasterData/UserDataTable.php`. Pastikan API yang dipakai masih valid di Carbon 3.
3. **Local filesystem**: default root disk `local` pindah ke `storage/app/private`. Project tidak memakai `Storage::` di `app/` dan `routes/` (hasil pengecekan), tetapi cek ulang `config/filesystems.php` dan file yang memakai disk `local`.
4. **Validasi `image`**: SVG tidak lagi diizinkan secara default. Tambahkan `image:allow_svg` jika dibutuhkan.
5. **Model UUID**: jika ada `HasUuids`, ubah ke `HasVersion4Uuids` bila ingin tetap UUIDv4. Cek dengan `grep -rn HasUuids app`.
6. **Route name**: jika ada nama route yang duplikat, route pertama sekarang yang dipakai.
7. Jalankan `composer update`, `php artisan optimize:clear`, `php artisan route:list`, lalu test.
8. Commit: `git commit -am "chore: upgrade ke Laravel 12"`.

