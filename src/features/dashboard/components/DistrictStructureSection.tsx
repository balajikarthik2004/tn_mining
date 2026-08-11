import { useEffect, useState, useMemo } from "react";
import Map, { Source, Layer, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Download, Eye, MapPinOff, Layers } from "lucide-react";
import type { Quarry } from "../../../types/quarry";

const minimalMapStyle = {
  version: 8 as const,
  name: "Empty",
  metadata: {},
  sources: {},
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "transparent",
      },
    } as any,
  ],
};

interface DistrictStructureSectionProps {
  quarries: Quarry[];
}

// Helper to compute bounding box for GeoJSON to perfectly center the mini-map
function getGeoJSONBBox(geojson: any): [number, number, number, number] | null {
  if (!geojson || !geojson.features || geojson.features.length === 0) return null;
  let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;
  
  const processCoords = (coords: any[]) => {
    if (typeof coords[0] === "number") {
      if (coords[0] < minLng) minLng = coords[0];
      if (coords[0] > maxLng) maxLng = coords[0];
      if (coords[1] < minLat) minLat = coords[1];
      if (coords[1] > maxLat) maxLat = coords[1];
    } else {
      coords.forEach(processCoords);
    }
  };

  geojson.features.forEach((f: any) => {
    if (f.geometry && f.geometry.coordinates) {
      processCoords(f.geometry.coordinates);
    }
  });

  if (minLng === 180) return null;
  return [minLng, minLat, maxLng, maxLat];
}

