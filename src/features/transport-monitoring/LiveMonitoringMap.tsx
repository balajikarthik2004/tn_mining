import { useState, useMemo } from "react";
import Map, { Marker, NavigationControl, Popup, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { InternalTrip } from "../../types/transport";
import { Truck, Navigation2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const INITIAL_VIEW_STATE = {
  longitude: 78.6569,
  latitude: 11.1271,
  zoom: 6.5,
};

const SATELLITE_STYLE: any = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '&copy; Esri'
    },
    'esri-labels': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256
    },
    'esri-roads': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256
    }
  },
  layers: [
    { id: 'satellite-layer', type: 'raster', source: 'esri-satellite', minzoom: 0, maxzoom: 22 },
    { id: 'roads-layer', type: 'raster', source: 'esri-roads', minzoom: 0, maxzoom: 22 },
    { id: 'labels-layer', type: 'raster', source: 'esri-labels', minzoom: 0, maxzoom: 22 }
  ]
};

interface Props {
  trips: InternalTrip[];
}

export function LiveMonitoringMap({ trips }: Props) {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const navigate = useNavigate();

  const activeTrips = useMemo(() => trips.filter(t => t.status !== "Delivered"), [trips]);
  const selectedTrip = useMemo(() => trips.find(t => t.id === selectedTripId), [trips, selectedTripId]);

  const actualRouteGeoJSON = useMemo(() => {
    if (!selectedTrip || selectedTrip.route.length < 2) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: selectedTrip.route.map(p => [p.lng, p.lat])
      }
    };
  }, [selectedTrip]);

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-neutral-border shadow-md">
        <h3 className="text-sm font-bold text-brand-900 mb-2 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-brand-500" />
          Active Route Monitoring
        </h3>
        <div className="space-y-2 text-xs font-semibold">
          <div className="flex items-center gap-2 text-neutral-ink/70">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm border border-blue-600/20"></span>
            In Transit ({activeTrips.filter(t => t.status === "In Transit").length})
          </div>
          <div className="flex items-center gap-2 text-orange-700">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm border border-orange-600/20 animate-pulse"></span>
            Suspicious/Route Deviation ({activeTrips.filter(t => t.status === "Suspicious").length})
          </div>
          <div className="flex items-center gap-2 text-red-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm border border-red-600/20 animate-pulse"></span>
            Overdue Trip ({activeTrips.filter(t => t.status === "Overdue").length})
          </div>
        </div>
      </div>

      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={SATELLITE_STYLE}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />

        {actualRouteGeoJSON && (
          <Source id="selected-route" type="geojson" data={actualRouteGeoJSON}>
            <Layer
              id="selected-route-line"
              type="line"
              paint={{
                "line-color": selectedTrip?.status === "Suspicious" ? "#f97316" : selectedTrip?.status === "Overdue" ? "#ef4444" : "#3b82f6",
                "line-width": 4,
                "line-opacity": 0.8
              }}
            />
          </Source>
        )}

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
              style={{ cursor: "pointer", zIndex: selectedTripId === trip.id ? 10 : 1 }}
            >
              <div 
                className={`relative group transition-transform hover:scale-125 ${selectedTripId === trip.id ? 'scale-125' : ''}`}
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${color}40`, border: `2px solid ${color}` }}
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
            <div className="p-4 bg-white border border-neutral-border rounded-xl shadow-xl min-w-[250px] font-sans">
              <div className="flex justify-between items-start mb-3 border-b border-neutral-border/50 pb-2">
                <div>
                  <h4 className="font-bold text-brand-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-brand-500" />
                    {selectedTrip.vehicleNumber}
                  </h4>
                  <p className="text-[10px] font-bold text-neutral-ink/50 mt-0.5 uppercase tracking-wider">{selectedTrip.operatorName}</p>
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                  selectedTrip.status === "In Transit" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  selectedTrip.status === "Suspicious" ? "bg-orange-50 text-orange-700 border-orange-200" :
                  "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {selectedTrip.status}
                </span>
              </div>
              
              <div className="bg-neutral-surface rounded-lg p-3 space-y-2 text-xs text-neutral-ink/80 border border-neutral-border">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-ink/50">Origin:</span>
                  <span className="font-bold text-brand-900">{selectedTrip.originQuarry}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-ink/50">Dest:</span>
                  <span className="font-bold text-brand-900">{selectedTrip.destination}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-ink/50">Load:</span>
                  <span className="font-bold text-brand-900">{selectedTrip.loadingWeightTonnes}t {selectedTrip.mineralType}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/transport-monitoring/${selectedTrip.id}`)}
                className="w-full mt-3 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                View Digital e-Pass
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
