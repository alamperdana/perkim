<?php

namespace Tests\Feature\Auth;

use App\Models\Tahun;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();
        Tahun::create(['tahun' => 2025]);

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
            'tahun' => 2025,
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(RouteServiceProvider::HOME);
    }

    public function test_users_can_authenticate_using_username(): void
    {
        $user = User::factory()->create();
        Tahun::create(['tahun' => 2025]);

        $this->post('/login', [
            'login' => $user->username,
            'password' => 'password',
            'tahun' => 2025,
        ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();
        Tahun::create(['tahun' => 2025]);

        $this->post('/login', [
            'login' => $user->email,
            'password' => 'wrong-password',
            'tahun' => 2025,
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
