<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ActivityLogger
{
    /**
     * Field yang tidak pernah boleh masuk ke log.
     */
    public const FIELD_SENSITIF = ['password', 'remember_token', 'session_id'];

    /**
     * Penanda event yang sudah diproses. Dipakai agar satu objek event
     * (misalnya Login) hanya dicatat sekali walaupun listener-nya terpanggil lebih dari sekali.
     */
    private static ?\WeakMap $sudahDiproses = null;

    /**
     * Mengembalikan true jika objek event ini baru pertama kali diproses.
     */
    public static function pertamaKaliUntuk(object $event): bool
    {
        self::$sudahDiproses ??= new \WeakMap();

        if (isset(self::$sudahDiproses[$event])) {
            return false;
        }

        self::$sudahDiproses[$event] = true;

        return true;
    }

    /**
     * Catat aktivitas. Kegagalan pencatatan tidak boleh menggagalkan aksi utama.
     */
    public static function catat(
        string $event,
        string $deskripsi,
        ?Model $model = null,
        ?array $properti = null,
        ?int $userId = null,
    ): void {
        try {
            $request = request();

            ActivityLog::create([
                'user_id' => $userId ?? Auth::id(),
                'event' => $event,
                'model_type' => $model ? get_class($model) : null,
                'model_id' => $model?->getKey(),
                'deskripsi' => mb_substr($deskripsi, 0, 255),
                'properti' => $properti ? self::bersihkan($properti) : null,
                'ip_address' => $request->ip(),
                'user_agent' => mb_substr((string) $request->userAgent(), 0, 255),
                'created_at' => now(),
            ]);
        } catch (\Throwable $th) {
            Log::error('Gagal mencatat aktivitas: ' . $th->getMessage());
        }
    }

    /**
     * Buang field sensitif dari daftar properti.
     */
    private static function bersihkan(array $properti): array
    {
        return collect($properti)
            ->reject(fn ($nilai, $field) => in_array($field, self::FIELD_SENSITIF, true))
            ->all();
    }
}
