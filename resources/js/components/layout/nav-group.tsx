import { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconRenderer } from '@/components/icon-renderer';

export interface NavItem {
    title: string;
    url?: string | null;
    icon?: string | null;
    badge?: string;
    items?: Array<{
        title: string;
        url: string;
    }> | null;
}

export interface NavGroupProps {
    title: string;
    items: NavItem[];
}

export const isInertiaRoute = (href?: string | null): boolean => {
    if (!href || href === '#') return false;
    const path = href.startsWith('/') ? href : `/${href}`;
    const inertiaRoutes = [
        '/',
        '/dashboard',
        '/login',
        '/konfigurasi/menu',
        '/master-data/tahun',
    ];
    return inertiaRoutes.some((r) => path === r || path.startsWith(`${r}/`));
};

export function NavGroup({ title, items }: NavGroupProps) {
    const { state, isMobile } = useSidebar();
    const { url } = usePage();

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold px-2">
                {title}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const key = `${item.title}-${item.url || 'collapsible'}`;

                    if (!item.items || item.items.length === 0) {
                        return <SidebarMenuLink key={key} item={item} currentUrl={url} />;
                    }

                    if (state === 'collapsed' && !isMobile) {
                        return (
                            <SidebarMenuCollapsedDropdown
                                key={key}
                                item={item}
                                currentUrl={url}
                            />
                        );
                    }

                    return <SidebarMenuCollapsible key={key} item={item} currentUrl={url} />;
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function NavBadge({ children }: { children: ReactNode }) {
    return <Badge className="rounded-full px-1.5 py-0 text-[10px] leading-tight">{children}</Badge>;
}

function SidebarMenuLink({ item, currentUrl }: { item: NavItem; currentUrl: string }) {
    const { setOpenMobile } = useSidebar();
    const itemUrl = item.url || '#';
    const isActive = itemUrl === '/' ? currentUrl === '/' : currentUrl.startsWith(itemUrl);
    const isInertia = isInertiaRoute(itemUrl);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
                className="transition-colors"
            >
                {isInertia ? (
                    <Link
                        href={itemUrl}
                        onClick={() => setOpenMobile(false)}
                        className="flex items-center gap-3 w-full"
                    >
                        <IconRenderer name={item.icon} className="size-4 shrink-0" />
                        <span className="truncate flex-1">{item.title}</span>
                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                    </Link>
                ) : (
                    <a
                        href={itemUrl}
                        onClick={() => setOpenMobile(false)}
                        className="flex items-center gap-3 w-full"
                    >
                        <IconRenderer name={item.icon} className="size-4 shrink-0" />
                        <span className="truncate flex-1">{item.title}</span>
                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                    </a>
                )}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function SidebarMenuCollapsible({
    item,
    currentUrl,
}: {
    item: NavItem;
    currentUrl: string;
}) {
    const isChildActive = (item.items || []).some(
        (sub) => sub.url && (sub.url === '/' ? currentUrl === '/' : currentUrl.startsWith(sub.url))
    );

    return (
        <Collapsible asChild defaultOpen={isChildActive} className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isChildActive}
                        className="transition-colors"
                    >
                        <IconRenderer name={item.icon} className="size-4 shrink-0" />
                        <span className="truncate flex-1">{item.title}</span>
                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                        <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {(item.items || []).map((subItem) => {
                            const isSubActive =
                                subItem.url === '/'
                                    ? currentUrl === '/'
                                    : currentUrl.startsWith(subItem.url);
                            const isInertia = isInertiaRoute(subItem.url);

                            return (
                                <SidebarMenuSubItem key={`${subItem.title}-${subItem.url}`}>
                                    <SidebarMenuSubButton asChild isActive={isSubActive}>
                                        {isInertia ? (
                                            <Link
                                                href={subItem.url}
                                                onClick={() => setOpenMobile(false)}
                                                className="w-full truncate"
                                            >
                                                <span>{subItem.title}</span>
                                            </Link>
                                        ) : (
                                            <a
                                                href={subItem.url}
                                                onClick={() => setOpenMobile(false)}
                                                className="w-full truncate"
                                            >
                                                <span>{subItem.title}</span>
                                            </a>
                                        )}
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            );
                        })}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

function SidebarMenuCollapsedDropdown({
    item,
    currentUrl,
}: {
    item: NavItem;
    currentUrl: string;
}) {
    const isChildActive = (item.items || []).some(
        (sub) => sub.url && (sub.url === '/' ? currentUrl === '/' : currentUrl.startsWith(sub.url))
    );

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isChildActive}
                        className="transition-colors"
                    >
                        <IconRenderer name={item.icon} className="size-4 shrink-0" />
                        <span className="truncate flex-1">{item.title}</span>
                        <ChevronRight className="ml-auto size-4" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-52">
                    <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(item.items || []).map((subItem) => {
                        const isInertia = isInertiaRoute(subItem.url);
                        const isSubActive = currentUrl.startsWith(subItem.url);

                        return (
                            <DropdownMenuItem key={`${subItem.title}-${subItem.url}`} asChild>
                                {isInertia ? (
                                    <Link
                                        href={subItem.url}
                                        className={
                                            isSubActive
                                                ? 'bg-accent text-accent-foreground font-medium'
                                                : ''
                                        }
                                    >
                                        {subItem.title}
                                    </Link>
                                ) : (
                                    <a
                                        href={subItem.url}
                                        className={
                                            isSubActive
                                                ? 'bg-accent text-accent-foreground font-medium'
                                                : ''
                                        }
                                    >
                                        {subItem.title}
                                    </a>
                                )}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}
