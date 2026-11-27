<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\Session;

class SuccessfulLoginListener
{
    /**
     * Handle the event.
     *
     * @param  \Illuminate\Auth\Events\Login  $event
     * @return void
     */
    public function handle(Login $event)
    {
        // alert()->success('Login Berhasil', 'Selamat datang, ' . $event->user->name . '!');
        Session::flash('success', 'Selamat datang, ' . $event->user->name . '!');

        if (!ActivityLogger::pertamaKaliUntuk($event)) {
            return;
        }

        ActivityLogger::catat(
            event: 'login',
            deskripsi: 'Login ' . $event->user->name,
            userId: $event->user->id,
        );
    }
}
