import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArchiveRestore, Trash2, Layers } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EselonArsipItem {
    id: number;
    nama_eselon: string;
    deleted_at: string | null;
}

interface EselonArsipProps {
    daftarArsip: EselonArsipItem[];
    can: {
        update: boolean;
        delete: boolean;
    };
}

export default function EselonArsipPage({ daftarArsip, can }: EselonArsipProps) {
    const [itemToDelete, setItemToDelete] = useState<EselonArsipItem | null>(null);

    const handleRestore = (item: EselonArsipItem) => {
        router.post(`/master-data/eselon/${item.id}/restore`);
    };

    const handleForceDelete = () => {
        if (!itemToDelete) return;
        router.delete(`/master-data/eselon/${itemToDelete.id}/force-delete`, {
            onSuccess: () => setItemToDelete(null),
        });
    };

    const formatTanggal = (value: string | null) => {
        if (!value) return '-';
        return new Date(value).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };


    return (
        <AuthenticatedLayout
            title="Arsip Eselon"
            description="Data eselon yang dihapus sementara dan dapat dipulihkan"
            headerAction={
                <Button size="sm" variant="outline" asChild className="gap-1.5">
                    <Link href="/master-data/eselon">
                        <ArrowLeft className="size-4" />
                        <span>Kembali</span>
                    </Link>
                </Button>
            }
        >
            <Head title="Arsip Eselon" />

            <Card className="shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Daftar Arsip</CardTitle>
                    <CardDescription>Eselon yang sudah diarsipkan</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-center">No</TableHead>
                                    <TableHead>Nama Eselon</TableHead>
                                    <TableHead>Dihapus pada</TableHead>
                                    <TableHead className="text-right w-28 pr-4">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {daftarArsip.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            Tidak ada data arsip tersedia.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    daftarArsip.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                        <Layers className="size-4" />
                                                    </div>
                                                    <span className="font-semibold text-sm">{item.nama_eselon}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatTanggal(item.deleted_at)}</TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {can.update && (
                                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => handleRestore(item)}>
                                                            <ArchiveRestore className="size-3.5" />
                                                            <span className="sr-only">Pulihkan</span>
                                                        </Button>
                                                    )}
                                                    {can.delete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() => setItemToDelete(item)}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                            <span className="sr-only">Hapus permanen</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={Boolean(itemToDelete)} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Permanen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Data <span className="font-semibold text-foreground">{itemToDelete?.nama_eselon}</span> akan
                            dihapus permanen dan tidak bisa dipulihkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleForceDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Hapus Permanen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
