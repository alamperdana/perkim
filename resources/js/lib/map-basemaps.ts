export type BasemapId = 'osm' | 'esri' | 'dpupr';

export interface BasemapOverlay {
    url: string;
    attribution: string;
}

export interface BasemapConfig {
    id: BasemapId;
    label: string;
    url: string;
    attribution: string;
    maxZoom: number;
    enabled: boolean;
    overlay?: BasemapOverlay;
}

export const BASEMAPS: Record<BasemapId, BasemapConfig> = {
    osm: {
        id: 'osm',
        label: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        enabled: true,
    },
    esri: {
        id: 'esri',
        label: 'Satelit (Esri)',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
        enabled: true,
        overlay: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
            attribution: '',
        },
    },
    dpupr: {
        id: 'dpupr',
        label: 'GIS DPUPR',
        url: '[URL_TILE_GIS_DPUPR]',
        attribution: '[ATRIBUSI_GIS_DPUPR]',
        maxZoom: 19,
        enabled: false,
    },
};

export const DEFAULT_BASEMAP: BasemapId = 'osm';
