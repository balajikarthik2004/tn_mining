import { useMemo, useRef, useState, useEffect } from "react";
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import { Search, MapPin, AlertTriangle } from "lucide-react";
import type { Quarry } from "../../../types/quarry";
import { TN_CENTER } from "../../../data/mock/districts";
import { formatINR } from "../../../utils/formatters";
import { calculateRevenueLoss } from "../../../utils/anomalyUtils";

const satelliteMapStyle = {
  version: 8 as const,
  name: "Satellite",
  sources: {
    "google-satellite": {
      type: "raster" as const,
      tiles: [
        "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
      ],
      tileSize: 256,
      attribution: "&copy; Google",
    }
  },
  layers: [
    {
      id: "satellite-layer",
      type: "raster" as const,
      source: "google-satellite",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

const TN_DISTRICTS_GEOJSON_URL = "/geo/tn-districts.geojson?v=3";
const TN_MASK_GEOJSON_URL = "/geo/tn-mask.geojson";

interface Props {
  quarries: Quarry[];
}

export function AnomalyMap({ quarries }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuarryId, setSelectedQuarryId] = useState<string | null>(null);
  const [hoveredQuarry, setHoveredQuarry] = useState<Quarry | null>(null);

  const anomalies = useMemo(() => {
    return quarries.filter(q => q.aiEstimatedExtractionVolumeM3Monthly > q.declaredExtractionVolumeM3Monthly);
  }, [quarries]);

  const filteredQuarries = useMemo(() => {
    if (!searchQuery) return anomalies;
    const lowerQuery = searchQuery.toLowerCase();
    return anomalies.filter(
      (q) =>
        q.name.toLowerCase().includes(lowerQuery) ||
        q.district.toLowerCase().includes(lowerQuery) ||
        q.id.toLowerCase().includes(lowerQuery)
    );
  }, [anomalies, searchQuery]);

  const geojson = useMemo<FeatureCollection>(() => ({
    type: "FeatureCollection",
    features: filteredQuarries.map((q) => {
      const gapM3 = q.aiEstimatedExtractionVolumeM3Monthly - q.declaredExtractionVolumeM3Monthly;
      const revenueLoss = calculateRevenueLoss(gapM3, q.mineralType);
      return {
        type: "Feature",
        id: q.id,
        geometry: { type: "Point", coordinates: [q.lng, q.lat] },
        properties: { 
          id: q.id, 
          name: q.name, 
          district: q.district,
          revenueLoss,
          gapM3
        },
      };
    }),
  }), [filteredQuarries]);

  // Handle zooming to selected quarry
  useEffect(() => {
    if (selectedQuarryId && mapRef.current) {
      const quarry = quarries.find(q => q.id === selectedQuarryId);
      if (quarry) {
        mapRef.current.flyTo({ center: [quarry.lng, quarry.lat], zoom: 12, duration: 1500 });
      }
    } else if (mapRef.current && !searchQuery) {
      mapRef.current.flyTo({ center: [TN_CENTER.lng, TN_CENTER.lat], zoom: 6.5, duration: 1000 });
    }
  }, [selectedQuarryId, quarries, searchQuery]);

  return (
    <div className="relative border border-slate-200/60 rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row h-[650px] mb-8 ring-1 ring-slate-900/5">
      {/* Map Area (Full Background) */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: TN_CENTER.lng,
            latitude: TN_CENTER.lat,
            zoom: 6.5,
          }}
          mapStyle={satelliteMapStyle}
          interactiveLayerIds={["unclustered-point"]}
          onMouseMove={(e) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              const quarry = quarries.find(q => q.id === feature.properties?.id);
              if (quarry) setHoveredQuarry(quarry);
            } else {
              setHoveredQuarry(null);
            }
          }}
          onClick={(e) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              setSelectedQuarryId(feature.properties?.id);
            } else {
              setSelectedQuarryId(null);
            }
          }}
          cursor={hoveredQuarry ? "pointer" : "grab"}
        >
          {/* Mask layer to darken/blur outside TN */}
          <Source id="tn-mask" type="geojson" data={TN_MASK_GEOJSON_URL}>
            <Layer
              id="mask-fill"
              type="fill"
              paint={{
                "fill-color": "#020617", // darker slate-950 for dramatic effect
                "fill-opacity": 0.75,
              }}
            />
          </Source>

          <Source id="tn-districts" type="geojson" data={TN_DISTRICTS_GEOJSON_URL}>
            <Layer
              id="districts-line"
              type="line"
              paint={{
                "line-color": "#38bdf8", // subtle cyan glow for borders
                "line-width": 1.5,
                "line-opacity": 0.4,
              }}
            />
          </Source>

          <Source
            id="quarries"
            type="geojson"
            data={geojson}
          >
            {/* Glowing outer ring for all points */}
            <Layer
              id="unclustered-point-glow"
              type="circle"
              paint={{
                "circle-radius": [
                  "interpolate", ["linear"], ["zoom"],
                  5, 10,
                  10, 20,
                  15, 30
                ],
                "circle-color": [
                  "case",
                  ["==", ["get", "id"], selectedQuarryId || ""],
                  "#ef4444",
                  "#f97316"
                ],
                "circle-opacity": 0.25,
                "circle-blur": 0.8,
              }}
            />
            
            {/* Core dot */}
            <Layer
              id="unclustered-point"
              type="circle"
              paint={{
                "circle-radius": [
                  "interpolate", ["linear"], ["zoom"],
                  5, 5,
                  10, 8,
                  15, 10
                ],
                "circle-color": [
                  "case",
                  ["==", ["get", "id"], selectedQuarryId || ""],
                  "#ef4444",
                  "#f97316"
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
              }}
            />
          </Source>

          {hoveredQuarry && (
            <Popup
              longitude={hoveredQuarry.lng}
              latitude={hoveredQuarry.lat}
              closeButton={false}
              closeOnClick={false}
              anchor="bottom"
              offset={15}
              className="z-50"
            >
              <div className="p-3 min-w-[220px] shadow-2xl rounded-xl bg-white border border-slate-100">
                <div className="font-bold text-brand-900 mb-1">{hoveredQuarry.name}</div>
                <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">{hoveredQuarry.district} • {hoveredQuarry.mineralType}</div>
                <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Declared</span>
                    <span className="font-semibold text-slate-700">{hoveredQuarry.declaredExtractionVolumeM3Monthly.toLocaleString()} m³</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">AI Estimated</span>
                    <span className="font-bold text-orange-600">{hoveredQuarry.aiEstimatedExtractionVolumeM3Monthly.toLocaleString()} m³</span>
                  </div>
                  <div className="h-px bg-slate-200 w-full my-0.5"></div>
                  <div className="flex justify-between items-center text-xs font-bold text-red-600">
                    <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Gap</span>
                    <span>{(hoveredQuarry.aiEstimatedExtractionVolumeM3Monthly - hoveredQuarry.declaredExtractionVolumeM3Monthly).toLocaleString()} m³</span>
                  </div>
                </div>
              </div>
            </Popup>
          )}

          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <FullscreenControl position="top-right" />
            <NavigationControl position="top-right" showCompass={false} />
          </div>
        </Map>
      </div>

      {/* Floating Glass Sidebar */}
      <div className="absolute left-4 top-4 bottom-4 w-full md:w-[340px] z-10 flex flex-col rounded-2xl overflow-hidden border border-white/20 bg-white/75 backdrop-blur-xl shadow-2xl transition-all">
        <div className="p-5 border-b border-slate-200/50 bg-white/40">
          <h3 className="font-bold text-brand-900 text-lg flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-brand-500" />
            Anomaly Radar
          </h3>
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="text"
              placeholder="Search quarries, districts..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/60 border border-slate-200/60 rounded-xl text-sm focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-medium placeholder:font-normal shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {filteredQuarries.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm bg-white/40 rounded-xl border border-slate-100/50">
              No anomalies match your search.
            </div>
          ) : (
            filteredQuarries.map((q) => {
              const gapM3 = q.aiEstimatedExtractionVolumeM3Monthly - q.declaredExtractionVolumeM3Monthly;
              const revenueLoss = calculateRevenueLoss(gapM3, q.mineralType);
              const isSelected = selectedQuarryId === q.id;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuarryId(q.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 flex items-start gap-3 relative overflow-hidden
                    ${isSelected 
                      ? "bg-white border-brand-200 shadow-md ring-1 ring-brand-500/20" 
                      : "bg-white/40 hover:bg-white/80 border-transparent hover:shadow-sm"
                    } border
                  `}
                >
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />}
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected ? "bg-brand-100 text-brand-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm truncate ${isSelected ? "text-brand-900" : "text-slate-700"}`}>
                      {q.name}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5 truncate uppercase tracking-wider">
                      {q.district} • {q.mineralType}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100/50">
                        <AlertTriangle className="w-3 h-3" />
                        {(gapM3).toLocaleString()} m³
                      </div>
                      <div className="text-xs font-bold text-slate-900 bg-slate-100/80 px-2 py-0.5 rounded-full">
                        {formatINR(revenueLoss)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
