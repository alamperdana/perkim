import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Shield, Loader2 } from 'lucide-react';
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

interface RoleItem {
    id: number;
    name: string;
    guard_name: string;
}

interface RoleProps {
    daftarRole: RoleItem[];
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

export default function RolePage({ daftarRole, can }: RoleProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<RoleItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<RoleItem | null>(null);

    const form = useForm({
        name: '',
        guard_name: 'web',
    });

    const openCreateModal = () => {
        setSelectedItem(null);
        form.reset();
        form.setData({ name: '', guard_name: 'web' });
        setIsFormOpen(true);
    };

    const openEditModal = (item: RoleItem) => {
        setSelectedItem(item);
        form.setData({ name: item.name, guard_name: item.guard_name });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItem) {
            form.put(`/konfigurasi/roles/${selectedItem.id}`, {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            form.post('/konfigurasi/roles', {
                onSuccess: () => setIsFormOpen(false),
            });
        }
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        router.delete(`/konfigurasi/roles/${itemToDelete.id}`, {
            onSuccess: () => setItemToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout
            title="Role"
            description="Kelola daftar role dan guard untuk pengaturan hak akses"
            headerAction={
                can.create && (
                    <Button size="sm" onClick={openCreateModal} className="gap-1.5">
                        <Plus className="size-4" />
                        <span>Tambah Role</span>
                    </Button>
                )
            }
        >
            <Head title="Role" />

            <Card className="shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Daftar Role</CardTitle>
                    <CardDescription>Role yang terdaftar di sistem</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-center">No</TableHead>
                                    <TableHead>Nama Role</TableHead>
                                    <TableHead>Guard</TableHead>
                                    <TableHead className="text-right w-28 pr-4">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {daftarRole.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            Belum ada data role.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    daftarRole.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                        <Shield className="size-4" />
                                                    </div>
                                                    <span className="font-semibold text-sm">{item.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{item.guard_name}</TableCell>
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
                        <DialogTitle>{selectedItem ? 'Edit Role' : 'Tambah Role'}</DialogTitle>
                        <DialogDescription>Isi nama role dan guard</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Contoh: Operator"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className={form.errors.name ? 'border-destructive' : ''}
                                />
                                {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guard_name">Guard</Label>
                                <Input
                                    id="guard_name"
                                    value={form.data.guard_name}
                                    onChange={(e) => form.setData('guard_name', e.target.value)}
                                    className={form.errors.guard_name ? 'border-destructive' : ''}
                                />
                                {form.errors.guard_name && <p className="text-xs text-destructive">{form.errors.guard_name}</p>}
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
                        <AlertDialogTitle>Hapus Role?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus role{' '}
                            <span className="font-semibold text-foreground">{itemToDelete?.name}</span>?
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
