import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Calendar,
    Building2,
    Users,
    Layers,
    Shield,
    Database,
    ArrowUpRight,
    CheckCircle2,
} from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageProps } from '@/types';

interface DashboardProps {
    stats?: {
        totalUsers?: number;
        totalPegawai?: number;
        totalTahun?: number;
    };
}

export default function Dashboard({ stats }: DashboardProps) {
    const { auth, sessionData } = usePage<PageProps>().props;

    return (
        <AuthenticatedLayout
            title="Dashboard"
            description="Selamat datang di Sistem Informasi Dinas Perumahan dan Kawasan Permukiman"
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome Card Banner */}
                <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-foreground">
                                    Halo, {auth.user?.name}!
                                </h2>
                                <Badge variant="secondary" className="gap-1 text-xs">
                                    <CheckCircle2 className="size-3 text-emerald-500" />
                                    Online
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Anda login dengan hak akses{' '}
                                <span className="font-semibold text-foreground">
                                    {auth.user?.roles?.[0] || 'User'}
                                </span>{' '}
                                pada Tahun Anggaran{' '}
                                <span className="font-semibold text-primary">
                                    {sessionData?.tahun || new Date().getFullYear()}
                                </span>
                                .
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-xs hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Tahun Anggaran
                            </CardTitle>
                            <div className="p-2 bg-primary/10 text-primary rounded-md">
                                <Calendar className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {sessionData?.tahun || new Date().getFullYear()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Status Anggaran Aktif
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Satuan Kerja
                            </CardTitle>
                            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-md">
                                <Building2 className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-foreground truncate">
                                {sessionData?.nama_satker || 'Dinas PERKIM'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                Kode: {sessionData?.kode_satker || '-'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Basis Data Spasial
                            </CardTitle>
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-md">
                                <Database className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">PostGIS</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                PostgreSQL 16 Terkoneksi
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Keamanan & Sesi
                            </CardTitle>
                            <div className="p-2 bg-violet-500/10 text-violet-600 rounded-md">
                                <Shield className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">Tersertifikasi</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Single Session Protected
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions & Navigation */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Pintasan Cepat</CardTitle>
                            <CardDescription>
                                Akses cepat ke modul-modul yang sering digunakan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-auto p-4 justify-between items-center group"
                                asChild
                            >
                                <Link href="/master-data/tahun">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Calendar className="size-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">Tahun Anggaran</div>
                                            <div className="text-xs text-muted-foreground">
                                                Kelola tahun aktif
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto p-4 justify-between items-center group"
                                asChild
                            >
                                <Link href="/master-data/pegawai">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Users className="size-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">Data Pegawai</div>
                                            <div className="text-xs text-muted-foreground">
                                                Daftar pegawai & pejabat
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto p-4 justify-between items-center group"
                                asChild
                            >
                                <Link href="/konfigurasi/roles">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Shield className="size-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">Hak Akses Role</div>
                                            <div className="text-xs text-muted-foreground">
                                                Konfigurasi role & izin
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto p-4 justify-between items-center group"
                                asChild
                            >
                                <Link href="/konfigurasi/menu">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Layers className="size-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">Navigasi Menu</div>
                                            <div className="text-xs text-muted-foreground">
                                                Pengaturan susunan menu
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Informasi Sistem</CardTitle>
                            <CardDescription>
                                Ringkasan konfigurasi antarmuka dan basis data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm py-2 border-b">
                                <span className="text-muted-foreground">Tema Antarmuka</span>
                                <span className="font-medium text-foreground">
                                    shadcn-admin (Tailwind CSS v4)
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b">
                                <span className="text-muted-foreground">Frontend Stack</span>
                                <span className="font-medium text-foreground">
                                    React 19 + Inertia.js v1
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b">
                                <span className="text-muted-foreground">Backend Framework</span>
                                <span className="font-medium text-foreground">Laravel 10</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2">
                                <span className="text-muted-foreground">Database Engine</span>
                                <span className="font-medium text-foreground">
                                    PostgreSQL 16 with PostGIS 3.4
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
