import { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Calendar, Building2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeSwitch } from '@/components/theme-switch';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageProps } from '@/types';

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
    fixed?: boolean;
    children?: React.ReactNode;
};

export function Header({ className, fixed = true, children, ...props }: HeaderProps) {
    const { sessionData, daftarTahun } = usePage<PageProps>().props;
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            setOffset(document.body.scrollTop || document.documentElement.scrollTop);
        };
        document.addEventListener('scroll', onScroll, { passive: true });
        return () => document.removeEventListener('scroll', onScroll);
    }, []);

    const handleChangeTahun = (tahun: number) => {
        // Option to switch year or reload page with new year session
        router.post(
            '/set-tahun',
            { tahun },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
            }
        );
    };

    return (
        <header
            className={cn(
                'z-40 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
                fixed && 'sticky top-0',
                offset > 10 ? 'shadow-sm' : '',
                className
            )}
            {...props}
        >
            <div className="flex h-full items-center gap-3 px-4 sm:gap-4 justify-between">
                <div className="flex items-center gap-3">
                    <SidebarTrigger variant="outline" className="size-8" />
                    <Separator orientation="vertical" className="h-6" />

                    {sessionData?.nama_satker && (
                        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <Building2 className="size-3.5 text-primary" />
                            <span className="truncate max-w-[280px]">
                                {sessionData.nama_satker}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Tahun Anggaran Badge / Dropdown */}
                    {sessionData?.tahun && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border shadow-xs">
                                    <Calendar className="size-3.5 text-primary" />
                                    <span>TA: {sessionData.tahun}</span>
                                    {daftarTahun && daftarTahun.length > 1 && (
                                        <ChevronDown className="size-3 opacity-60 ml-0.5" />
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            {daftarTahun && daftarTahun.length > 1 && (
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuLabel className="text-xs">
                                        Pilih Tahun Anggaran
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {daftarTahun.map((t) => (
                                        <DropdownMenuItem
                                            key={t.id}
                                            onClick={() => handleChangeTahun(t.tahun)}
                                            className={
                                                sessionData.tahun === t.tahun
                                                    ? 'bg-accent text-accent-foreground font-semibold'
                                                    : ''
                                            }
                                        >
                                            Tahun {t.tahun}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                    )}

                    <ThemeSwitch />
                    {children}
                </div>
            </div>
        </header>
    );
}
