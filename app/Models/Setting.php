<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    private const CACHE_KEY = 'settings:all';

    public static function get(string $key, mixed $default = null): mixed
    {
        $nilai = static::allCached()[$key] ?? null;

        return $nilai === null || $nilai === '' ? $default : $nilai;
    }

    /**
     * Simpan nilai pengaturan dan catat riwayat jika nilainya berubah.
     */
    public static function set(string $key, ?string $value): void
    {
        $setting = static::firstOrNew(['key' => $key]);
        $lama = $setting->exists ? $setting->value : null;

        if ($setting->exists && $lama === $value) {
            return;
        }

        $setting->value = $value;
        $setting->save();

        SettingHistory::create([
            'setting_key' => $key,
            'old_value' => $lama,
            'new_value' => $value,
            'user_id' => Auth::id(),
        ]);

        \App\Services\ActivityLogger::catat(
            event: 'pengaturan_diubah',
            deskripsi: "Mengubah pengaturan {$key}",
            properti: [$key => ['lama' => $lama, 'baru' => $value]],
        );

        Cache::forget(self::CACHE_KEY);
    }

    private static function allCached(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, fn () => static::query()
            ->pluck('value', 'key')
            ->all());
    }
}
