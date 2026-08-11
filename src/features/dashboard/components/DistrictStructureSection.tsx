import { useEffect, useState, useMemo } from "react";
import Map, { Source, Layer, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Download, Eye, MapPinOff } from "lucide-react";
import type { Quarry } from "../../../types/quarry";

const minimalMapStyle = {
  version: 8 as const,
  name: "Empty",
  metadata: {},
  sources: {},
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
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
    fetch("/geo/tn-districts.geojson?v=3")
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
    <div className="w-full rounded-2xl bg-white p-6 md:p-8 border border-neutral-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-brand-900">
            Regional Intelligence
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Statewide Infrastructure & Administrative Overview
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* LEFT CARD: Full State Map */}
        <div className="flex-[4] rounded-xl border border-slate-200 bg-slate-50 p-2 relative min-h-[450px] overflow-hidden">
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
                      "#eab308", // Amber 500 for selected
                      ["==", ["get", "Dist_Name"], selectedDistrict || ""],
                      "#eab308",
                      "#cbd5e1", // Slate 300 for others
                    ],
                    "fill-opacity": 1.0,
                  }}
                />
                <Layer
                  id="district-line"
                  type="line"
                  paint={{
                    "line-color": "#ffffff", // White boundaries
                    "line-width": ["case", ["==", ["get", "dtname"], selectedDistrict || ""], 2, 1],
                  }}
                />
              </Source>
              
              {/* Custom Map Tooltip */}
              {hoveredDistrict && (
                <div 
                  className="absolute z-50 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px]"
                  style={{ left: hoveredDistrict.x, top: hoveredDistrict.y }}
                >
                  {hoveredDistrict.name}
                  <div className="absolute w-2 h-2 bg-slate-900 rotate-45 left-1/2 transform -translate-x-1/2 -bottom-1"></div>
                </div>
              )}
            </Map>
          )}
        </div>

        {/* CENTER CARD: Selected District Map */}
        <div className="flex-[3] flex flex-col justify-center items-center">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Focus Region</h3>
            <h4 className="text-brand-900 text-xl font-bold mb-6">
              {selectedDistrict || "Select a District"}
            </h4>
            
            {centerGeojson && centerGeojson.features.length > 0 && centerBbox ? (
              <div className="w-40 h-40 sm:w-48 sm:h-48 relative drop-shadow-md mx-auto transition-transform duration-300">
                <Map
                  key={selectedDistrict} 
                  mapLib={maplibregl}
                  initialViewState={{
                    bounds: centerBbox,
                    fitBoundsOptions: { padding: 30 }
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
                        "fill-color": "#eab308", 
                        "fill-opacity": 1.0,
                      }}
                    />
                    <Layer
                      id="center-district-line"
                      type="line"
                      paint={{
                        "line-color": "#f8fafc",
                        "line-width": 2,
                      }}
                    />
                  </Source>
                </Map>
              </div>
            ) : (
              <div className="w-full h-40 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl bg-white mt-4">
                <MapPinOff className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-slate-400 text-xs font-medium">No Data Available</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CARD: List of items */}
        <div className="flex-[4] rounded-xl border border-slate-200 bg-white p-4 flex flex-col h-[450px]">
          <div className="mb-4 pb-4 border-b border-slate-100 flex flex-col items-center justify-center text-center">
             <span className="text-brand-900 font-bold text-lg">
                {selectedDistrict ? `${selectedDistrict}` : "Tamil Nadu"}
             </span>
             <span className="text-slate-500 font-medium text-xs mt-1">
                {selectedDistrict ? "Active Operations" : "District Overview"}
             </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 pb-2">
            {!selectedDistrict ? (
              // SHOW ALL DISTRICTS
              allDistricts.map((district, index) => {
                const count = getQuarryCountForDistrict(district);
                return (
                  <button 
                    key={district} 
                    onClick={() => setSelectedDistrict(district)}
                    className="w-full bg-white rounded-lg flex items-center p-3 text-slate-700 border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-semibold text-xs shrink-0">
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="font-semibold text-sm">
                        {district}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${count > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        {count} {count === 1 ? 'Quarry' : 'Quarries'}
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
                  className="w-full mb-3 py-2 text-xs font-medium text-slate-500 hover:text-brand-900 flex items-center justify-center gap-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  ← Return to All Districts
                </button>
                
                {districtQuarries.length > 0 ? (
                  districtQuarries.map((quarry, index) => (
                    <div key={quarry.id} className="bg-white rounded-lg flex items-center p-3 text-slate-700 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-default">
                      <div className="w-6 h-6 rounded-full bg-brand-900 text-white flex items-center justify-center font-medium text-xs shrink-0">
                        {index + 1}
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="font-semibold text-sm truncate text-brand-900">
                          {quarry.name}
                        </div>
                        <div className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">
                          {quarry.mineralType}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0 ml-2">
                        <button className="p-1.5 text-slate-400 hover:text-brand-900 hover:bg-slate-100 rounded transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-brand-900 hover:bg-slate-100 rounded transition-colors" title="Download Report">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center px-4 bg-slate-50 rounded-lg border border-slate-100">
                    <MapPinOff className="w-6 h-6 text-slate-400 mb-2" />
                    <h4 className="text-slate-700 font-semibold text-sm mb-1">No Active Operations</h4>
                    <p className="text-slate-500 text-xs">
                      No mining sites in <span className="font-semibold">{selectedDistrict}</span>.
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
