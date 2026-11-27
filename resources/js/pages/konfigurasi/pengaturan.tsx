import React, { useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Save, ImageIcon, History } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SettingProps {
    app_name: string | null;
    app_full_name: string | null;
    description: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    copyright: string | null;
    logo_url: string | null;
    favicon_url: string | null;
}

interface RiwayatItem {
    id: number;
    key: string;
    label: string;
    old_value: string | null;
    new_value: string | null;
    user: string | null;
    created_at: string | null;
}

interface InfoLogProps {
    jumlah_baris: number;
    ukuran_tabel: string;
    tanggal_tertua: string | null;
    tanggal_terbaru: string | null;
    ukuran_file_log: string;
}

interface PengaturanPageProps {
    setting: SettingProps;
    riwayat: RiwayatItem[];
    infoLog: InfoLogProps;
    can: {
        update: boolean;
    };
}

type TextField = 'app_name' | 'app_full_name' | 'description' | 'address' | 'phone' | 'email' | 'copyright';

type PengaturanForm = Record<TextField, string> & {
    logo: File | null;
};

const TEXT_FIELDS: { key: TextField; label: string; required?: boolean; multiline?: boolean }[] = [
    { key: 'app_name', label: 'Nama website', required: true },
    { key: 'app_full_name', label: 'Nama lengkap instansi' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telepon' },
    { key: 'address', label: 'Alamat', multiline: true },
    { key: 'description', label: 'Deskripsi', multiline: true },
    { key: 'copyright', label: 'Teks hak cipta' },
];


export default function PengaturanPage({ setting, riwayat, infoLog, can }: PengaturanPageProps) {
    const logoInput = useRef<HTMLInputElement>(null);

    const form = useForm<PengaturanForm>({
        app_name: setting.app_name ?? '',
        app_full_name: setting.app_full_name ?? '',
        description: setting.description ?? '',
        address: setting.address ?? '',
        phone: setting.phone ?? '',
        email: setting.email ?? '',
        copyright: setting.copyright ?? '',
        logo: null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Body berisi file, jadi PUT dikirim sebagai POST dengan _method agar PHP membaca $_FILES.
        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post('/konfigurasi/pengaturan', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setData({ ...form.data, logo: null });
                if (logoInput.current) logoInput.current.value = '';
            },
        });
    };

    return (
        <AuthenticatedLayout title="Pengaturan Website" description="Ubah nama, logo, favicon, dan informasi instansi.">
            <Head title="Pengaturan Website" />

            <form onSubmit={submit} className="space-y-6">
                <fieldset disabled={!can.update || form.processing} className="space-y-6">
                    <Card className="shadow-xs">
                        <CardHeader>
                            <CardTitle>Informasi Website</CardTitle>
                            <CardDescription>Nama dan informasi kontak yang tampil di website.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            {TEXT_FIELDS.map((field) => {
                                const id = `setting-${field.key}`;
                                const error = form.errors[field.key];
                                return (
                                    <div key={field.key} className={`grid gap-2 ${field.multiline ? 'md:col-span-2' : ''}`}>
                                        <Label htmlFor={id}>
                                            {field.label}
                                            {field.required && <span className="text-destructive"> *</span>}
                                        </Label>
                                        {field.multiline ? (
                                            <Textarea id={id} value={form.data[field.key]} onChange={(e) => form.setData(field.key, e.target.value)} />
                                        ) : (
                                            <Input id={id} value={form.data[field.key]} onChange={(e) => form.setData(field.key, e.target.value)} />
                                        )}
                                        {error && <p className="text-sm text-destructive">{error}</p>}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs">
                        <CardHeader>
                            <CardTitle>Logo dan Favicon</CardTitle>
                            <CardDescription>
                                Unggah logo: PNG, JPG, JPEG, SVG, atau WebP, maksimal 2 MB. Favicon dibuat otomatis
                                dari logo (64 x 64 piksel). Logo SVG tidak membuat favicon, sehingga browser memakai ikon
                                default.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="setting-logo">Logo</Label>
                                {setting.logo_url ? (
                                    <img src={setting.logo_url} alt="Logo saat ini" className="h-16 w-auto object-contain" />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-md border text-muted-foreground">
                                        <ImageIcon className="size-6" />
                                    </div>
                                )}
                                <Input
                                    id="setting-logo"
                                    ref={logoInput}
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.svg,.webp"
                                    onChange={(e) => form.setData('logo', e.target.files?.[0] ?? null)}
                                />
                                {form.errors.logo && <p className="text-sm text-destructive">{form.errors.logo}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label>Favicon</Label>
                                {setting.favicon_url ? (
                                    <img src={setting.favicon_url} alt="Favicon saat ini" className="size-8 object-contain" />
                                ) : (
                                    <div className="flex size-8 items-center justify-center rounded-md border text-muted-foreground">
                                        <ImageIcon className="size-4" />
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground">Dibuat otomatis saat logo diunggah.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {can.update && (
                        <div className="flex justify-end">
                            <Button type="submit" disabled={!form.isDirty || form.processing}>
                                <Save />
                                {form.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </Button>
                        </div>
                    )}
                </fieldset>
            </form>

            <Card className="mt-6 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Besaran Log Aktivitas</CardTitle>
                    <CardDescription>
                        Informasi saja. Log dihapus manual jika diperlukan. Ukuran tabel adalah perkiraan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-5">
                    <div>
                        <p className="text-muted-foreground">Jumlah baris</p>
                        <p className="font-medium">{infoLog.jumlah_baris.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Ukuran tabel</p>
                        <p className="font-medium">{infoLog.ukuran_tabel}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Log tertua</p>
                        <p className="font-medium">{infoLog.tanggal_tertua ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Log terbaru</p>
                        <p className="font-medium">{infoLog.tanggal_terbaru ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">File laravel.log</p>
                        <p className="font-medium">{infoLog.ukuran_file_log}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6 shadow-xs">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="size-5" />
                        Riwayat Perubahan
                    </CardTitle>
                    <CardDescription>20 perubahan terakhir pada pengaturan website.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Field</TableHead>
                                <TableHead>Nilai lama</TableHead>
                                <TableHead>Nilai baru</TableHead>
                                <TableHead>Diubah oleh</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {riwayat.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Belum ada perubahan.
                                    </TableCell>
                                </TableRow>
                            )}
                            {riwayat.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.created_at}</TableCell>
                                    <TableCell>{item.label}</TableCell>
                                    <TableCell className="max-w-48 truncate">{item.old_value ?? '-'}</TableCell>
                                    <TableCell className="max-w-48 truncate">{item.new_value ?? '-'}</TableCell>
                                    <TableCell>{item.user ?? '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
