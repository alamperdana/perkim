<?php

namespace App\Repositories;

use App\Models\Konfigurasi\Menu;

class MenuRepository
{
    public function getMainMenuWithPermissions()
    {
        return Menu::with('permissions', 'subMenus.permissions')->whereNull('main_menu_id')->get();
    }

    /**
     * Bentuk pohon menu untuk halaman Inertia (camelCase subMenus, hanya field yang dipakai).
     */
    public function getMenuTreeForAkses()
    {
        return $this->getMainMenuWithPermissions()->map(function ($menu) {
            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'permissions' => $this->mapPermissions($menu->permissions),
                'subMenus' => $menu->subMenus->map(function ($sub) {
                    return [
                        'id' => $sub->id,
                        'name' => $sub->name,
                        'permissions' => $this->mapPermissions($sub->permissions),
                    ];
                })->values()->all(),
            ];
        })->values()->all();
    }

    private function mapPermissions($permissions)
    {
        return $permissions->map(fn ($p) => ['id' => $p->id, 'name' => $p->name])->values()->all();
    }

    public function getMainMenus()
    {
        return Menu::whereNull('main_menu_id')->select('id', 'name')->get()
        ->flatMap(function($item) {
            return [$item->name => $item->id];
        });
    }

    public function getMenus()
    {
        return Menu::active()->with(['subMenus' => function($query) {
            $query->orderBy('orders');
        }])->whereNull('main_menu_id')
        ->orderBy('orders')
        ->get();
    }
}