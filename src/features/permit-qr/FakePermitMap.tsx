import { useMemo } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ScanEvent } from "../../types/permit";
import { ShieldAlert, Crosshair } from "lucide-react";

// Esri Hybrid Satellite style
const MAP_STYLE = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      attribution: "Tiles &copy; Esri"
    },
    "esri-reference": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256
    },
    "esri-transportation": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256
    }
  },
  layers: [
    {
      id: "esri-satellite-layer",
      type: "raster",
      source: "esri-satellite",
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: "esri-transportation-layer",
      type: "raster",
      source: "esri-transportation",
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: "esri-reference-layer",
      type: "raster",
      source: "esri-reference",
      minzoom: 0,
      maxzoom: 22
    }
  ]
} as any;

const INITIAL_VIEW_STATE = {
  longitude: 78.6569,
  latitude: 11.1271,
  zoom: 6,
};

interface Props {
  scans: ScanEvent[];
}

export function FakePermitMap({ scans }: Props) {
  const fakeScans = useMemo(() => scans.filter(s => s.result === "Invalid"), [scans]);

  return (
    <div className="bg-white border border-neutral-border rounded-2xl overflow-hidden shadow-sm h-full min-h-[500px] relative flex flex-col">
      <div className="bg-neutral-surface px-6 py-3 border-b border-neutral-border shrink-0 flex items-center justify-between z-10 relative">
        <h3 className="font-bold text-brand-900 flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-brand-500" /> Illicit Transport Hotspots
        </h3>
        <span className="bg-red-50 text-red-700 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border border-red-200 shadow-sm flex items-center gap-1.5">
           <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
           Live Feed
        </span>
      </div>

      <div className="flex-1 relative">
        <Map
          initialViewState={INITIAL_VIEW_STATE}
          mapStyle={MAP_STYLE}
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" />

          {fakeScans.map(scan => (
            <Marker
              key={scan.id}
              longitude={scan.location.lng}
              latitude={scan.location.lat}
              anchor="bottom"
            >
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-3 bg-red-500/30 rounded-full animate-ping"></div>
                <div className="relative w-5 h-5 bg-red-500 border-[3px] border-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max p-3 bg-white border border-neutral-border text-brand-900 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span className="text-red-700 font-black uppercase tracking-widest text-[10px]">{scan.invalidReason}</span>
                  </div>
                  <div className="font-bold text-sm text-brand-900">{scan.location.name}</div>
                  <div className="text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mt-1 border-t border-neutral-border pt-1">
                    Scan ID: {scan.id.split('-').pop()}
                  </div>
                </div>
              </div>
            </Marker>
          ))}
        </Map>
        
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-neutral-border shadow-sm max-w-xs">
           <h4 className="font-bold text-brand-900 text-sm mb-1">Enforcement Mapping</h4>
           <p className="text-xs font-medium text-neutral-ink/60 leading-relaxed">
             This map plots the exact GPS coordinates of all forged or invalid QR e-Pass scans to help identify smuggling corridors.
           </p>
        </div>
      </div>
    </div>
  );
}
