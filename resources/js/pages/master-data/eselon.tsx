import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Layers, Archive, Loader2 } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

interface EselonItem {
    id: number;
    nama_eselon: string;
}

interface EselonProps {
    daftarEselon: EselonItem[];
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

export default function EselonPage({ daftarEselon, can }: EselonProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<EselonItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<EselonItem | null>(null);

    const form = useForm({
        nama_eselon: '',
    });

    const openCreateModal = () => {
        setSelectedItem(null);
        form.reset();
        form.setData({ nama_eselon: '' });
        setIsFormOpen(true);
    };

    const openEditModal = (item: EselonItem) => {
        setSelectedItem(item);
        form.setData({ nama_eselon: item.nama_eselon });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItem) {
            form.put(`/master-data/eselon/${selectedItem.id}`, {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            form.post('/master-data/eselon', {
                onSuccess: () => setIsFormOpen(false),
            });
        }
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        router.delete(`/master-data/eselon/${itemToDelete.id}`, {
            onSuccess: () => setItemToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout
            title="Eselon"
            description="Kelola data eselon"
            headerAction={
                <div className="flex items-center gap-2">
                    {can.create && (
                        <Button size="sm" onClick={openCreateModal} className="gap-1.5">
                            <Plus className="size-4" />
                            <span>Tambah Eselon</span>
                        </Button>
                    )}
                    <Button size="sm" variant="secondary" asChild className="gap-1.5">
                        <Link href="/master-data/eselon-arsip">
                            <Archive className="size-4" />
                            <span>Arsip</span>
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Eselon" />

            <Card className="shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Daftar Eselon</CardTitle>
                    <CardDescription>Eselon yang terdaftar di basis data</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-center">No</TableHead>
                                    <TableHead>Nama Eselon</TableHead>
                                    <TableHead className="text-right w-28 pr-4">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {daftarEselon.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            Belum ada data eselon.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    daftarEselon.map((item, index) => (
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
                                            <TableCell className="text-right pr-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {can.update && (
                                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => openEditModal(item)}>
                                                            <Pencil className="size-3.5" />
                                                            <span className="sr-only">Edit</span>
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
                                                            <span className="sr-only">Hapus</span>
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


            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? 'Edit Eselon' : 'Tambah Eselon'}</DialogTitle>
                        <DialogDescription>Isi nama eselon</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="nama_eselon">Nama Eselon</Label>
                            <Input
                                id="nama_eselon"
                                placeholder="Contoh: Eselon I"
                                value={form.data.nama_eselon}
                                onChange={(e) => form.setData('nama_eselon', e.target.value)}
                                className={form.errors.nama_eselon ? 'border-destructive' : ''}
                            />
                            {form.errors.nama_eselon && <p className="text-xs text-destructive">{form.errors.nama_eselon}</p>}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : selectedItem ? (
                                    'Simpan Perubahan'
                                ) : (
                                    'Tambah'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={Boolean(itemToDelete)} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Eselon?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus eselon{' '}
                            <span className="font-semibold text-foreground">{itemToDelete?.nama_eselon}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}


