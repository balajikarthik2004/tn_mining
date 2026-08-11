import { useState, useMemo } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { InternalTrip } from "../../types/transport";
import { Truck, Navigation2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const INITIAL_VIEW_STATE = {
  longitude: 78.6569,
  latitude: 11.1271,
  zoom: 6.5,
};

interface Props {
  trips: InternalTrip[];
}

export function LiveMonitoringMap({ trips }: Props) {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const navigate = useNavigate();

  const activeTrips = useMemo(() => trips.filter(t => t.status !== "Delivered"), [trips]);
  const selectedTrip = useMemo(() => trips.find(t => t.id === selectedTripId), [trips, selectedTripId]);

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm h-[500px] relative">
      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />

        {activeTrips.map(trip => {
          let color = "#3b82f6";
          if (trip.status === "Suspicious") color = "#f97316";
          if (trip.status === "Overdue") color = "#ef4444";

          let rotation = 0;
          if (trip.route.length >= 2) {
            const p1 = trip.route[trip.route.length - 2];
            const p2 = trip.route[trip.route.length - 1];
            rotation = Math.atan2(p2.lng - p1.lng, p2.lat - p1.lat) * (180 / Math.PI);
          }

          return (
            <Marker
              key={trip.id}
              longitude={trip.currentLocation.lng}
              latitude={trip.currentLocation.lat}
              anchor="center"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedTripId(trip.id);
              }}
              style={{ cursor: "pointer" }}
            >
              <div 
                className="relative group transition-transform hover:scale-125"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${color}20`, border: `2px solid ${color}` }}
                >
                  <Navigation2 className="w-4 h-4 text-white" style={{ fill: color }} />
                </div>
              </div>
            </Marker>
          );
        })}

        {selectedTrip && (
          <Popup
            longitude={selectedTrip.currentLocation.lng}
            latitude={selectedTrip.currentLocation.lat}
            anchor="bottom"
            onClose={() => setSelectedTripId(null)}
            closeButton={false}
            className="z-50"
            maxWidth="300px"
          >
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl min-w-[250px]">
              <div className="flex justify-between items-start mb-2 border-b border-slate-700/50 pb-2">
                <div>
                  <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-indigo-400" />
                    {selectedTrip.vehicleNumber}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedTrip.operatorName}</p>
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                  selectedTrip.status === "In Transit" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                  selectedTrip.status === "Suspicious" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                  "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {selectedTrip.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Origin:</span>
                  <span className="font-medium">{selectedTrip.originQuarry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dest:</span>
                  <span className="font-medium">{selectedTrip.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mineral:</span>
                  <span className="font-medium">{selectedTrip.mineralType} ({selectedTrip.loadingWeightTonnes}t)</span>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/transport-monitoring/${selectedTrip.id}`)}
                className="w-full mt-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors"
              >
                View Trip Sheet
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
