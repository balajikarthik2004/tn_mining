import { useMemo } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ScanEvent } from "../../types/permit";
import { ShieldAlert } from "lucide-react";

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
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm h-[500px] relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-lg">
        <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
          <ShieldAlert className="w-4 h-4 text-red-500" /> Invalid Permit Hotspots
        </h3>
        <p className="text-xs text-slate-400 mt-1">Live locations of rejected permits</p>
      </div>

      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
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
              <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping"></div>
              <div className="relative w-4 h-4 bg-red-500 border-2 border-slate-900 rounded-full shadow-lg"></div>
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                <span className="text-red-400 font-bold">{scan.invalidReason}</span>
                <br />
                <span className="text-slate-400">{scan.location.name}</span>
              </div>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
