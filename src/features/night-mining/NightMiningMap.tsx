import { useMemo } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { NightAlert } from "../../types/nightMining";
import { Moon, Flame } from "lucide-react";

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
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm h-[400px] relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-lg">
        <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
          <Moon className="w-4 h-4 text-indigo-400" /> Night Ops Monitored
        </h3>
        <p className="text-xs text-slate-400 mt-1">Live thermal detection active (18:00 - 06:00)</p>
      </div>

      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
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
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-6 bg-red-500/20 rounded-full blur-sm animate-pulse"></div>
              <div className="absolute -inset-3 bg-orange-500/30 rounded-full animate-ping"></div>
              
              <div className="relative w-6 h-6 bg-slate-900 border border-red-500 rounded-full flex items-center justify-center shadow-lg">
                <Flame className="w-3.5 h-3.5 text-red-500" />
              </div>
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl text-center">
                <span className="text-red-400 font-bold">{alert.detectionType}</span>
                <br />
                <span className="text-slate-400">{alert.quarryName}</span>
              </div>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
