import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Plus,
    ArrowUpDown,
    Pencil,
    Trash2,
    Search,
    Layers,
    Folder,
    FileText,
    Loader2,
} from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { IconRenderer } from '@/components/icon-renderer';

interface MenuItemModel {
    id: number;
    name: string;
    url: string;
    category: string;
    icon: string | null;
    orders: number;
    main_menu_id: number | null;
    main_menu?: { id: number; name: string } | null;
    active: number;
}

interface MenuProps {
    menus: MenuItemModel[];
    mainMenuList: Array<{ id: number; name: string }>;
    filters: {
        search: string;
    };
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
        sort: boolean;
    };
}

export default function MenuPage({ menus, mainMenuList, filters, can }: MenuProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<MenuItemModel | null>(null);
    const [menuToDelete, setMenuToDelete] = useState<MenuItemModel | null>(null);

    const form = useForm({
        name: '',
        url: '',
        category: 'MASTER DATA',
        icon: '',
        orders: 1,
        level_menu: 'main_menu',
        main_menu: '',
        permissions: ['read'],
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/konfigurasi/menu',
            { search: searchTerm },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setSelectedMenu(null);
        form.reset();
        form.setData({
            name: '',
            url: '',
            category: 'MASTER DATA',
            icon: '',
            orders: menus.length + 1,
            level_menu: 'main_menu',
            main_menu: '',
            permissions: ['create', 'read', 'update', 'delete'],
        });
        setIsFormOpen(true);
    };

    const openEditModal = (item: MenuItemModel) => {
        setSelectedMenu(item);
        form.setData({
            name: item.name,
            url: item.url,
            category: item.category || '',
            icon: item.icon || '',
            orders: item.orders,
            level_menu: item.main_menu_id ? 'sub_menu' : 'main_menu',
            main_menu: item.main_menu_id ? String(item.main_menu_id) : '',
            permissions: [],
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMenu) {
            form.put(`/konfigurasi/menu/${selectedMenu.id}`, {
                onSuccess: () => {
                    setIsFormOpen(false);
                },
            });
        } else {
            form.post('/konfigurasi/menu', {
                onSuccess: () => {
                    setIsFormOpen(false);
                },
            });
        }
    };

    const handleDelete = () => {
        if (!menuToDelete) return;
        router.delete(`/konfigurasi/menu/${menuToDelete.id}`, {
            onSuccess: () => {
                setMenuToDelete(null);
            },
        });
    };

    const handleSort = () => {
        router.put(
            '/konfigurasi/menu/sort',
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const togglePermission = (perm: string) => {
        const current = form.data.permissions || [];
        if (current.includes(perm)) {
            form.setData(
                'permissions',
                current.filter((p) => p !== perm)
            );
        } else {
            form.setData('permissions', [...current, perm]);
        }
    };

    return (
        <AuthenticatedLayout
            title="Konfigurasi Menu"
            description="Kelola struktur navigasi sidebar dan relasi hak akses"
            headerAction={
                <div className="flex items-center gap-2">
                    {can.sort && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSort}
                            className="gap-1.5"
                        >
                            <ArrowUpDown className="size-4" />
                            <span>Sinkronkan Urutan</span>
                        </Button>
                    )}
                    {can.create && (
                        <Button size="sm" onClick={openCreateModal} className="gap-1.5">
                            <Plus className="size-4" />
                            <span>Tambah Menu</span>
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Konfigurasi Menu" />

            <Card className="shadow-xs">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Daftar Menu Sistem
                            </CardTitle>
                            <CardDescription>
                                Total {menus.length} entri menu terdaftar di sistem
                            </CardDescription>
                        </div>
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-72">
                            <div className="relative w-full">
                                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari nama, kategori, URL..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                            {searchTerm && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm('');
                                        router.get('/konfigurasi/menu');
                                    }}
                                >
                                    Reset
                                </Button>
                            )}
                        </form>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="border-t">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12 text-center">No</TableHead>
                                    <TableHead>Nama Menu</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>URL</TableHead>
                                    <TableHead className="text-center w-20">Urutan</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead className="text-right w-24 pr-4">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {menus.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            Tidak ada data menu ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    menus.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                                                        <IconRenderer
                                                            name={item.icon}
                                                            className="size-4"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm text-foreground">
                                                            {item.name}
                                                        </div>
                                                        {item.icon && (
                                                            <div className="text-[11px] text-muted-foreground font-mono">
                                                                icon: {item.icon}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs uppercase">
                                                    {item.category || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-foreground">
                                                    /{item.url}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-xs">
                                                {item.orders}
                                            </TableCell>
                                            <TableCell>
                                                {item.main_menu_id ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[11px] gap-1 font-normal"
                                                    >
                                                        <FileText className="size-3" />
                                                        Sub Menu ({item.main_menu?.name || 'Parent'})
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="default"
                                                        className="text-[11px] gap-1 font-normal"
                                                    >
                                                        <Folder className="size-3" />
                                                        Main Menu
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {can.update && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8"
                                                            onClick={() => openEditModal(item)}
                                                        >
                                                            <Pencil className="size-3.5" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                    )}
                                                    {can.delete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() => setMenuToDelete(item)}
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

            {/* Dialog Form Modal (Tambah / Edit) */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Konfigurasikan detail rute dan penempatan menu di navigasi
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Level Menu</Label>
                            <RadioGroup
                                value={form.data.level_menu}
                                onValueChange={(val) => form.setData('level_menu', val)}
                                className="flex items-center gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="main_menu" id="lvl-main" />
                                    <Label htmlFor="lvl-main" className="cursor-pointer font-normal">
                                        Main Menu
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="sub_menu" id="lvl-sub" />
                                    <Label htmlFor="lvl-sub" className="cursor-pointer font-normal">
                                        Sub Menu
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {form.data.level_menu === 'sub_menu' && (
                            <div className="space-y-2">
                                <Label htmlFor="main_menu">Pilih Parent (Main Menu)</Label>
                                <Select
                                    value={form.data.main_menu}
                                    onValueChange={(val) => form.setData('main_menu', val)}
                                >
                                    <SelectTrigger id="main_menu">
                                        <SelectValue placeholder="Pilih Main Menu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mainMenuList.map((m) => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Menu</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    placeholder="Contoh: Pengguna"
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className={form.errors.name ? 'border-destructive' : ''}
                                />
                                {form.errors.name && (
                                    <p className="text-xs text-destructive">{form.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="url">URL</Label>
                                <Input
                                    id="url"
                                    value={form.data.url}
                                    placeholder="Contoh: master-data/users"
                                    onChange={(e) => form.setData('url', e.target.value)}
                                    className={form.errors.url ? 'border-destructive' : ''}
                                />
                                {form.errors.url && (
                                    <p className="text-xs text-destructive">{form.errors.url}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori Menu</Label>
                                <Input
                                    id="category"
                                    value={form.data.category}
                                    placeholder="Contoh: MASTER DATA"
                                    onChange={(e) => form.setData('category', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon (Lucide / Ti)</Label>
                                <Input
                                    id="icon"
                                    value={form.data.icon}
                                    placeholder="Contoh: users, settings, database"
                                    onChange={(e) => form.setData('icon', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="orders">Urutan Tampil</Label>
                                <Input
                                    id="orders"
                                    type="number"
                                    value={form.data.orders}
                                    onChange={(e) =>
                                        form.setData('orders', parseInt(e.target.value) || 1)
                                    }
                                    className={form.errors.orders ? 'border-destructive' : ''}
                                />
                                {form.errors.orders && (
                                    <p className="text-xs text-destructive">{form.errors.orders}</p>
                                )}
                            </div>
                        </div>

                        {!selectedMenu && (
                            <div className="space-y-2 pt-2 border-t">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                                    Izin Akses Awal (Permissions)
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                    {['create', 'read', 'update', 'delete'].map((p) => (
                                        <div key={p} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`perm-${p}`}
                                                checked={form.data.permissions.includes(p)}
                                                onCheckedChange={() => togglePermission(p)}
                                            />
                                            <Label
                                                htmlFor={`perm-${p}`}
                                                className="cursor-pointer font-normal text-xs uppercase"
                                            >
                                                {p}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
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
                                ) : selectedMenu ? (
                                    'Simpan Perubahan'
                                ) : (
                                    'Tambah Menu'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alert Dialog Konfirmasi Hapus */}
            <AlertDialog
                open={Boolean(menuToDelete)}
                onOpenChange={(open) => !open && setMenuToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Menu?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus menu{' '}
                            <span className="font-semibold text-foreground">
                                "{menuToDelete?.name}"
                            </span>
                            ? Tindakan ini juga akan menghapus izin hak akses yang terkait dengan
                            menu ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Hapus Menu
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
