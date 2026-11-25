<?php 

namespace App\Traits;

use Illuminate\Support\Facades\Route;

trait DatatableHelper
{
    public function basicActions($row): array
    {
        $actions = [];
        $routeName = str_replace('/','.', request()->path());
        // Hanya tampilkan Detail jika route show memang terdaftar (beberapa resource di-except 'show')
        if (Route::has($routeName.'.show')) {
            $actions['Detail'] = route($routeName.'.show', $row->id);
        }
        // Route edit/destroy juga bisa di-except pada resource (contoh: UserController tanpa edit)
        if (user()->can('update '.request()->path()) && Route::has($routeName.'.edit')) {
            $actions['Edit'] = route($routeName.'.edit', $row->id);
        }
        if (user()->can('delete '.request()->path()) && Route::has($routeName.'.destroy')) {
            $actions['Delete'] = route($routeName.'.destroy', $row->id);
        }
        return $actions;
    }
}