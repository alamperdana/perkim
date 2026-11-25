import React from 'react';
import {
    LayoutDashboard,
    ClipboardCheck,
    Settings,
    BookOpen,
    Users,
    User,
    Shield,
    Key,
    Database,
    Folder,
    FileText,
    Calendar,
    Layers,
    type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
    dashboard: LayoutDashboard,
    'layout-dashboard': LayoutDashboard,
    rekap: ClipboardCheck,
    'clipboard-check': ClipboardCheck,
    konfigurasi: Settings,
    settings: Settings,
    master: Database,
    'master data': Database,
    books: BookOpen,
    book: BookOpen,
    users: Users,
    user: User,
    role: Shield,
    permission: Key,
    calendar: Calendar,
    tahun: Calendar,
    folder: Folder,
    file: FileText,
};

interface IconRendererProps {
    name?: string | null;
    className?: string;
}

export function IconRenderer({ name, className = 'size-4' }: IconRendererProps) {
    if (!name) {
        return <Layers className={className} />;
    }

    const key = name.toLowerCase().trim().replace(/^ti\s+ti-/, '').replace(/^ti-/, '');
    const Icon = iconMap[key] || Layers;

    return <Icon className={className} />;
}
