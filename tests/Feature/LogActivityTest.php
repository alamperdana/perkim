<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Setting;
use App\Models\Tahun;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogActivityTest extends TestCase
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

    public function test_create_update_delete_tercatat(): void
    {
        $user = $this->userDenganPermission([]);
        $this->actingAs($user);

        $tahun = Tahun::create(['tahun' => 2027]);
        $tahun->update(['tahun' => 2028]);
        $tahun->delete();

        $this->assertDatabaseHas('activity_logs', ['event' => 'created', 'model_type' => Tahun::class, 'model_id' => $tahun->id]);
        $this->assertDatabaseHas('activity_logs', ['event' => 'updated', 'model_type' => Tahun::class, 'model_id' => $tahun->id]);
        $this->assertDatabaseHas('activity_logs', ['event' => 'deleted', 'model_type' => Tahun::class, 'model_id' => $tahun->id]);
    }

    public function test_perubahan_hanya_mencatat_field_yang_berubah(): void
    {
        $tahun = Tahun::create(['tahun' => 2027]);
        $tahun->update(['tahun' => 2028]);

        $log = ActivityLog::where('event', 'updated')->firstOrFail();
        $this->assertSame(['tahun' => ['lama' => 2027, 'baru' => 2028]], $log->properti);
    }

    public function test_password_tidak_pernah_tercatat(): void
    {
        $user = User::factory()->create(['password' => 'rahasia-banget']);
        $user->update(['password' => 'baru-rahasia']);

        $this->assertSame(0, ActivityLog::whereJsonContainsKey('properti->password')->count());
        $this->assertStringNotContainsString('rahasia', (string) ActivityLog::pluck('properti')->toJson());
    }

    public function test_login_tercatat(): void
    {
        $user = User::factory()->create(['username' => 'tester', 'password' => 'secret123']);

        $this->post('/login', [
            'login' => 'tester',
            'password' => 'secret123',
            'tahun' => Tahun::create(['tahun' => 2027])->tahun,
        ]);

        $this->assertDatabaseHas('activity_logs', ['event' => 'login', 'user_id' => $user->id]);
    }

    public function test_satu_login_hanya_tercatat_satu_kali(): void
    {
        User::factory()->create(['username' => 'tester', 'password' => 'secret123']);
        ActivityLog::query()->delete();

        $this->post('/login', [
            'login' => 'tester',
            'password' => 'secret123',
            'tahun' => Tahun::create(['tahun' => 2027])->tahun,
        ]);

        $this->assertSame(1, ActivityLog::where('event', 'login')->count());
    }

    public function test_login_gagal_tercatat_tanpa_password(): void
    {
        User::factory()->create(['username' => 'tester', 'password' => 'secret123']);

        $this->post('/login', [
            'login' => 'tester',
            'password' => 'salah-sekali',
            'tahun' => Tahun::create(['tahun' => 2027])->tahun,
        ]);

        $log = ActivityLog::where('event', 'login_gagal')->firstOrFail();
        $this->assertNull($log->user_id);
        $this->assertStringContainsString('tester', $log->deskripsi);
        $this->assertStringNotContainsString('salah-sekali', $log->deskripsi);
    }

    public function test_halaman_log_ditolak_tanpa_permission(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/konfigurasi/log-activity')->assertForbidden();
    }

    public function test_halaman_log_tampil_dan_filter_tanggal_berfungsi(): void
    {
        $user = $this->userDenganPermission(['read konfigurasi/log-activity']);
        $this->actingAs($user);
        ActivityLog::query()->delete();

        $lama = ActivityLog::create([
            'event' => 'created',
            'deskripsi' => 'Lama',
            'created_at' => now()->subDays(60),
        ]);
        $baru = ActivityLog::create([
            'event' => 'created',
            'deskripsi' => 'Baru',
            'created_at' => now(),
        ]);

        $response = $this->get('/konfigurasi/log-activity');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('konfigurasi/log-activity')
            ->has('logs.data', 1)
            ->where('logs.data.0.deskripsi', 'Baru')
        );

        $this->get('/konfigurasi/log-activity?tanggal_dari=' . now()->subDays(90)->format('Y-m-d')
            . '&tanggal_sampai=' . now()->format('Y-m-d'))
            ->assertInertia(fn ($page) => $page->has('logs.data', 2));
    }

    public function test_pengaturan_diubah_tercatat(): void
    {
        Setting::set('app_name', 'Perkim');

        $this->assertDatabaseHas('activity_logs', ['event' => 'pengaturan_diubah']);
    }
}
