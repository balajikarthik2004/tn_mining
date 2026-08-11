import { useState, useMemo } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";
import type { VehicleTrip } from "../../types/transport";
import { Truck, Navigation2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  trips: VehicleTrip[];
}

const INITIAL_VIEW_STATE = {
  longitude: 78.6569,
  latitude: 11.1271,
  zoom: 6,
};

export function LiveTransportMap({ trips }: Props) {
  const [selectedTrip, setSelectedTrip] = useState<VehicleTrip | null>(null);

  const markers = useMemo(() => {
    return trips.map((trip) => {
      const color = 
        trip.status === "Illegal" ? "#ef4444" : 
        trip.status === "Suspicious" ? "#eab308" : 
        "#22c55e";

      return (
        <Marker
          key={trip.id}
          longitude={trip.currentLocation.lng}
          latitude={trip.currentLocation.lat}
          anchor="bottom"
          onClick={(e: any) => {
            e.originalEvent.stopPropagation();
            setSelectedTrip(trip);
          }}
        >
          <div className="relative group cursor-pointer">
            <div 
              className={`absolute -inset-2 rounded-full opacity-30 ${trip.status === 'Illegal' ? 'animate-ping' : ''}`}
              style={{ backgroundColor: color }}
            />
            <div 
              className="relative bg-slate-900 border-2 rounded-full p-1.5 shadow-lg flex items-center justify-center"
              style={{ borderColor: color }}
            >
              <Navigation2 className="w-3.5 h-3.5 fill-current transform rotate-45" style={{ color }} />
            </div>
          </div>
        </Marker>
      );
    });
  }, [trips]);

  return (
    <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl overflow-hidden shadow-sm h-[500px] relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur px-4 py-3 rounded-lg border border-slate-700/50 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Live GPS Tracking</h3>
        <div className="space-y-2 text-xs font-medium">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            Valid Permit ({trips.filter(t => t.status === "Compliant").length})
          </div>
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span>
            Suspicious Route ({trips.filter(t => t.status === "Suspicious").length})
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"></span>
            No Permit/Illegal ({trips.filter(t => t.status === "Illegal").length})
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full border border-slate-700/50 shadow-lg text-xs font-medium text-slate-300 flex items-center gap-4">
        <span className="text-slate-400 uppercase tracking-wider text-[10px]">Monitored Borders</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>AP</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>Karnataka</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>Kerala</span>
      </div>

      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        {markers}

        {selectedTrip && (
          <Popup
            longitude={selectedTrip.currentLocation.lng}
            latitude={selectedTrip.currentLocation.lat}
            anchor="bottom"
            offset={[0, -20]}
            onClose={() => setSelectedTrip(null)}
            closeButton={false}
            className="z-50"
          >
            <div className="bg-slate-900 p-4 rounded-xl shadow-2xl border border-slate-700 min-w-[240px]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-slate-100 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-400" />
                    {selectedTrip.vehicleNumber}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{selectedTrip.operatorName}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                  selectedTrip.status === "Illegal" ? "bg-red-500/20 text-red-400" :
                  selectedTrip.status === "Suspicious" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-emerald-500/20 text-emerald-400"
                }`}>
                  {selectedTrip.status}
                </span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-300 space-y-2 mb-4 border border-slate-700/50">
                <div className="flex justify-between">
                  <span className="text-slate-500">Load</span>
                  <span className="font-medium text-slate-200">{selectedTrip.declaredWeightTonnes}t {selectedTrip.mineralType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Permit</span>
                  <span className={`font-medium ${selectedTrip.permitStatus === 'Valid' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedTrip.permitStatus}
                  </span>
                </div>
                {selectedTrip.borderState && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Heading</span>
                    <span className="font-medium text-orange-300">{selectedTrip.borderState} Border</span>
                  </div>
                )}
              </div>
              {(selectedTrip.status === "Illegal" || selectedTrip.status === "Suspicious") && (
                <Link 
                  to={`/transport-tracking/${selectedTrip.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                  View Alert Details
                </Link>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
