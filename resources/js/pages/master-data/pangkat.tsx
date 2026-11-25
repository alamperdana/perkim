import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Award, Loader2 } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PangkatItem {
    id: number;
    pangkat: string;
    golongan: string;
    pnsyes: number;
}

interface PangkatProps {
    daftarPangkat: PangkatItem[];
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

export default function PangkatPage({ daftarPangkat, can }: PangkatProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PangkatItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<PangkatItem | null>(null);

    const form = useForm({
        pangkat: '',
        golongan: '',
        pnsyes: '1',
    });

    const openCreateModal = () => {
        setSelectedItem(null);
        form.reset();
        form.setData({ pangkat: '', golongan: '', pnsyes: '1' });
        setIsFormOpen(true);
    };

    const openEditModal = (item: PangkatItem) => {
        setSelectedItem(item);
        form.setData({
            pangkat: item.pangkat,
            golongan: item.golongan,
            pnsyes: String(item.pnsyes),
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItem) {
            form.put(`/master-data/pangkat/${selectedItem.id}`, {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            form.post('/master-data/pangkat', {
                onSuccess: () => setIsFormOpen(false),
            });
        }
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        router.delete(`/master-data/pangkat/${itemToDelete.id}`, {
            onSuccess: () => setItemToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout
            title="Pangkat & Golongan"
            description="Kelola data pangkat, golongan, dan tipe ASN"
            headerAction={
                can.create && (
                    <Button size="sm" onClick={openCreateModal} className="gap-1.5">
                        <Plus className="size-4" />
                        <span>Tambah Pangkat</span>
                    </Button>
                )
            }
        >
            <Head title="Pangkat & Golongan" />

            <Card className="shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Daftar Pangkat</CardTitle>
                    <CardDescription>Pangkat dan golongan yang terdaftar di basis data</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-center">No</TableHead>
                                    <TableHead>Pangkat</TableHead>
                                    <TableHead>Golongan</TableHead>
                                    <TableHead>ASN</TableHead>
                                    <TableHead className="text-right w-28 pr-4">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {daftarPangkat.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            Belum ada data pangkat.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    daftarPangkat.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                        <Award className="size-4" />
                                                    </div>
                                                    <span className="font-semibold text-sm">{item.pangkat}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.golongan}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {item.pnsyes ? 'PNS' : 'PPPK'}
                                                </Badge>
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
                        <DialogTitle>{selectedItem ? 'Edit Pangkat & Golongan' : 'Tambah Pangkat & Golongan'}</DialogTitle>
                        <DialogDescription>Isi pangkat, golongan, dan tipe ASN</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="pangkat">Pangkat</Label>
                            <Input
                                id="pangkat"
                                placeholder="Contoh: Ahli Pertama"
                                value={form.data.pangkat}
                                onChange={(e) => form.setData('pangkat', e.target.value)}
                                className={form.errors.pangkat ? 'border-destructive' : ''}
                            />
                            {form.errors.pangkat && <p className="text-xs text-destructive">{form.errors.pangkat}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="golongan">Golongan</Label>
                                <Input
                                    id="golongan"
                                    placeholder="Contoh: IX"
                                    value={form.data.golongan}
                                    onChange={(e) => form.setData('golongan', e.target.value)}
                                    className={form.errors.golongan ? 'border-destructive' : ''}
                                />
                                {form.errors.golongan && <p className="text-xs text-destructive">{form.errors.golongan}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pnsyes">ASN</Label>
                                <Select value={form.data.pnsyes} onValueChange={(val) => form.setData('pnsyes', val)}>
                                    <SelectTrigger id="pnsyes">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">PNS</SelectItem>
                                        <SelectItem value="0">PPPK</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                        <AlertDialogTitle>Hapus Pangkat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus pangkat{' '}
                            <span className="font-semibold text-foreground">{itemToDelete?.pangkat}</span>?
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
