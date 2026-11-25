import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Loader2, UserRound } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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

interface UserItem {
    id: number;
    name: string;
    username: string;
    email: string;
    roles: string[];
    is_online: boolean;
    last_activity: string | null;
    last_activity_human: string | null;
}

interface RoleItem {
    id: number;
    name: string;
}


interface UsersProps {
    daftarUser: UserItem[];
    daftarRole: RoleItem[];
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

interface UserFormData {
    name: string;
    username: string;
    email: string;
    roles: string[];
    password: string;
    password_confirmation: string;
}

const emptyForm: UserFormData = {
    name: '',
    username: '',
    email: '',
    roles: [],
    password: '',
    password_confirmation: '',
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export default function UsersPage({ daftarUser, daftarRole, can }: UsersProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<UserItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<UserItem | null>(null);

    const form = useForm<UserFormData>(emptyForm);
    const openCreateModal = () => {
        setSelectedItem(null);
        form.setData({ ...emptyForm });
        form.clearErrors();
        setIsFormOpen(true);
    };

    const openEditModal = (item: UserItem) => {
        setSelectedItem(item);
        form.setData({
            name: item.name,
            username: item.username,
            email: item.email,
            roles: item.roles,
            password: '',
            password_confirmation: '',
        });
        form.clearErrors();
        setIsFormOpen(true);
    };

    const toggleRole = (roleName: string, checked: boolean) => {
        const next = checked
            ? [...form.data.roles, roleName]
            : form.data.roles.filter((r) => r !== roleName);
        form.setData('roles', next);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItem) {
            form.put(`/master-data/users/${selectedItem.id}`, {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            form.post('/master-data/users', {
                onSuccess: () => setIsFormOpen(false),
            });
        }
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        router.delete(`/master-data/users/${itemToDelete.id}`, {
            onSuccess: () => setItemToDelete(null),
        });
    };


    return (
        <AuthenticatedLayout
            title="User"
            description="Kelola akun pengguna, role, dan satuan kerja"
            headerAction={
                can.create && (
                    <Button size="sm" onClick={openCreateModal} className="gap-1.5">
                        <Plus className="size-4" />
                        <span>Tambah User</span>
                    </Button>
                )
            }
        >
            <Head title="User" />

            <Card className="shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Daftar User</CardTitle>
                    <CardDescription>Pengguna yang terdaftar beserta role dan satuan kerjanya</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-center">No</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Terakhir Online</TableHead>
                                    <TableHead className="text-right w-28 pr-4">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {daftarUser.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            Belum ada data user.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    daftarUser.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                        <UserRound className="size-4" />
                                                    </div>
                                                    <span className="font-semibold text-sm">{item.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.username}</TableCell>
                                            <TableCell>{item.email}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.roles.length === 0 ? (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    ) : (
                                                        item.roles.map((role) => (
                                                            <Badge key={role} variant="secondary" className="text-xs">
                                                                {capitalize(role)}
                                                            </Badge>
                                                        ))
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={item.is_online ? 'default' : 'outline'}
                                                    className={item.is_online ? 'text-xs bg-green-600 text-white hover:bg-green-600/90' : 'text-xs'}
                                                >
                                                    {item.is_online ? 'Online' : 'Offline'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {item.last_activity ? (
                                                    <span className="text-sm" title={item.last_activity}>
                                                        {item.last_activity_human}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Belum pernah online</span>
                                                )}
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
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? 'Edit User' : 'Tambah User'}</DialogTitle>
                        <DialogDescription>
                            {selectedItem ? 'Perbarui data user dan role-nya.' : 'Isi data user baru.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className={form.errors.name ? 'border-destructive' : ''}
                                />
                                {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    placeholder="johndoe"
                                    value={form.data.username}
                                    onChange={(e) => form.setData('username', e.target.value)}
                                    className={form.errors.username ? 'border-destructive' : ''}
                                />
                                {form.errors.username && <p className="text-xs text-destructive">{form.errors.username}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john.doe@mail.com"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className={form.errors.email ? 'border-destructive' : ''}
                                />
                                {form.errors.email && <p className="text-xs text-destructive">{form.errors.email}</p>}
                            </div>

                        </div>


                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-md border p-3">
                                {daftarRole.map((role) => (
                                    <label key={role.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <Checkbox
                                            checked={form.data.roles.includes(role.name)}
                                            onCheckedChange={(checked) => toggleRole(role.name, checked === true)}
                                        />
                                        <span>{capitalize(role.name)}</span>
                                    </label>
                                ))}
                            </div>
                            {form.errors.roles && <p className="text-xs text-destructive">{form.errors.roles}</p>}
                        </div>

                        {!selectedItem && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        className={form.errors.password ? 'border-destructive' : ''}
                                    />
                                    {form.errors.password && <p className="text-xs text-destructive">{form.errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={form.data.password_confirmation}
                                        onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

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
                        <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus user{' '}
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


