import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Pencil, UserRound } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PermissionTreeDialog, type MenuItemModel } from '@/components/akses/permission-tree-dialog';

interface UserItem {
    id: number;
    name: string;
    username: string;
}

interface AksesUserProps {
    daftarUser: UserItem[];
    menus: MenuItemModel[];
    can: {
        update: boolean;
    };
}

export default function AksesUserPage({ daftarUser, menus, can }: AksesUserProps) {
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadPermissions = (userId: number) => {
        setLoading(true);
        fetch(`/konfigurasi/akses-user/${userId}/user`, {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((res) => {
                if (!res.ok) throw new Error('Gagal memuat permission');
                return res.json();
            })
            .then((data: { permissions: string[] }) => setChecked(new Set(data.permissions)))
            .catch(() => setChecked(new Set()))
            .finally(() => setLoading(false));
    };

    const openEdit = (user: UserItem) => {
        setEditingUser(user);
        setIsOpen(true);
        loadPermissions(user.id);
    };

    const togglePermission = (name: string) => {
        setChecked((prev) => {
            const next = new Set(prev);
            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }
            return next;
        });
    };

    const toggleGroup = (names: string[], value: boolean) => {
        setChecked((prev) => {
            const next = new Set(prev);
            names.forEach((n) => (value ? next.add(n) : next.delete(n)));
            return next;
        });
    };

    const handleSave = () => {
        if (!editingUser) return;
        setSaving(true);
        router.put(
            `/konfigurasi/akses-user/${editingUser.id}`,
            { permissions: Array.from(checked) },
            {
                preserveScroll: true,
                onSuccess: () => setIsOpen(false),
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <AuthenticatedLayout title="Akses User" description="Atur hak akses menu langsung untuk setiap user">
            <Head title="Akses User" />

            <Card className="shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Daftar User</CardTitle>
                    <CardDescription>Pilih user lalu klik tombol edit untuk mengatur aksesnya</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-center">No</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead className="text-right w-28 pr-4">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {daftarUser.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            Belum ada data user.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    daftarUser.map((user, index) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                        <UserRound className="size-4" />
                                                    </div>
                                                    <span className="font-semibold text-sm">{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{user.username}</TableCell>
                                            <TableCell className="text-right pr-4">
                                                {can.update && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                        onClick={() => openEdit(user)}
                                                    >
                                                        <Pencil className="size-3.5" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <PermissionTreeDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                title="Tambah Akses by User"
                subjectName={`User: ${editingUser?.name ?? '-'}`}
                copyLabel="Copy dari user"
                copyPlaceholder="Pilih user"
                copyOptions={daftarUser.filter((u) => u.id !== editingUser?.id)}
                menus={menus}
                checked={checked}
                loading={loading}
                saving={saving}
                onCopy={(id) => loadPermissions(Number(id))}
                onToggle={togglePermission}
                onToggleGroup={toggleGroup}
                onSave={handleSave}
            />
        </AuthenticatedLayout>
    );
}
