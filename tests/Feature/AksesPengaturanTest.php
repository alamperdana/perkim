<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AksesPengaturanTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        $role = Role::firstOrCreate(['name' => 'super admin', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    public function test_super_admin_bisa_memberi_akses_pengaturan_ke_role(): void
    {
        $admin = $this->superAdmin();
        $role = Role::create(['name' => 'staf', 'guard_name' => 'web']);
        Permission::create(['name' => 'read konfigurasi/pengaturan', 'guard_name' => 'web']);
        Permission::create(['name' => 'update konfigurasi/pengaturan', 'guard_name' => 'web']);

        $this->actingAs($admin)
            ->put('/konfigurasi/akses-role/' . $role->id, [
                'permissions' => ['read konfigurasi/pengaturan'],
            ])
            ->assertRedirect();

        $this->assertTrue($role->fresh()->hasPermissionTo('read konfigurasi/pengaturan'));
        $this->assertFalse($role->fresh()->hasPermissionTo('update konfigurasi/pengaturan'));
    }

    public function test_user_dengan_role_berizin_bisa_membuka_pengaturan(): void
    {
        $admin = $this->superAdmin();
        $role = Role::create(['name' => 'staf', 'guard_name' => 'web']);
        Permission::create(['name' => 'read konfigurasi/pengaturan', 'guard_name' => 'web']);

        $this->actingAs($admin)
            ->put('/konfigurasi/akses-role/' . $role->id, [
                'permissions' => ['read konfigurasi/pengaturan'],
            ]);

        $staf = User::factory()->create();
        $staf->assignRole($role);

        $this->actingAs($staf)->get('/konfigurasi/pengaturan')->assertOk();
    }

    public function test_user_tanpa_izin_tetap_ditolak_dan_super_admin_selalu_bisa(): void
    {
        $admin = $this->superAdmin();
        $biasa = User::factory()->create();

        $this->actingAs($biasa)->get('/konfigurasi/pengaturan')->assertForbidden();
        $this->actingAs($admin)->get('/konfigurasi/pengaturan')->assertOk();
    }
}
