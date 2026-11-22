# Panduan Instalasi dan Menjalankan Proyek PERKIM di Localhost

Dokumen ini memuat panduan lengkap instalasi proyek Laravel **PERKIM** di lingkungan macOS menggunakan **Laravel Valet** untuk web server dan **Docker** untuk database **PostgreSQL + PostGIS**.

---

> [!WARNING]
> ### Catatan Keamanan Kritis (Security Advisory)
> Pada berkas bawaan repository sebelumnya, ditemukan berkas berbahaya `preinstall.js` yang terhubung dengan `"preinstall": "node preinstall.js"` pada `package.json`. Berkas tersebut memuat kode terselubung (obfuscated & encrypted malware) yang menargetkan pencurian kredensial/kunci kripto.
> 
> **Tindakan yang telah dilakukan:**
> 1. Berkas `preinstall.js` telah dihapus sepenuhnya.
> 2. Skrip `preinstall` pada `package.json` telah dihapus.
> 3. Perintah `npm install` kini berjalan aman dan bersih.

---

## 1. Prasyarat Sistem

Pastikan perangkat Anda telah terpasang:
- **macOS** (Apple Silicon / Intel)
- **PHP 8.2** (dengan ekstensi `pdo_pgsql`, `pdo_mysql`, `mbstring`, `openssl`, `curl`)
- **Composer 2.x**
- **Node.js >= 18** dan **NPM**
- **Docker Desktop** (daemon Docker aktif)
- **Laravel Valet**

---

## 2. Struktur Stack Teknologi

- **Backend:** Laravel 10 (PHP 8.2)
- **Database:** PostgreSQL 16 dengan ekstensi PostGIS 3.4 (via Docker)
- **Frontend:** Blade, Alpine.js, Tailwind CSS, Vite
- **Web Server Local:** Laravel Valet (Nginx + PHP-FPM)

---

## 3. Langkah Instalasi Lengkap

### Langkah 1: Mempersiapkan Berkas Environment (`.env`)

Salin berkas `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Pastikan pengaturan database dan URL aplikasi pada `.env` telah sesuai:

```env
APP_NAME=PERKIM
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://perkim.test

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=perkim
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

### Langkah 2: Menginstal Dependensi PHP (Composer)

Jalankan perintah berikut untuk mengunduh seluruh dependensi backend:

```bash
composer install
```

Generate application key Laravel:

```bash
php artisan key:generate
```

### Langkah 3: Menjalankan Database PostGIS dengan Docker

Berkas `docker-compose.yml` telah disediakan pada root proyek. Untuk mengaktifkan container PostgreSQL + PostGIS:

```bash
docker compose up -d
```

Untuk memverifikasi container telah berjalan normal:

```bash
docker ps
```

Anda juga dapat menguji ekstensi PostGIS dengan perintah:

```bash
docker exec perkim_postgis psql -U postgres -d perkim -c "SELECT PostGIS_Version();"
```

### Langkah 4: Menjalankan Migrasi dan Seeder Database

Setelah container PostGIS siap menerima koneksi, jalankan migrasi tabel beserta data awal:

```bash
php artisan migrate --seed
```

### Langkah 5: Membuat Symbolic Link Storage

Hubungkan direktori publik ke direktori storage aplikasi:

```bash
php artisan storage:link
```

### Langkah 6: Menginstal Dependensi Frontend dan Kompilasi Asset

Instal pustaka JavaScript / CSS dan lakukan kompilasi:

```bash
npm install
npm run build
```

Untuk kebutuhan pengembangan interaktif (hot-reload):

```bash
npm run dev
```

### Langkah 7: Konfigurasi Laravel Valet

Karena proyek berada di dalam folder yang telah diparkir oleh Valet (misalnya `~/Work/LaravelApp`), domain lokal akan otomatis aktif di:

```text
http://perkim.test
```

Jika domain belum terhubung secara otomatis, masuk ke direktori proyek dan jalankan:

```bash
valet link perkim
```

Jika ingin mengamankan dengan sertifikat SSL lokal (HTTPS):

```bash
valet secure perkim
```

---

## 4. Kredensial Login Default (Hasil Seeder)

Database seeder telah menyiapkan akun pengguna awal berikut:

| Role | Username | Email | Password |
|---|---|---|---|
| Super Admin | `admin` | `perdana.alam@gmail.com` | `Jangandibuka` |
| Operator PBJAP | `op_pbjap` | `op_pbjap@gmail.com` | `123` |
| Operator PBJAP | `pbjap` | `pbjap@gmail.com` | `123` |

---

## 5. Perintah Operasional Docker PostGIS

Berikut adalah perintah praktis untuk mengelola database Docker:

- **Menjalankan container di latar belakang:**
  ```bash
  docker compose up -d
  ```

- **Melihat log container database:**
  ```bash
  docker compose logs -f postgis
  ```

- **Menghentikan container tanpa menghapus data:**
  ```bash
  docker compose stop
  ```

- **Menyalakan kembali container yang dihentikan:**
  ```bash
  docker compose start
  ```

- **Menghentikan dan menghapus container (data volume tetap aman):**
  ```bash
  docker compose down
  ```

- **Mengakses CLI PostgreSQL (`psql`):**
  ```bash
  docker exec -it perkim_postgis psql -U postgres -d perkim
  ```

---

## 6. Pemecahan Masalah (Troubleshooting)

1. **Port 5432 sudah terpakai oleh PostgreSQL lokal:**
   - Hentikan PostgreSQL lokal dengan `brew services stop postgresql@15` atau ubah `POSTGIS_PORT` pada `.env` dan `docker-compose.yml` ke port lain (misalnya `5433`).

2. **Koneksi Database Gagal saat `php artisan migrate`:**
   - Pastikan container Docker menyala (`docker ps`).
   - Pastikan driver PHP `pdo_pgsql` aktif dengan menjalankan `php -m | grep pdo_pgsql`.

3. **Tampilan CSS/JS tidak termuat:**
   - Jalankan `npm run build` untuk mengompilasi asset Vite ke dalam folder `public/build`.
