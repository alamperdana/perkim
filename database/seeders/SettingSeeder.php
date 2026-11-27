<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Nilai awal pengaturan. Hanya mengisi key yang belum ada,
     * sehingga nilai yang sudah diubah user tidak tertimpa.
     */
    public function run(): void
    {
        $awal = [
            'app_name' => 'PERKIM',
            'app_full_name' => 'Perumahan dan Kawasan Permukiman',
            'description' => 'Sistem Manajemen Data Perumahan dan Kawasan Permukiman',
            'address' => null,
            'phone' => null,
            'email' => null,
            'copyright' => null,
            'logo_path' => null,
            'favicon_path' => null,
        ];

        foreach ($awal as $key => $value) {
            if (!Setting::query()->where('key', $key)->exists()) {
                Setting::query()->create(['key' => $key, 'value' => $value]);
            }
        }
    }
}
