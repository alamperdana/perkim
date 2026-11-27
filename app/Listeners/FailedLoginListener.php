<?php

namespace App\Listeners;

use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Failed;

class FailedLoginListener
{
    /**
     * Catat login gagal. Hanya username yang dicoba yang disimpan, tanpa password.
     */
    public function handle(Failed $event): void
    {
        if (!ActivityLogger::pertamaKaliUntuk($event)) {
            return;
        }

        $dicoba = $event->credentials['username'] ?? $event->credentials['email'] ?? '-';

        ActivityLogger::catat(
            event: 'login_gagal',
            deskripsi: 'Login gagal untuk ' . $dicoba,
            userId: null,
        );
    }
}
