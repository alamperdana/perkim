<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MasterData\UserController;
use App\Http\Controllers\Konfigurasi\MenuController;
use App\Http\Controllers\Konfigurasi\RoleController;
use App\Http\Controllers\MasterData\TahunController;
use App\Http\Controllers\Konfigurasi\AksesRoleController;
use App\Http\Controllers\Konfigurasi\AksesUserController;
use App\Http\Controllers\Konfigurasi\PermissionController;
use App\Http\Controllers\MasterData\EselonController;
use App\Http\Controllers\MasterData\PangkatController;
use App\Http\Controllers\MasterData\PegawaiController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('auth')->name('Dashboard');

Route::middleware('auth')->group(function () {
    Route::post('/set-tahun', function (Request $request) {
        $request->validate(['tahun' => 'required|integer']);
        session(['tahun' => (int) $request->input('tahun')]);
        return back()->with('success', 'Tahun anggaran berhasil diubah.');
    })->name('set-tahun');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::group(['prefix' => 'konfigurasi', 'as' => 'konfigurasi.'], function () {
        Route::put('menu/sort', [MenuController::class, 'sort'])->name('menu.sort');
        Route::resource('menu', MenuController::class);
        Route::resource('roles', RoleController::class)->except(['create', 'show', 'edit']);
        Route::resource('permissions', PermissionController::class)->except(['create', 'show', 'edit']);
        Route::get('akses-role', [AksesRoleController::class, 'index'])->name('akses-role.index');
        Route::get('akses-role/{role}/role', [AksesRoleController::class, 'getPermissionsByRole'])->name('akses-role.role');
        Route::put('akses-role/{role}', [AksesRoleController::class, 'update'])->name('akses-role.update');
        Route::get('akses-user', [AksesUserController::class, 'index'])->name('akses-user.index');
        Route::get('akses-user/{user}/user', [AksesUserController::class, 'getPermissionsByUser'])->name('akses-user.user');
        Route::put('akses-user/{user}', [AksesUserController::class, 'update'])->name('akses-user.update');
    });

    Route::group(['prefix' => 'master-data', 'as' => 'master-data.'], function () {
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        Route::resource('tahun', TahunController::class);
        Route::get('tahun-arsip', [TahunController::class, 'archive'])->name('tahun.archive');
        Route::post('tahun/{id}/restore', [TahunController::class, 'restore'])->name('tahun.restore');
        Route::delete('tahun/{id}/force-delete', [TahunController::class, 'destroyPermanent'])->name('tahun.forceDelete');
        Route::resource('pangkat', PangkatController::class)->except(['create', 'show', 'edit']);
        Route::resource('pegawai', PegawaiController::class);
        Route::get('pegawai-arsip', [PegawaiController::class, 'archive'])->name('pegawai.archive');
        Route::post('pegawai/{id}/restore', [PegawaiController::class, 'restore'])->name('pegawai.restore');
        Route::delete('pegawai/{id}/force-delete', [PegawaiController::class, 'destroyPermanent'])->name('pegawai.forceDelete');
        Route::resource('eselon', EselonController::class)->except(['create', 'show', 'edit']);
        Route::get('eselon-arsip', [EselonController::class, 'archive'])->name('eselon.archive');
        Route::post('eselon/{id}/restore', [EselonController::class, 'restore'])->name('eselon.restore');
        Route::delete('eselon/{id}/force-delete', [EselonController::class, 'destroyPermanent'])->name('eselon.forceDelete');
    });
});

Route::get('admin', function () {
    return '<h1>Helo Admin</h1>';
})->middleware(['auth', 'verified', 'role:admin']);

require __DIR__ . '/auth.php';
