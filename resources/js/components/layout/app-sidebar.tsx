import { Link, usePage } from '@inertiajs/react';
import { Building, LayoutDashboard } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar';
import { NavGroup, NavItem } from './nav-group';
import { NavUser } from './nav-user';
import { PageProps } from '@/types';

interface AppSidebarProps {
    collapsible?: 'offcanvas' | 'icon' | 'none';
    variant?: 'sidebar' | 'floating' | 'inset';
}

export function AppSidebar({ collapsible = 'icon', variant = 'sidebar' }: AppSidebarProps) {
    const { props } = usePage<PageProps & { navigation?: Array<{ title: string; items: NavItem[] }> }>();
    const navigation = props.navigation || [];
    const { appName, logoUrl } = props;

    // Selalu pastikan Dashboard ada di daftar navigasi jika tidak ada di DB
    const hasDashboard = navigation.some((group) =>
        group.items.some((item) => item.url === '/dashboard' || item.title.toLowerCase() === 'dashboard')
    );

    const navGroups = hasDashboard
        ? navigation
        : [
              {
                  title: 'Utama',
                  items: [
                      {
                          title: 'Dashboard',
                          url: '/dashboard',
                          icon: 'layout-dashboard',
                      },
                  ],
              },
              ...navigation,
          ];

    return (
        <Sidebar collapsible={collapsible} variant={variant}>
            <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className={`flex aspect-square size-8 items-center justify-center rounded-lg font-bold shadow-sm ${logoUrl ? '' : 'bg-primary text-primary-foreground'}`}>
                        {logoUrl ? <img src={logoUrl} alt="" className="size-8 rounded-lg object-contain" /> : <Building className="size-4" />}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-bold tracking-tight text-foreground">{appName || 'PERKIM'}</span>
                        <span className="truncate text-[11px] text-muted-foreground">
                            Sistem Manajemen Data
                        </span>
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent className="px-2 py-2">
                {navGroups.map((group) => (
                    <NavGroup key={group.title} title={group.title} items={group.items} />
                ))}
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border p-2">
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
