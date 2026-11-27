<?php

namespace App\Listeners;

use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Logout;

class LogoutListener
{
    public function handle(Logout $event): void
    {
        if (!$event->user || !ActivityLogger::pertamaKaliUntuk($event)) {
            return;
        }

        ActivityLogger::catat(
            event: 'logout',
            deskripsi: 'Logout ' . $event->user->name,
            userId: $event->user->id,
        );
    }
}