export function DistrictStructureSection({ quarries }: DistrictStructureSectionProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<{name: string, x: number, y: number} | null>(null);

  useEffect(() => {
    fetch("/geo/tn-districts.geojson?v=2")
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error("Error fetching GeoJSON", err));
  }, []);

  const allDistricts = useMemo(() => {
    if (!geojsonData) return [];
    const districts = new Set<string>();
    geojsonData.features.forEach((f: any) => {
      const name = f.properties?.dtname || f.properties?.Dist_Name || f.properties?.NAME_2 || f.properties?.district || f.properties?.name;
      if (name) districts.add(name);
    });
    return Array.from(districts).sort();
  }, [geojsonData]);

  const getQuarryCountForDistrict = (districtName: string) => {
    return quarries.filter(
      (q) =>
        q.district.toLowerCase() === districtName.toLowerCase() ||
        q.district.toLowerCase().includes(districtName.toLowerCase()) ||
        districtName.toLowerCase().includes(q.district.toLowerCase())
    ).length;
  };

  const onClick = (event: MapLayerMouseEvent) => {
    const { features } = event;
    if (features && features.length > 0) {
      const p = features[0].properties || {};
      const districtName = p.dtname || p.Dist_Name || p.NAME_2 || p.district || p.name;
      if (districtName) {
        setSelectedDistrict(prev => prev === districtName ? null : districtName);
      }
    }
  };

  const onMouseMove = (event: MapLayerMouseEvent) => {
    const { features, point } = event;
    if (features && features.length > 0 && features[0].layer.id === "district-fill") {
      const p = features[0].properties || {};
      const districtName = p.dtname || p.Dist_Name || p.NAME_2 || p.district || p.name;
      if (districtName) {
        setHoveredDistrict({ name: districtName, x: point.x, y: point.y });
        return;
      }
    }
    setHoveredDistrict(null);
  };

  const onMouseLeave = () => setHoveredDistrict(null);

  const districtQuarries = useMemo(() => {
    if (!selectedDistrict) return [];
    return quarries.filter(
      (q) =>
        q.district.toLowerCase() === selectedDistrict.toLowerCase() ||
        q.district.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
        selectedDistrict.toLowerCase().includes(q.district.toLowerCase())
    );
  }, [quarries, selectedDistrict]);

  // Center Map bounds calculation
  const centerGeojson = useMemo(() => {
    if (!geojsonData || !selectedDistrict) return null;
    const features = geojsonData.features.filter((f: any) => {
      const p = f.properties || {};
      const name = p.dtname || p.Dist_Name || p.NAME_2 || p.district || p.name;
      return name && name.toLowerCase() === selectedDistrict.toLowerCase();
    });
    return { type: "FeatureCollection" as const, features };
  }, [geojsonData, selectedDistrict]);

  const centerBbox = useMemo(() => getGeoJSONBBox(centerGeojson), [centerGeojson]);

  const fullBbox = useMemo(() => getGeoJSONBBox(geojsonData), [geojsonData]);

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-[#801016] via-[#911319] to-[#5C0A1E] p-6 md:p-8 text-white shadow-[0_20px_50px_rgba(145,19,25,0.4)] relative overflow-hidden ring-1 ring-white/10">
      {/* Background abstract decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10 pointer-events-none">
        <Layers className="w-96 h-96" />
      </div>

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-2 h-8 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)]"></div>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest drop-shadow-md">
          District Structure
        </h2>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 relative z-10">
        {/* LEFT CARD: Full State Map */}
        <div className="flex-[4] rounded-2xl border border-white/20 bg-black/10 backdrop-blur-md p-4 relative min-h-[500px] overflow-hidden shadow-inner">
          {geojsonData && fullBbox && (
            <Map
              mapLib={maplibregl}
              initialViewState={{
                bounds: fullBbox,
                fitBoundsOptions: { padding: 40 }
              }}
              mapStyle={minimalMapStyle}
              interactiveLayerIds={["district-fill"]}
              onClick={onClick}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              cursor={hoveredDistrict ? "pointer" : "default"}
              attributionControl={false}
              dragPan={false}
              scrollZoom={false}
            >
              <Source id="tn-districts-full" type="geojson" data={geojsonData}>
                <Layer
                  id="district-fill"
                  type="fill"
                  paint={{
                    "fill-color": [
                      "case",
                      ["==", ["get", "dtname"], selectedDistrict || ""],
                      "#fbbf24", // Yellow for selected
                      ["==", ["get", "Dist_Name"], selectedDistrict || ""],
                      "#fbbf24",
                      "rgba(255, 255, 255, 0.95)", // Almost white for others
                    ],
                    "fill-opacity": 1.0,
                  }}
                />
                <Layer
                  id="district-line"
                  type="line"
                  paint={{
                    "line-color": "#b91c1c", // Red boundaries
                    "line-width": ["case", ["==", ["get", "dtname"], selectedDistrict || ""], 2, 0.8],
                  }}
                />
                <Layer
                  id="district-label"
                  type="symbol"
                  paint={{
                    "text-color": [
                      "case",
                      ["==", ["get", "dtname"], selectedDistrict || ""],
                      "#000000",
                      ["==", ["get", "Dist_Name"], selectedDistrict || ""],
                      "#000000",
                      "#ffffff"
                    ],
                    "text-halo-color": [
                      "case",
                      ["==", ["get", "dtname"], selectedDistrict || ""],
                      "rgba(255,255,255,0.8)",
                      ["==", ["get", "Dist_Name"], selectedDistrict || ""],
                      "rgba(255,255,255,0.8)",
                      "rgba(0,0,0,0.8)"
                    ],
                    "text-halo-width": 1,
                  }}
                  layout={{
                    "text-field": [
                      "coalesce", 
                      ["get", "dtname"], 
                      ["get", "Dist_Name"], 
                      ["get", "NAME_2"], 
                      ["get", "district"], 
                      ["get", "name"], 
                      ""
                    ],
                    "text-font": ["Open Sans Regular"],
                    "text-size": ["interpolate", ["linear"], ["zoom"], 4, 8, 8, 12],
                    "text-justify": "center",
                    "text-anchor": "center",
                    "symbol-placement": "point",
                  }}
                />
              </Source>
              
              {/* Custom Map Tooltip */}
              {hoveredDistrict && (
                <div 
                  className="absolute z-50 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-sm font-semibold rounded-md shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px]"
                  style={{ left: hoveredDistrict.x, top: hoveredDistrict.y }}
                >
                  {hoveredDistrict.name}
                  <div className="absolute w-2 h-2 bg-black/80 rotate-45 left-1/2 transform -translate-x-1/2 -bottom-1"></div>
                </div>
              )}
            </Map>
          )}
        </div>

        {/* CENTER CARD: Selected District Map */}
        <div className="flex-[3] flex flex-col justify-center min-h-[300px]">
          <div className="rounded-2xl border border-white/20 bg-black/20 backdrop-blur-md p-6 relative h-full flex flex-col items-center justify-center shadow-inner">
            <h3 className="text-white/80 uppercase tracking-widest text-sm font-semibold mb-1">Selected Region</h3>
            <h4 className="text-yellow-400 text-2xl font-bold mb-6 drop-shadow-sm text-center">
              {selectedDistrict || "Select a District"}
            </h4>
            
            {centerGeojson && centerGeojson.features.length > 0 && centerBbox ? (
              <div className="w-full flex-1 relative min-h-[250px] drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
                <Map
                  key={selectedDistrict} 
                  mapLib={maplibregl}
                  initialViewState={{
                    bounds: centerBbox,
                    fitBoundsOptions: { padding: 40 }
                  }}
                  mapStyle={minimalMapStyle}
                  interactiveLayerIds={["center-district-fill"]}
                  attributionControl={false}
                  dragPan={false}
                  scrollZoom={false}
                >
                  <Source id="tn-district-center" type="geojson" data={centerGeojson}>
                    <Layer
                      id="center-district-fill"
                      type="fill"
                      paint={{
                        "fill-color": "#fbbf24", 
                        "fill-opacity": 1.0,
                      }}
                    />
                    <Layer
                      id="center-district-line"
                      type="line"
                      paint={{
                        "line-color": "#7f1d1d",
                        "line-width": 3,
                      }}
                    />
                  </Source>
                </Map>
              </div>
            ) : (
              <div className="w-full flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl mt-4">
                <MapPinOff className="w-12 h-12 text-white/20" />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CARD: List of items */}
        <div className="flex-[4] rounded-2xl border border-white/20 bg-black/20 backdrop-blur-md p-4 flex flex-col shadow-inner overflow-hidden h-[500px]">
          <div className="w-full h-32 bg-gradient-to-r from-red-700/80 to-yellow-600/80 rounded-xl mb-4 relative overflow-hidden flex flex-col items-center justify-center border border-white/10 shadow-md shrink-0">
             <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
             <span className="text-white font-black text-2xl drop-shadow-lg tracking-widest uppercase relative z-10 text-center px-4">
                {selectedDistrict ? `${selectedDistrict}` : "TAMIL NADU"}
             </span>
             <span className="text-white/80 font-medium text-xs tracking-[0.2em] uppercase relative z-10 mt-1 text-center">
                {selectedDistrict ? "Mining Infrastructure" : "All Districts"}
             </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 pb-2">
            {!selectedDistrict ? (
              // SHOW ALL DISTRICTS
              allDistricts.map((district, index) => {
                const count = getQuarryCountForDistrict(district);
                return (
                  <button 
                    key={district} 
                    onClick={() => setSelectedDistrict(district)}
                    className="w-full bg-white/95 backdrop-blur-sm rounded-xl flex items-center p-3 text-neutral-800 shadow-sm border border-transparent hover:border-yellow-500/50 hover:shadow-md transition-all group text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 text-neutral-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner group-hover:from-yellow-400 group-hover:to-yellow-600 group-hover:text-white transition-colors">
                      {index + 1}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-bold text-sm text-neutral-900 group-hover:text-[#911319] transition-colors">
                        {district}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${count > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-neutral-100 text-neutral-500'}`}>
                        {count} Quarries
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              // SHOW QUARRIES FOR SELECTED DISTRICT
              <>
                <button 
                  onClick={() => setSelectedDistrict(null)}
                  className="w-full mb-2 py-2 text-sm font-semibold text-white/70 hover:text-white flex items-center justify-center gap-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                >
                  ← Back to All Districts
                </button>
                
                {districtQuarries.length > 0 ? (
                  districtQuarries.map((quarry, index) => (
                    <div key={quarry.id} className="bg-white/95 backdrop-blur-sm rounded-xl flex items-center p-3 text-neutral-800 shadow-sm border border-transparent hover:border-yellow-500/50 hover:shadow-md transition-all group cursor-default">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#911319] to-[#5C0A1E] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                        {index + 1}
                      </div>
                      <div className="ml-4 flex-1 overflow-hidden">
                        <div className="font-bold text-sm text-neutral-900 truncate group-hover:text-[#911319] transition-colors">
                          {quarry.name}
                        </div>
                        <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">
                          {quarry.mineralType}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity ml-2">
                        <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-100 hover:text-[#911319] transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-100 hover:text-[#911319] transition-colors" title="Download Report">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center px-6 animate-in fade-in duration-500">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/20">
                      <MapPinOff className="w-8 h-8 text-white/50" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2 drop-shadow-sm">No Active Operations</h4>
                    <p className="text-white/60 text-sm leading-relaxed font-medium">
                      There are currently no registered or active mining operations within the administrative boundaries of <span className="text-white/90 font-semibold">{selectedDistrict}</span>.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
