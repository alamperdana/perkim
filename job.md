# Rencana Kerja: Tampilan shadcn-admin untuk perkim

Terakhir diperbarui: 16/11/2026

## Tujuan
Mengganti tampilan, JS, dan CSS perkim dengan gaya https://github.com/satnaing/shadcn-admin. Salinan template ada di `/templates`.

## Kondisi saat ini

### perkim (Laravel 10)
- Blade dengan layout `resources/views/layouts/{app,style,script,menu,navbar,footer}.blade.php`.
- Tema Sneat/Materio (Bootstrap 5): asset di `public/assets/vendor`, `public/assets/css`, `public/assets/js`.
- jQuery, DataTables (yajra), iziToast, SweetAlert, dan modal Bootstrap (`#modal_action`).
- Vite dan Tailwind 3 sudah terpasang, tetapi hampir tidak dipakai (hanya `resources/css/app.css` dan `resources/js/app.js` dengan Alpine).
- Halaman di `resources/views/pages/{konfigurasi,master-data,dashboard}`, auth di `resources/views/auth`.

### templates (shadcn-admin v2.2.1)
- Vite + React 19 + TypeScript, Tailwind 4, Radix UI, TanStack Router/Query/Table, Clerk, Zustand.
- Berupa SPA. Template ini tidak bisa dipakai langsung di Blade.

## Pilihan pendekatan (belum diputuskan)

| Opsi | Isi | Effort | Risiko |
|---|---|---|---|
| A. Inertia.js + React | Laravel tetap jadi backend. Blade ditulis ulang jadi komponen React dari template. | Besar | Sedang |
| B. Restyle Blade | Blade, jQuery, dan DataTables dipertahankan. CSS/JS baru meniru tampilan shadcn. | Kecil sampai sedang | Rendah |
| C. SPA terpisah | Template React berjalan sendiri. Laravel jadi REST API (Sanctum). | Paling besar | Tinggi |

Rekomendasi: **B** kalau tujuannya hanya tampilan. **A** kalau Anda ingin memakai komponen React template apa adanya.

## Langkah umum (semua opsi)
1. Backup project, lalu buat branch baru. Folder ini belum berupa repo git, jadi jalankan `git init` dulu.
2. Putuskan opsi A, B, atau C.
3. Hapus asset tema lama setelah semua halaman dimigrasi.
4. Hapus `templates/` dari repo setelah komponen yang dibutuhkan disalin.

## Rencana per opsi

### Opsi A: Inertia.js + React
1. `composer require inertiajs/inertia-laravel` dan `php artisan inertia:middleware`, lalu daftarkan di `app/Http/Kernel.php`.
2. `npm i react react-dom @inertiajs/react @vitejs/plugin-react typescript`.
3. Upgrade ke Tailwind 4 dengan `@tailwindcss/vite`. Hapus `tailwind.config.js` dan `postcss.config.js` lama.
4. Salin dari `templates/src`: `components/ui`, `components/layout`, `lib`, `styles`, `hooks`, `context`. Salin juga `components.json` dan alias `@` di `vite.config.js` dan `tsconfig`.
5. Buat `resources/views/app.blade.php` (root Inertia) dan `resources/js/app.tsx`.
6. Buat ulang sidebar dari `menu.blade.php` (menu dinamis dari DB, spatie permission) menjadi data yang dikirim lewat shared props.
7. Ubah controller dari `return view(...)` menjadi `Inertia::render(...)`. Ganti DataTables yajra dengan TanStack Table (endpoint JSON server-side) atau pakai DataTables lewat wrapper.
8. Migrasi halaman satu per satu: auth, dashboard, konfigurasi (menu, role, permission, akses), master-data (pegawai, pangkat, eselon, tahun, user).
9. Ganti iziToast dan SweetAlert dengan `sonner`. Ganti modal Bootstrap dengan Dialog Radix.
10. Hapus bagian template yang tidak dipakai: Clerk, chats, apps, tasks, dan data faker.

### Opsi B: Restyle Blade
1. Buat `resources/css/shadcn.css` dari variabel di `templates/src/styles` (oklch, radius, mode gelap). Ambil juga font dan ikon.
2. Perbarui `layouts/app.blade.php` jadi sidebar collapsible + header + konten, mengikuti struktur template.
3. Tulis ulang `menu.blade.php` dan `navbar.blade.php` dengan HTML/Tailwind, dan tangani toggle sidebar dengan Alpine.
4. Buat komponen Blade (`resources/views/components/ui/*`): button, card, input, select, badge, dialog, table.
5. Restyle DataTables, iziToast, dan modal Bootstrap agar cocok dengan tema (override CSS).
6. Hapus bootstrap/core.css lama setelah semua halaman diperiksa. Ini langkah yang paling berisiko, karena kelas Bootstrap dipakai di banyak halaman.
7. Uji setiap halaman, terutama form modal dan tabel.

### Opsi C: SPA terpisah
1. Siapkan route API dengan `auth:sanctum`, resource controller, dan API resource untuk semua modul.
2. Jalankan template sebagai project terpisah (`pnpm i && pnpm dev`) dan sambungkan lewat axios.
3. Ganti Clerk dengan login Sanctum.
4. Atur CORS dan CSRF di `config/cors.php` dan `config/sanctum.php`.
5. Port seluruh halaman dan hak akses menu.

## Hal yang perlu diperhatikan
- Tailwind perkim masih v3, sedangkan template memakai v4. Ini wajib diupgrade untuk opsi A.
- Menu dinamis dan permission (spatie) harus tetap berfungsi di semua opsi.
- Template memakai TypeScript dan React. Pastikan Anda siap memelihara kode ini.
- File sampah yang bisa dibersihkan: `login.blade copy.php`, `layouts/old/*`, `instalation.md` (duplikat `installation.md`).

## Status
- [x] Analisis struktur perkim dan template
- [ ] Memilih pendekatan (A / B / C)
- [ ] Backup dan inisialisasi git
- [ ] Implementasi
- [ ] Pengujian semua halaman
- [ ] Pembersihan asset lama dan folder `templates/`
