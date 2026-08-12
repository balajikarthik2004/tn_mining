import { useState, useMemo } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";
import type { VehicleTrip } from "../../types/transport";
import { Truck, Navigation2, MapPin, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  trips: VehicleTrip[];
}

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

export function LiveTransportMap({ trips }: Props) {
  const [selectedTrip, setSelectedTrip] = useState<VehicleTrip | null>(null);

  const markers = useMemo(() => {
    return trips.map((trip) => {
      const color = 
        trip.status === "Illegal" ? "#ef4444" : 
        trip.status === "Suspicious" ? "#f97316" : 
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
              className={`absolute -inset-2 rounded-full opacity-40 ${trip.status === 'Illegal' ? 'animate-ping' : ''}`}
              style={{ backgroundColor: color }}
            />
            <div 
              className="relative bg-white border-[3px] rounded-full p-1.5 shadow-md flex items-center justify-center transition-transform hover:scale-110"
              style={{ borderColor: color }}
            >
              <Navigation2 className="w-4 h-4 fill-current transform rotate-45" style={{ color }} />
            </div>
          </div>
        </Marker>
      );
    });
  }, [trips]);

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-neutral-border shadow-md">
        <h3 className="text-sm font-bold text-brand-900 mb-2 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-brand-500" />
          Live GPS Tracking
        </h3>
        <div className="space-y-2 text-xs font-semibold">
          <div className="flex items-center gap-2 text-neutral-ink/70">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm border border-green-600/20"></span>
            Valid e-Pass ({trips.filter(t => t.status === "Compliant").length})
          </div>
          <div className="flex items-center gap-2 text-neutral-ink/70">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm border border-orange-600/20"></span>
            Suspicious Route ({trips.filter(t => t.status === "Suspicious").length})
          </div>
          <div className="flex items-center gap-2 text-red-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm border border-red-600/20 animate-pulse"></span>
            Missing/Forged Permit ({trips.filter(t => t.status === "Illegal").length})
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-neutral-border shadow-md text-xs font-bold text-neutral-ink/70 flex items-center gap-5">
        <span className="text-brand-900 uppercase tracking-widest text-[10px]">Monitored Borders</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-500"></span>Andhra Pradesh</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-500"></span>Karnataka</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-500"></span>Kerala</span>
      </div>

      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={SATELLITE_STYLE}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        {markers}

        {selectedTrip && (
          <Popup
            longitude={selectedTrip.currentLocation.lng}
            latitude={selectedTrip.currentLocation.lat}
            anchor="bottom"
            offset={[0, -24]}
            onClose={() => setSelectedTrip(null)}
            closeButton={false}
            className="z-50"
          >
            <div className="bg-white p-4 rounded-xl shadow-xl border border-neutral-border min-w-[260px] font-sans">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-brand-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-brand-500" />
                    {selectedTrip.vehicleNumber}
                  </h4>
                  <p className="text-[10px] text-neutral-ink/50 mt-0.5 font-bold uppercase">{selectedTrip.operatorName}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  selectedTrip.status === "Illegal" ? "bg-red-50 text-red-700 border-red-200" :
                  selectedTrip.status === "Suspicious" ? "bg-orange-50 text-orange-700 border-orange-200" :
                  "bg-green-50 text-green-700 border-green-200"
                }`}>
                  {selectedTrip.status}
                </span>
              </div>
              
              <div className="bg-neutral-surface rounded-lg p-3 text-xs text-neutral-ink/80 space-y-2.5 mb-4 border border-neutral-border">
                <div className="flex justify-between items-center border-b border-neutral-border/50 pb-1.5">
                  <span className="text-neutral-ink/50 font-medium">Declared Load</span>
                  <span className="font-bold text-brand-900">{selectedTrip.declaredWeightTonnes}t {selectedTrip.mineralType}</span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-border/50 pb-1.5">
                  <span className="text-neutral-ink/50 font-medium">e-Pass Status</span>
                  <span className={`font-bold ${selectedTrip.permitStatus === 'Valid' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTrip.permitStatus}
                  </span>
                </div>
                {selectedTrip.borderState && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-ink/50 font-medium">Approaching</span>
                    <span className="font-bold text-orange-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {selectedTrip.borderState}
                    </span>
                  </div>
                )}
              </div>
              
              {(selectedTrip.status === "Illegal" || selectedTrip.status === "Suspicious") && (
                <Link 
                  to={`/transport-tracking/${selectedTrip.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  View Checkpost Details
                </Link>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
