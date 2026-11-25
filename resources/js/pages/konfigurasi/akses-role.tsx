import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Pencil, ShieldCheck } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PermissionTreeDialog, type MenuItemModel } from '@/components/akses/permission-tree-dialog';

interface RoleItem {
    id: number;
    name: string;
    guard_name: string;
}

interface AksesRoleProps {
    daftarRole: RoleItem[];
    menus: MenuItemModel[];
    can: {
        update: boolean;
    };
}

export default function AksesRolePage({ daftarRole, menus, can }: AksesRoleProps) {
    const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadPermissions = (roleId: number) => {
        setLoading(true);
        fetch(`/konfigurasi/akses-role/${roleId}/role`, {
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

    const openEdit = (role: RoleItem) => {
        setEditingRole(role);
        setIsOpen(true);
        loadPermissions(role.id);
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
        if (!editingRole) return;
        setSaving(true);
        router.put(
            `/konfigurasi/akses-role/${editingRole.id}`,
            { permissions: Array.from(checked) },
            {
                preserveScroll: true,
                onSuccess: () => setIsOpen(false),
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <AuthenticatedLayout title="Akses Role" description="Atur hak akses menu untuk setiap role">
            <Head title="Akses Role" />

            <Card className="shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Daftar Role</CardTitle>
                    <CardDescription>Pilih role lalu klik tombol edit untuk mengatur aksesnya</CardDescription>
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
                                    daftarRole.map((role, index) => (
                                        <TableRow key={role.id}>
                                            <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                        <ShieldCheck className="size-4" />
                                                    </div>
                                                    <span className="font-semibold text-sm">{role.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{role.guard_name}</TableCell>
                                            <TableCell className="text-right pr-4">
                                                {can.update && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                        onClick={() => openEdit(role)}
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
                title="Tambah Akses by Role"
                subjectName={`Role: ${editingRole?.name ?? '-'}`}
                copyLabel="Copy dari role"
                copyPlaceholder="Pilih role"
                copyOptions={daftarRole.filter((r) => r.id !== editingRole?.id)}
                menus={menus}
                checked={checked}
                loading={loading}
                saving={saving}
                onCopy={(id) => {
                    loadPermissions(Number(id));
                }}
                onToggle={togglePermission}
                onToggleGroup={toggleGroup}
                onSave={handleSave}
            />
        </AuthenticatedLayout>
    );
}
