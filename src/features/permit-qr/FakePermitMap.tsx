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
      attribution: "&copy; Esri &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP"
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
  const fakeScans = useMemo(() => scans.filter((s) => s.result === "Invalid"), [scans]);

  /**
   * Tally per rejection reason — a legend that carries data beats a paragraph explaining the map.
   * (Uses a record, not `new Map()`: the react-map-gl `Map` import shadows the global here.)
   */
  const reasonCounts = useMemo(() => {
    const tally: Record<string, number> = {};
    fakeScans.forEach((s) => {
      const reason = s.invalidReason ?? "Unspecified";
      tally[reason] = (tally[reason] ?? 0) + 1;
    });
    return Object.entries(tally).sort((a, b) => b[1] - a[1]);
  }, [fakeScans]);

  return (
    <div className="surface-card relative flex h-full flex-col overflow-hidden">
      <div className="relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-line bg-neutral-subtle/60 px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2 font-heading text-[15px] font-bold text-brand-900">
            <Crosshair className="h-4 w-4 text-brand-500" /> Rejected scans by checkpost
          </h3>
          <p className="mt-0.5 text-xs text-neutral-ink/50">
            Where today's failed e-Pass checks were recorded
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-status-violation/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-red-700 ring-1 ring-inset ring-status-violation/25">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-violation" />
          {fakeScans.length} rejected
        </span>
      </div>

      <div className="flex-1 relative">
        <Map
          initialViewState={INITIAL_VIEW_STATE}
          mapStyle={MAP_STYLE}
          attributionControl={{ compact: true }}
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
                  <div className="text-sm font-bold text-brand-900">{scan.location.name}</div>
                  <div className="mt-1 border-t border-neutral-line pt-1 text-[10px] font-bold uppercase tracking-widest text-neutral-ink/50">
                    {scan.quarryName ?? "No matching quarry record"}
                  </div>
                </div>
              </div>
            </Marker>
          ))}
        </Map>
        
        <div className="glass-bar absolute left-3 top-3 rounded-xl p-3 text-xs shadow-card ring-1 ring-inset ring-neutral-border">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-ink/50">
            Rejections by reason
          </p>
          <ul className="space-y-1.5">
            {reasonCounts.map(([reason, count]) => (
              <li key={reason} className="flex items-center justify-between gap-6 font-medium text-neutral-ink/75">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-status-violation" />
                  {reason}
                </span>
                <span className="font-bold tabular-nums text-brand-900">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
