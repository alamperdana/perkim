import { useEffect, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { Building } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarRail,
} from '@/components/ui/sidebar';
import { BASEMAPS, BasemapId, DEFAULT_BASEMAP } from '@/lib/map-basemaps';

type Level = 'kabkota' | 'kecamatan' | 'kelurahan';

interface PetaProperties {
    level: Level;
    NAMOBJ: string;
    KDCPUM: string | null;
    KDEPUM: string | null;
    WADMKC: string | null;
    WADMKK: string;
    lat: number;
    lng: number;
}

interface PetaFeature {
    type: 'Feature';
    properties: PetaProperties;
    geometry: GeoJSON.Geometry;
}

interface DataPeta {
    kabkota: PetaFeature[];
    kecamatan: PetaFeature[];
    kelurahan: PetaFeature[];
}

const KOSONG: DataPeta = { kabkota: [], kecamatan: [], kelurahan: [] };

function kelompokkan(fitur: PetaFeature[]): DataPeta {
    const hasil: DataPeta = { kabkota: [], kecamatan: [], kelurahan: [] };
    for (const f of fitur) {
        hasil[f.properties.level].push(f);
    }
    return hasil;
}

export default function PetaIndex() {
    const { appName, logoUrl } = usePage<PageProps>().props;
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const overlayLayerRef = useRef<L.TileLayer | null>(null);
    const layerRef = useRef<L.LayerGroup | null>(null);

    const [data, setData] = useState<DataPeta>(KOSONG);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [basemap, setBasemap] = useState<BasemapId>(DEFAULT_BASEMAP);
    const [kecamatan, setKecamatan] = useState<string>('');
    const [kelurahan, setKelurahan] = useState<string>('');

    const muatData = () => {
        setLoading(true);
        setError(null);
        fetch(route('peta.data'), { headers: { Accept: 'application/json' } })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<PetaFeature[]>;
            })
            .then((fitur) => setData(kelompokkan(fitur)))
            .catch(() => setError('Data peta gagal dimuat. Periksa koneksi, lalu coba lagi.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        muatData();
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;
        // Kontrol zoom dipindah ke kanan bawah agar tidak tertutup header di kiri atas.
        const map = L.map(mapRef.current, { zoomControl: false });
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        const config = BASEMAPS[basemap];
        tileLayerRef.current?.remove();
        overlayLayerRef.current?.remove();
        tileLayerRef.current = L.tileLayer(config.url, {
            maxZoom: config.maxZoom,
            attribution: config.attribution,
        }).addTo(map);
        // Lapisan label di atas satelit agar nama jalan dan tempat tetap terbaca.
        if (config.overlay) {
            overlayLayerRef.current = L.tileLayer(config.overlay.url, {
                maxZoom: config.maxZoom,
                attribution: config.overlay.attribution,
                pane: 'overlayPane',
            }).addTo(map);
        }
    }, [basemap]);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || loading || error) return;

        layerRef.current?.remove();
        const grup = L.layerGroup().addTo(map);
        layerRef.current = grup;

        const animasi = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Hanya satu tingkat wilayah yang tampil, agar poligon tidak tumpang tindih.
        // Kelurahan terpilih > kecamatan terpilih > seluruh kota.
        const fiturAktif: PetaFeature | undefined = kelurahan
            ? data.kelurahan.find(
                  (f) => f.properties.WADMKC === kecamatan && f.properties.NAMOBJ === kelurahan,
              )
            : kecamatan
              ? data.kecamatan.find((f) => f.properties.NAMOBJ === kecamatan)
              : undefined;

        const gaya = kelurahan
            ? { color: '#0f766e', weight: 3, fillOpacity: 0.15 }
            : kecamatan
              ? { color: '#2563eb', weight: 3, fillOpacity: 0.15 }
              : { color: '#1e293b', weight: 2, fillOpacity: 0.05 };

        const sumber = fiturAktif ? [fiturAktif] : data.kabkota;
        const poligon = L.geoJSON(sumber as GeoJSON.Feature[], { style: gaya }).addTo(grup);

        if (fiturAktif) {
            poligon.bindTooltip(fiturAktif.properties.NAMOBJ);
        }

        if (sumber.length > 0) {
            map.fitBounds(poligon.getBounds(), {
                animate: animasi,
                padding: [24, 24],
            });
        }
    }, [data, loading, error, kecamatan, kelurahan]);

    const daftarKecamatan = data.kecamatan.map((f) => f.properties.NAMOBJ);
    const daftarKelurahan = kecamatan
        ? data.kelurahan
              .filter((f) => f.properties.WADMKC === kecamatan)
              .map((f) => f.properties.NAMOBJ)
        : [];
    const basemapAktif = Object.values(BASEMAPS).filter((b) => b.enabled);
    return (
        <>
            <Head title="Peta Wilayah" />
            <SidebarProvider defaultOpen={true} className="h-svh min-h-0">
                <Sidebar collapsible="offcanvas" variant="sidebar">
                    <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className={`flex aspect-square size-8 items-center justify-center rounded-lg font-bold shadow-sm ${logoUrl ? '' : 'bg-primary text-primary-foreground'}`}>
                                {logoUrl ? <img src={logoUrl} alt="" className="size-8 rounded-lg object-contain" /> : <Building className="size-4" aria-hidden="true" />}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-bold tracking-tight text-foreground">{appName || 'PERKIM'}</span>
                                <span className="truncate text-[11px] text-muted-foreground">
                                    Peta Wilayah Kota Jambi
                                </span>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="gap-4 px-4 py-4">
                        <section aria-label="Filter peta" className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="basemap">Layer peta</Label>
                                <Select value={basemap} onValueChange={(v) => setBasemap(v as BasemapId)}>
                                    <SelectTrigger id="basemap" className="h-11 w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {basemapAktif.map((b) => (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="kecamatan">Kecamatan</Label>
                                <Select
                                    value={kecamatan}
                                    onValueChange={(v) => {
                                        setKecamatan(v);
                                        setKelurahan('');
                                    }}
                                    disabled={daftarKecamatan.length === 0}
                                >
                                    <SelectTrigger id="kecamatan" className="h-11 w-full">
                                        <SelectValue placeholder="Pilih kecamatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {daftarKecamatan.map((nama) => (
                                            <SelectItem key={nama} value={nama}>
                                                {nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="kelurahan">Kelurahan</Label>
                                <Select
                                    value={kelurahan}
                                    onValueChange={setKelurahan}
                                    disabled={!kecamatan || daftarKelurahan.length === 0}
                                >
                                    <SelectTrigger id="kelurahan" className="h-11 w-full">
                                        <SelectValue placeholder="Pilih kecamatan dulu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {daftarKelurahan.map((nama) => (
                                            <SelectItem key={nama} value={nama}>
                                                {nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </section>
                    </SidebarContent>

                    <SidebarFooter className="border-t border-sidebar-border p-4">
                        <Button asChild className="min-h-11 w-full">
                            <Link href={route('login')}>Login</Link>
                        </Button>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>

                <SidebarInset className="relative h-svh overflow-hidden">
                    <div ref={mapRef} className="absolute inset-0 z-0 isolate" />

                    <header className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 border-b bg-background/95 px-3 py-2">
                        <SidebarTrigger className="size-11 md:size-9" aria-label="Buka atau tutup menu" />
                        <h1 className="truncate text-base font-semibold">Peta Wilayah Kota Jambi</h1>
                    </header>

                    {loading && (
                        <p role="status" className="absolute bottom-4 left-4 z-10 rounded-md bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-xs">
                            Memuat data peta...
                        </p>
                    )}

                    {!loading && error && (
                        <div role="alert" className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-3 rounded-md bg-background/95 p-3 shadow-xs">
                            <p className="text-sm text-destructive">{error}</p>
                            <Button variant="outline" onClick={muatData} className="min-h-11">
                                Coba lagi
                            </Button>
                        </div>
                    )}

                    {!loading && !error && data.kabkota.length === 0 && (
                        <p className="absolute bottom-4 left-4 z-10 rounded-md bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-xs">
                            Data tidak ditemukan.
                        </p>
                    )}
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}


