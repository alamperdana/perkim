<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class RoleHasPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        
        // Cari permission lewat nama, karena id berbeda antar database.
        $grants = [
            'read master-data' => ['operator', 'user'],
        ];

        foreach ($grants as $namaPermission => $namaRole) {
            $permissionId = DB::table('permissions')->where('name', $namaPermission)->value('id');
            $roleIds = DB::table('roles')->whereIn('name', $namaRole)->pluck('id');

            if (! $permissionId) {
                continue;
            }

            $data = $roleIds->map(fn ($roleId) => [
                'permission_id' => $permissionId,
                'role_id' => $roleId,
            ])->all();

            // insertOrIgnore agar seeder aman dijalankan ulang.
            DB::table('role_has_permissions')->insertOrIgnore($data);
        }
    }
}
