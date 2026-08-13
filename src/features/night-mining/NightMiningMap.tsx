import { useMemo } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { NightAlert } from "../../types/nightMining";
import { Flame, Satellite } from "lucide-react";

// Using Esri Satellite style for high-fidelity professional mapping
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
  zoom: 6.5,
};

interface Props {
  alerts: NightAlert[];
}

export function NightMiningMap({ alerts }: Props) {
  const activeAlerts = useMemo(() => alerts.filter(a => a.status === "Active" || a.status === "Escalated"), [alerts]);

  return (
    <div className="bg-white border border-neutral-border rounded-2xl overflow-hidden shadow-sm h-full relative flex flex-col min-h-0">
      <div className="bg-neutral-surface px-4 py-3 border-b border-neutral-border shrink-0 flex items-center justify-between z-10 relative">
        <h3 className="font-bold text-brand-900 flex items-center gap-2">
          <Satellite className="w-5 h-5 text-brand-500" /> Live Thermal Detections
        </h3>
        <span className="bg-red-50 text-red-700 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border border-red-200 shadow-sm flex items-center gap-1.5">
           <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
           Infrared Feed Active
        </span>
      </div>

      <div className="flex-1 relative bg-brand-950 min-h-0">
        {/* We use a slight dark overlay on the map container to simulate night operations */}
        <div className="absolute inset-0 bg-brand-950/20 z-[1] pointer-events-none" />
        <Map
          initialViewState={INITIAL_VIEW_STATE}
          mapStyle={MAP_STYLE}
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" />

          {activeAlerts.map(alert => (
            <Marker
              key={alert.id}
              longitude={alert.evidence.location.lng}
              latitude={alert.evidence.location.lat}
              anchor="center"
            >
              <div className="relative group cursor-pointer z-10">
                <div className="absolute -inset-6 bg-red-500/30 rounded-full blur-md animate-pulse"></div>
                <div className="absolute -inset-3 bg-amber-500/40 rounded-full animate-ping"></div>
                
                <div className="relative w-6 h-6 bg-red-950 border-[2px] border-red-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                </div>
                
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max p-3 bg-white border border-neutral-border text-brand-900 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span className="text-red-700 font-black uppercase tracking-widest text-[10px]">{alert.detectionType}</span>
                  </div>
                  <div className="font-bold text-sm text-brand-900">{alert.quarryName}</div>
                  <div className="text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mt-1 border-t border-neutral-border pt-1">
                    AI Confidence: {alert.confidenceScore}%
                  </div>
                </div>
              </div>
            </Marker>
          ))}
        </Map>

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-neutral-border shadow-sm z-10 max-w-xs">
           <h4 className="font-bold text-brand-900 text-sm mb-1">Thermal Surveillance</h4>
           <p className="text-xs font-medium text-neutral-ink/60 leading-relaxed">
             This map visualizes thermal anomalies and artificial lighting detected by satellite imagery after sunset (18:00 - 06:00).
           </p>
        </div>
      </div>
    </div>
  );
}
