import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    username?: string;
    email: string;
    email_verified_at?: string;
    role?: string;
    roles?: Array<{ id: number; name: string }>;
    permissions?: Array<{ id: number; name: string }>;
    avatar?: string;
    session_input?: {
        tahun?: number | string;
        kode_satker?: string;
        satker?: string;
    };
}

export interface MenuItem {
    title: string;
    url?: string;
    icon?: string;
    badge?: string;
    items?: MenuItem[];
}

export interface NavGroup {
    title: string;
    items: MenuItem[];
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    ziggy: Config & { location: string };
    flash: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
    };
    sessionData: {
        tahun?: number | string;
        kode_satker?: string;
        nama_satker?: string;
    };
    daftarTahun?: Array<{ id: number; tahun: number }>;
    appName?: string;
    logoUrl?: string | null;
};

declare global {
    interface Window {
        route: any;
    }
    const route: any;
}
