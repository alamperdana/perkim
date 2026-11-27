<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Setting;
use App\Models\SettingHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PengaturanTest extends TestCase
{
    use RefreshDatabase;

    private function userDenganPermission(array $permissions): User
    {
        $user = User::factory()->create();
        foreach ($permissions as $name) {
            $permission = Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
            $user->givePermissionTo($permission);
        }

        return $user;
    }

    public function test_halaman_pengaturan_tampil_untuk_user_berizin(): void
    {
        Storage::fake('public');
        Setting::set('app_name', 'Perkim');
        $user = $this->userDenganPermission(['read konfigurasi/pengaturan', 'update konfigurasi/pengaturan']);

        $response = $this->actingAs($user)->get('/konfigurasi/pengaturan');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('konfigurasi/pengaturan')
            ->where('setting.app_name', 'Perkim')
            ->where('can.update', true)
        );
    }

    public function test_user_tanpa_permission_read_ditolak(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/konfigurasi/pengaturan')->assertForbidden();
    }

    public function test_user_tanpa_permission_update_tidak_bisa_menyimpan(): void
    {
        $user = $this->userDenganPermission(['read konfigurasi/pengaturan']);

        $this->actingAs($user)
            ->put('/konfigurasi/pengaturan', ['app_name' => 'Diubah'])
            ->assertForbidden();

        $this->assertNull(Setting::get('app_name'));
    }

    public function test_simpan_teks_dan_catat_riwayat(): void
    {
        Storage::fake('public');
        Setting::set('app_name', 'Lama');
        $user = $this->userDenganPermission(['read konfigurasi/pengaturan', 'update konfigurasi/pengaturan']);

        $this->actingAs($user)
            ->put('/konfigurasi/pengaturan', [
                'app_name' => 'Baru',
                'email' => 'info@example.com',
            ])
            ->assertRedirect('/konfigurasi/pengaturan');

        $this->assertSame('Baru', Setting::get('app_name'));
        $this->assertSame('info@example.com', Setting::get('email'));
        $this->assertDatabaseHas('setting_histories', [
            'setting_key' => 'app_name',
            'old_value' => 'Lama',
            'new_value' => 'Baru',
            'user_id' => $user->id,
        ]);
    }

    public function test_upload_logo_disimpan_dan_file_lama_dihapus(): void
    {
        Storage::fake('public');
        $lama = 'settings/lama.png';
        Storage::disk('public')->put($lama, 'x');
        Setting::set('logo_path', $lama);
        $user = $this->userDenganPermission(['read konfigurasi/pengaturan', 'update konfigurasi/pengaturan']);

        $this->actingAs($user)
            ->put('/konfigurasi/pengaturan', [
                'app_name' => 'Perkim',
                'logo' => UploadedFile::fake()->image('logo.png'),
            ])
            ->assertRedirect('/konfigurasi/pengaturan');

        $baru = Setting::get('logo_path');
        $this->assertNotNull($baru);
        $this->assertNotSame($lama, $baru);
        Storage::disk('public')->assertExists($baru);
        Storage::disk('public')->assertMissing($lama);
    }

    public function test_upload_logo_svg_diterima(): void
    {
        Storage::fake('public');
        $user = $this->userDenganPermission(['read konfigurasi/pengaturan', 'update konfigurasi/pengaturan']);
        $svg = UploadedFile::fake()->createWithContent('logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>');

        $this->actingAs($user)
            ->put('/konfigurasi/pengaturan', ['app_name' => 'Perkim', 'logo' => $svg])
            ->assertSessionHasNoErrors();

        $this->assertNotNull(Setting::get('logo_path'));
    }

    public function test_simpan_lewat_post_dengan_method_spoofing_put(): void
    {
        Storage::fake('public');
        $user = $this->userDenganPermission(['read konfigurasi/pengaturan', 'update konfigurasi/pengaturan']);

        $this->actingAs($user)
            ->post('/konfigurasi/pengaturan', [
                '_method' => 'put',
                'app_name' => 'Via Form',
                'logo' => UploadedFile::fake()->image('logo.png'),
            ])
            ->assertRedirect('/konfigurasi/pengaturan');

        $this->assertSame('Via Form', Setting::get('app_name'));
        Storage::disk('public')->assertExists(Setting::get('logo_path'));
    }

    public function test_upload_logo_dengan_tipe_tidak_valid_ditolak(): void
    {
        Storage::fake('public');
        $user = $this->userDenganPermission(['read konfigurasi/pengaturan', 'update konfigurasi/pengaturan']);

        $this->actingAs($user)
            ->put('/konfigurasi/pengaturan', [
                'app_name' => 'Perkim',
                'logo' => UploadedFile::fake()->create('logo.pdf', 10, 'application/pdf'),
            ])
            ->assertSessionHasErrors('logo');

        $this->assertNull(Setting::get('logo_path'));
    }

    public function test_favicon_dibuat_otomatis_dari_logo_dengan_ukuran_64(): void
    {
        Storage::fake('public');
        $user = $this->userDenganPermission(['read konfigurasi/pengaturan', 'update konfigurasi/pengaturan']);

        $this->actingAs($user)
            ->put('/konfigurasi/pengaturan', [
                'app_name' => 'Perkim',
                'logo' => UploadedFile::fake()->image('logo.png', 300, 150),
            ])
            ->assertRedirect('/konfigurasi/pengaturan');

        $favicon = Setting::get('favicon_path');
        $this->assertNotNull($favicon);
        Storage::disk('public')->assertExists($favicon);

        [$lebar, $tinggi] = getimagesizefromstring(Storage::disk('public')->get($favicon));
        $this->assertSame(64, $lebar);
        $this->assertSame(64, $tinggi);
    }

    public function test_favicon_lama_dihapus_saat_logo_baru_diunggah(): void
    {
        Storage::fake('public');
        $lama = 'settings/favicon-lama.png';
        Storage::disk('public')->put($lama, 'x');
        Setting::set('favicon_path', $lama);
        $user = $this->userDenganPermission(['read konfigurasi/pengaturan', 'update konfigurasi/pengaturan']);

        $this->actingAs($user)
            ->put('/konfigurasi/pengaturan', [
                'app_name' => 'Perkim',
                'logo' => UploadedFile::fake()->image('logo.png'),
            ]);

        $this->assertNotSame($lama, Setting::get('favicon_path'));
        Storage::disk('public')->assertMissing($lama);
    }

    public function test_logo_svg_mengosongkan_favicon(): void
    {
        Storage::fake('public');
        $lama = 'settings/favicon-lama.png';
        Storage::disk('public')->put($lama, 'x');
        Setting::set('favicon_path', $lama);
        $user = $this->userDenganPermission(['read konfigurasi/pengaturan', 'update konfigurasi/pengaturan']);
        $svg = UploadedFile::fake()->createWithContent('logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>');

        $this->actingAs($user)
            ->put('/konfigurasi/pengaturan', ['app_name' => 'Perkim', 'logo' => $svg])
            ->assertSessionHasNoErrors();

        $this->assertNull(Setting::get('favicon_path'));
        Storage::disk('public')->assertMissing($lama);
    }
}
