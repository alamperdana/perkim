import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface ProfileEditProps {
    profile: {
        name: string;
        email: string;
    };
}

export default function ProfileEdit({ profile }: ProfileEditProps) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const infoForm = useForm({
        name: profile.name,
        email: profile.email,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
    });

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        infoForm.patch('/profile', { preserveScroll: true });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const handleDelete = (e: React.FormEvent) => {
        e.preventDefault();
        deleteForm.delete('/profile');
    };

    return (
        <AuthenticatedLayout title="Profil" description="Kelola informasi akun dan keamanan Anda.">
            <Head title="Profil" />

            <div className="grid gap-6 max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Profil</CardTitle>
                        <CardDescription>Perbarui nama dan alamat email akun Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleInfoSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    value={infoForm.data.name}
                                    onChange={(e) => infoForm.setData('name', e.target.value)}
                                    required
                                    autoFocus
                                    autoComplete="name"
                                />
                                {infoForm.errors.name && (
                                    <p className="text-xs text-destructive">{infoForm.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={infoForm.data.email}
                                    onChange={(e) => infoForm.setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                                {infoForm.errors.email && (
                                    <p className="text-xs text-destructive">{infoForm.errors.email}</p>
                                )}
                            </div>

                            <Button type="submit" disabled={infoForm.processing}>
                                Simpan
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ubah Password</CardTitle>
                        <CardDescription>
                            Gunakan password yang panjang dan acak agar akun tetap aman.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Password Saat Ini</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                />
                                {passwordForm.errors.current_password && (
                                    <p className="text-xs text-destructive">{passwordForm.errors.current_password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password Baru</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                                {passwordForm.errors.password && (
                                    <p className="text-xs text-destructive">{passwordForm.errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>

                            <Button type="submit" disabled={passwordForm.processing}>
                                Simpan Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-destructive/40">
                    <CardHeader>
                        <CardTitle className="text-destructive">Hapus Akun</CardTitle>
                        <CardDescription>
                            Setelah akun dihapus, seluruh data akan dihapus permanen. Unduh data yang ingin Anda simpan
                            sebelum melanjutkan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                            Hapus Akun
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <form onSubmit={handleDelete}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Yakin ingin menghapus akun?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Masukkan password Anda untuk mengonfirmasi penghapusan akun secara permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="my-4 space-y-2">
                            <Label htmlFor="delete_password" className="sr-only">
                                Password
                            </Label>
                            <Input
                                id="delete_password"
                                type="password"
                                placeholder="Password"
                                value={deleteForm.data.password}
                                onChange={(e) => deleteForm.setData('password', e.target.value)}
                            />
                            {deleteForm.errors.password && (
                                <p className="text-xs text-destructive">{deleteForm.errors.password}</p>
                            )}
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel type="button" onClick={() => deleteForm.reset()}>
                                Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                                type="submit"
                                className="bg-destructive text-white hover:bg-destructive/90"
                                disabled={deleteForm.processing}
                            >
                                Hapus Akun
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
