import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface PermissionItem {
    id: number;
    name: string;
}

export interface SubMenuModel {
    id: number;
    name: string;
    permissions: PermissionItem[];
}

export interface MenuItemModel {
    id: number;
    name: string;
    permissions: PermissionItem[];
    subMenus: SubMenuModel[];
}

export interface OptionItem {
    id: number;
    name: string;
}

export interface PermissionTreeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    subjectName: string;
    copyLabel: string;
    copyPlaceholder: string;
    copyOptions: OptionItem[];
    menus: MenuItemModel[];
    checked: Set<string>;
    loading: boolean;
    saving: boolean;
    onCopy: (id: string) => void;
    onToggle: (name: string) => void;
    onToggleGroup: (names: string[], value: boolean) => void;
    onSave: () => void;
}

const permLabel = (name: string) => name.split(' ')[0];

const groupState = (names: string[], checked: Set<string>): boolean | 'indeterminate' => {
    if (names.length === 0) return false;
    const count = names.filter((n) => checked.has(n)).length;
    if (count === 0) return false;
    if (count === names.length) return true;
    return 'indeterminate';
};

export function PermissionTreeDialog({
    open,
    onOpenChange,
    title,
    subjectName,
    copyLabel,
    copyPlaceholder,
    copyOptions,
    menus,
    checked,
    loading,
    saving,
    onCopy,
    onToggle,
    onToggleGroup,
    onSave,
}: PermissionTreeDialogProps) {
    const [search, setSearch] = useState('');
    const [copyValue, setCopyValue] = useState('');

    const keyword = search.trim().toLowerCase();

    const filteredMenus = useMemo(() => {
        if (!keyword) return menus;
        return menus.filter(
            (m) =>
                m.name.toLowerCase().includes(keyword) ||
                m.subMenus.some((sm) => sm.name.toLowerCase().includes(keyword))
        );
    }, [menus, keyword]);

    const handleOpenChange = (value: boolean) => {
        if (!value) {
            setSearch('');
            setCopyValue('');
        }
        onOpenChange(value);
    };

    const handleCopy = (value: string) => {
        setCopyValue(value);
        onCopy(value);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{subjectName}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="space-y-1.5">
                        <Label>{copyLabel}</Label>
                        <Select value={copyValue} onValueChange={handleCopy}>
                            <SelectTrigger>
                                <SelectValue placeholder={copyPlaceholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {copyOptions.map((o) => (
                                    <SelectItem key={o.id} value={String(o.id)}>
                                        {o.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cari-menu-dialog">Cari Menu</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                id="cari-menu-dialog"
                                type="text"
                                placeholder="Cari.."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                    </div>

                    <div className="border rounded-md divide-y">
                        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
                            <span>Menu</span>
                            <span>Actions</span>
                        </div>

                        {loading ? (
                            <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                                Memuat permission...
                            </div>
                        ) : filteredMenus.length === 0 ? (
                            <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                                Tidak ada menu ditemukan.
                            </div>
                        ) : (
                            filteredMenus.map((menu) => {
                                const menuNames = [
                                    ...menu.permissions,
                                    ...menu.subMenus.flatMap((sm) => sm.permissions),
                                ].map((p) => p.name);

                                return (
                                    <div key={menu.id}>
                                        <MenuRow
                                            label={menu.name}
                                            bold
                                            permissions={menu.permissions}
                                            checked={checked}
                                            groupState={groupState(menuNames, checked)}
                                            onToggleGroup={(v) => onToggleGroup(menuNames, v)}
                                            onToggle={onToggle}
                                        />
                                        {menu.subMenus.map((sm) => {
                                            const subNames = sm.permissions.map((p) => p.name);
                                            return (
                                                <MenuRow
                                                    key={sm.id}
                                                    label={sm.name}
                                                    indent
                                                    permissions={sm.permissions}
                                                    checked={checked}
                                                    groupState={groupState(subNames, checked)}
                                                    onToggleGroup={(v) => onToggleGroup(subNames, v)}
                                                    onToggle={onToggle}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
                        Tutup
                    </Button>
                    <Button onClick={onSave} disabled={saving || loading}>
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface MenuRowProps {
    label: string;
    bold?: boolean;
    indent?: boolean;
    permissions: PermissionItem[];
    checked: Set<string>;
    groupState: boolean | 'indeterminate';
    onToggleGroup: (value: boolean) => void;
    onToggle: (name: string) => void;
}

function MenuRow({
    label,
    bold = false,
    indent = false,
    permissions,
    checked,
    groupState,
    onToggleGroup,
    onToggle,
}: MenuRowProps) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 px-4 py-3 items-start">
            <label className={`flex items-center gap-2 cursor-pointer ${indent ? 'pl-6' : ''}`}>
                {permissions.length > 0 && (
                    <Checkbox
                        checked={groupState}
                        onCheckedChange={(v) => onToggleGroup(v === true)}
                    />
                )}
                <span className={`text-sm ${bold ? 'font-semibold' : 'text-muted-foreground'}`}>{label}</span>
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {permissions.length === 0 && (
                    <span className="text-xs text-muted-foreground">-</span>
                )}
                {permissions.map((p) => {
                    const id = `perm-${p.id}`;
                    return (
                        <div key={p.id} className="flex items-center gap-2">
                            <Switch
                                id={id}
                                checked={checked.has(p.name)}
                                onCheckedChange={() => onToggle(p.name)}
                            />
                            <Label htmlFor={id} className="text-sm font-normal cursor-pointer">
                                {permLabel(p.name)}
                            </Label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
