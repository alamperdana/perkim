<?php

namespace App\Traits;

use App\Services\ActivityLogger;
use Illuminate\Database\Eloquent\SoftDeletes;

trait LogsActivity
{
    /**
     * Field yang diabaikan saat mencatat perubahan. Termasuk field yang
     * diperbarui otomatis oleh sistem (misalnya saat login atau setiap request),
     * supaya log tidak dipenuhi perubahan yang tidak berarti.
     */
    public function fieldDiabaikanLog(): array
    {
        return [
            'password',
            'remember_token',
            'session_id',
            'last_login',
            'login_ip',
            'last_activity',
            'updated_at',
            'deleted_at',
        ];
    }

    public static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            $model->catatAktivitasModel('created', 'Menambahkan', $model->propertiBersih($model->getAttributes()));
        });

        static::updated(function ($model) {
            $properti = [];
            foreach ($model->getChanges() as $field => $baru) {
                if (in_array($field, $model->fieldDiabaikanLog(), true)) {
                    continue;
                }
                $properti[$field] = [
                    'lama' => $model->getOriginal($field),
                    'baru' => $baru,
                ];
            }

            if (empty($properti)) {
                return;
            }

            $model->catatAktivitasModel('updated', 'Mengubah', $properti);
        });

        static::deleted(function ($model) {
            $model->catatAktivitasModel('deleted', 'Menghapus', $model->propertiBersih($model->getAttributes()));
        });

        // forceDeleted dan restored hanya tersedia pada model yang memakai SoftDeletes.
        if (in_array(SoftDeletes::class, class_uses_recursive(static::class), true)) {
            static::forceDeleted(function ($model) {
                $model->catatAktivitasModel('forceDeleted', 'Menghapus permanen', $model->propertiBersih($model->getAttributes()));
            });

            static::restored(function ($model) {
                $model->catatAktivitasModel('restored', 'Memulihkan', $model->propertiBersih($model->getAttributes()));
            });
        }
    }

    public function catatAktivitasModel(string $event, string $kata, ?array $properti): void
    {
        $nama = $this->name ?? $this->tahun ?? $this->username ?? $this->getKey();
        $label = class_basename($this);

        ActivityLogger::catat(
            event: $event,
            deskripsi: trim("{$kata} {$label} {$nama}"),
            model: $this,
            properti: $properti,
        );
    }

    public function propertiBersih(array $attributes): array
    {
        return collect($attributes)
            ->reject(fn ($nilai, $field) => in_array($field, $this->fieldDiabaikanLog(), true))
            ->all();
    }
}
