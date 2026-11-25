import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import { ThemeProvider } from '@/context/theme-provider';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { Header } from './header';
import { Main } from './main';
import { PageProps } from '@/types';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    headerAction?: React.ReactNode;
    fixed?: boolean;
    fluid?: boolean;
}

export function AuthenticatedLayout({
    children,
    title,
    description,
    headerAction,
    fixed = false,
    fluid = false,
}: AuthenticatedLayoutProps) {
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
    }, [flash]);

    return (
        <ThemeProvider defaultTheme="light" storageKey="perkim_theme">
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <SidebarInset className="min-h-screen flex flex-col bg-muted/20">
                    <Header fixed={true} />
                    <Main fixed={fixed} fluid={fluid}>
                        {(title || headerAction) && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div>
                                    {title && (
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                            {title}
                                        </h1>
                                    )}
                                    {description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {description}
                                        </p>
                                    )}
                                </div>
                                {headerAction && (
                                    <div className="flex items-center gap-2">{headerAction}</div>
                                )}
                            </div>
                        )}
                        {children}
                    </Main>
                </SidebarInset>
                <Toaster richColors position="top-right" closeButton />
            </SidebarProvider>
        </ThemeProvider>
    );
}

export default AuthenticatedLayout;
