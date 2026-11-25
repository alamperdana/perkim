import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

interface TahunItem {
    id: number;
    tahun: number | string;
    created_at?: string;
    updated_at?: string;
}

interface TahunProps {
    daftarTahun: TahunItem[];
    archivedCount: number;
    currentYear: number;
}

export default function TahunPage({ daftarTahun, currentYear }: TahunProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<TahunItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<TahunItem | null>(null);

    const form = useForm({
        tahun: '',
    });

    const openCreateModal = () => {
        setSelectedItem(null);
        form.reset();
        form.setData('tahun', String(new Date().getFullYear()));
        setIsFormOpen(true);
    };

    const openEditModal = (item: TahunItem) => {
        setSelectedItem(item);
        form.setData('tahun', String(item.tahun));
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItem) {
            form.put(`/master-data/tahun/${selectedItem.id}`, {
                onSuccess: () => {
                    setIsFormOpen(false);
                },
            });
        } else {
            form.post('/master-data/tahun', {
                onSuccess: () => {
                    setIsFormOpen(false);
                },
            });
        }
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        router.delete(`/master-data/tahun/${itemToDelete.id}`, {
            onSuccess: () => {
                setItemToDelete(null);
            },
        });
    };

    return (
        <AuthenticatedLayout
            title="Tahun Anggaran"
            description="Kelola daftar tahun anggaran aktif untuk penyusunan data dan pelaporan"
            headerAction={
                <Button size="sm" onClick={openCreateModal} className="gap-1.5">
                    <Plus className="size-4" />
                    <span>Tambah Tahun</span>
                </Button>
            }
        >
            <Head title="Tahun Anggaran" />

            <div className="grid gap-6">
                <Card className="shadow-xs">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                            Daftar Tahun Anggaran
                        </CardTitle>
                        <CardDescription>
                            Tahun anggaran yang terdaftar di basis data
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="border-t">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16 text-center">No</TableHead>
                                        <TableHead>Tahun Anggaran</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right w-28 pr-4">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {daftarTahun.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                Belum ada data tahun anggaran.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        daftarTahun.map((item, index) => {
                                            const isCurrent = Number(item.tahun) === currentYear;
                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                                <Calendar className="size-4" />
                                                            </div>
                                                            <span className="font-semibold text-sm">
                                                                {item.tahun}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isCurrent ? (
                                                            <Badge
                                                                variant="default"
                                                                className="gap-1 text-xs"
                                                            >
                                                                <CheckCircle2 className="size-3" />
                                                                Tahun Berjalan
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                Tersedia
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8"
                                                                onClick={() => openEditModal(item)}
                                                            >
                                                                <Pencil className="size-3.5" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 text-destructive hover:bg-destructive/10"
                                                                onClick={() => setItemToDelete(item)}
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                                <span className="sr-only">Hapus</span>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dialog Form Tambah / Edit */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedItem ? 'Edit Tahun Anggaran' : 'Tambah Tahun Anggaran'}
                        </DialogTitle>
                        <DialogDescription>
                            Masukkan 4 digit tahun anggaran (contoh: 2026)
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="tahun">Tahun Anggaran</Label>
                            <Input
                                id="tahun"
                                type="number"
                                placeholder="Contoh: 2026"
                                value={form.data.tahun}
                                onChange={(e) => form.setData('tahun', e.target.value)}
                                className={form.errors.tahun ? 'border-destructive' : ''}
                                autoFocus
                            />
                            {form.errors.tahun && (
                                <p className="text-xs text-destructive">{form.errors.tahun}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFormOpen(false)}
                            >
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

            {/* Alert Dialog Konfirmasi Hapus */}
            <AlertDialog
                open={Boolean(itemToDelete)}
                onOpenChange={(open) => !open && setItemToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Tahun Anggaran?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin memindahkan tahun anggaran{' '}
                            <span className="font-semibold text-foreground">
                                {itemToDelete?.tahun}
                            </span>{' '}
                            ke arsip? Data dapat dipulihkan kembali dari menu arsip.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
