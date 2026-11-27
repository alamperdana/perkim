import React from 'react';
import { Head, router } from '@inertiajs/react';
import { History } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LogItem {
    id: number;
    created_at: string | null;
    user: string;
    event: string;
    label_event: string;
    deskripsi: string;
    properti: Record<string, unknown> | null;
    ip_address: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface FilterLog {
    tanggal_dari: string;
    tanggal_sampai: string;
    event: string;
    user: string;
    q: string;
}

interface LogActivityProps {
    logs: {
        data: LogItem[];
        links: PaginationLink[];
        total: number;
    };
    daftarUser: { id: number; name: string }[];
    daftarEvent: { value: string; label: string }[];
    filters: FilterLog;
}

const SEMUA = '__semua__';

export default function LogActivityPage({ logs, daftarUser, daftarEvent, filters }: LogActivityProps) {
    const terapkan = (next: Partial<FilterLog>) => {
        router.get('/konfigurasi/log-activity', { ...filters, ...next }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const submitFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        terapkan({
            tanggal_dari: String(form.get('tanggal_dari') ?? ''),
            tanggal_sampai: String(form.get('tanggal_sampai') ?? ''),
            q: String(form.get('q') ?? ''),
        });
    };

    const reset = () => {
        router.get('/konfigurasi/log-activity', {}, { replace: true });
    };

    return (
        <AuthenticatedLayout
            title="Log Aktivitas"
            description="Riwayat aktivitas pengguna. Halaman ini hanya untuk melihat, log tidak bisa diubah atau dihapus."
        >
            <Head title="Log Aktivitas" />

            <Card className="mb-6 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submitFilter} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="grid gap-2">
                            <Label htmlFor="tanggal_dari">Dari tanggal</Label>
                            <Input id="tanggal_dari" name="tanggal_dari" type="date" defaultValue={filters.tanggal_dari} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tanggal_sampai">Sampai tanggal</Label>
                            <Input id="tanggal_sampai" name="tanggal_sampai" type="date" defaultValue={filters.tanggal_sampai} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="event">Jenis aksi</Label>
                            <select
                                id="event"
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                                value={filters.event || SEMUA}
                                onChange={(e) => terapkan({ event: e.target.value === SEMUA ? '' : e.target.value })}
                            >
                                <option value={SEMUA}>Semua</option>
                                {daftarEvent.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="user">User pelaku</Label>
                            <select
                                id="user"
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                                value={filters.user || SEMUA}
                                onChange={(e) => terapkan({ user: e.target.value === SEMUA ? '' : e.target.value })}
                            >
                                <option value={SEMUA}>Semua</option>
                                <option value="sistem">Sistem</option>
                                <option value="login_gagal">Login gagal</option>
                                {daftarUser.map((u) => (
                                    <option key={u.id} value={String(u.id)}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="q">Cari deskripsi</Label>
                            <Input id="q" name="q" defaultValue={filters.q} />
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 sm:col-span-2 lg:col-span-5">
                            <Button type="submit">Terapkan</Button>
                            <Button type="button" variant="outline" onClick={reset}>
                                Atur ulang
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Daftar Aktivitas</CardTitle>
                    <CardDescription>{logs.total} aktivitas ditemukan</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Waktu</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Aksi</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>IP</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            Tidak ada aktivitas pada filter ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {logs.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.created_at}</TableCell>
                                        <TableCell>{item.user}</TableCell>
                                        <TableCell>{item.label_event}</TableCell>
                                        <TableCell className="max-w-96 truncate">{item.deskripsi}</TableCell>
                                        <TableCell>{item.ip_address ?? '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {logs.links.length > 3 && (
                <div className="mt-4 flex flex-wrap justify-end gap-1">
                    {logs.links.map((link, i) => (
                        <Button
                            key={i}
                            size="sm"
                            variant={link.active ? 'default' : 'outline'}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
