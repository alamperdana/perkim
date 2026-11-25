<?php

namespace App\Http\Middleware;

use App\Models\Tahun;
use App\Repositories\MenuRepository;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'kode_satker' => $user->kode_satker,
                    'roles' => $user->roles->pluck('name'),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'navigation' => function () use ($user) {
                if (!$user) {
                    return [];
                }

                $groupedMenus = (new MenuRepository())->getMenus()->groupBy('category');
                $navGroups = [];

                foreach ($groupedMenus as $category => $items) {
                    $navItems = [];
                    foreach ($items as $menu) {
                        if ($user->can('read ' . $menu->url)) {
                            $subItems = [];
                            foreach ($menu->subMenus as $subMenu) {
                                if ($user->can('read ' . $subMenu->url)) {
                                    $subItems[] = [
                                        'title' => $subMenu->name,
                                        'url' => '/' . ltrim($subMenu->url, '/'),
                                    ];
                                }
                            }

                            $navItems[] = [
                                'title' => $menu->name,
                                'url' => count($subItems) === 0 ? '/' . ltrim($menu->url, '/') : null,
                                'icon' => $menu->icon,
                                'items' => count($subItems) > 0 ? $subItems : null,
                            ];
                        }
                    }

                    if (count($navItems) > 0) {
                        $navGroups[] = [
                            'title' => $category,
                            'items' => $navItems,
                        ];
                    }
                }

                return $navGroups;
            },
            'sessionData' => [
                'tahun' => session('tahun', (int) date('Y')),
                'kode_satker' => session('kode_satker', $user?->kode_satker),
                'nama_satker' => session('satker'),
            ],
            'daftarTahun' => fn () => Tahun::orderBy('tahun', 'desc')->get(['id', 'tahun']),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'ziggy' => fn () => array_merge((new Ziggy)->toArray(), [
                'location' => $request->url(),
            ]),
        ]);
    }
}
