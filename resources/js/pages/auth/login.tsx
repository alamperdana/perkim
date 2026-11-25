import React, { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Building, Loader2 } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ThemeSwitch } from '@/components/theme-switch';
import { ThemeProvider } from '@/context/theme-provider';

interface LoginProps {
    tahun: Array<{ id: number; tahun: number }>;
    defaultTahun: number;
}

export default function Login({ tahun, defaultTahun }: LoginProps) {
    const currentYearString = String(defaultTahun);
    const hasDefaultYear = tahun.some((t) => String(t.tahun) === currentYearString);
    const initialTahun = hasDefaultYear
        ? currentYearString
        : tahun.length > 0
          ? String(tahun[0].tahun)
          : currentYearString;

    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        tahun: initialTahun,
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <ThemeProvider defaultTheme="light" storageKey="perkim_theme">
            <div className="relative min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-6 lg:p-8">
                <Head title="Masuk" />

                {/* Theme switch in top corner */}
                <div className="absolute top-4 right-4">
                    <ThemeSwitch />
                </div>

                <div className="w-full max-w-md space-y-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                            <Building className="size-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">PERKIM</h1>
                        <p className="text-sm text-muted-foreground">
                            Sistem Manajemen Data Dinas Perumahan dan Kawasan Permukiman
                        </p>
                    </div>

                    <Card className="shadow-lg border-border/60">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-xl font-semibold tracking-tight">
                                Masuk ke Akun
                            </CardTitle>
                            <CardDescription>
                                Masukkan email atau username beserta tahun anggaran aktif
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login">Email atau Username</Label>
                                    <Input
                                        id="login"
                                        type="text"
                                        name="login"
                                        value={data.login}
                                        placeholder="nama@domain.com atau username"
                                        autoComplete="username"
                                        autoFocus
                                        onChange={(e) => setData('login', e.target.value)}
                                        className={errors.login ? 'border-destructive' : ''}
                                    />
                                    {errors.login && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.login}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        value={data.password}
                                        placeholder="Masukkan kata sandi"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={errors.password ? 'border-destructive' : ''}
                                    />
                                    {errors.password && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tahun">Tahun Anggaran</Label>
                                    <Select
                                        value={data.tahun}
                                        onValueChange={(val) => setData('tahun', val)}
                                    >
                                        <SelectTrigger
                                            id="tahun"
                                            className={errors.tahun ? 'border-destructive' : ''}
                                        >
                                            <SelectValue placeholder="Pilih Tahun Anggaran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tahun.map((item) => (
                                                <SelectItem
                                                    key={item.id}
                                                    value={String(item.tahun)}
                                                >
                                                    Tahun Anggaran {item.tahun}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.tahun && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.tahun}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 pt-1">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) =>
                                            setData('remember', Boolean(checked))
                                        }
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm font-normal text-muted-foreground cursor-pointer"
                                    >
                                        Ingat saya pada perangkat ini
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full mt-2"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        'Masuk'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs text-muted-foreground">
                        Pemerintah Kota Jambi &bull; Dinas Perumahan dan Kawasan Permukiman
                    </p>
                </div>
            </div>
        </ThemeProvider>
    );
}
