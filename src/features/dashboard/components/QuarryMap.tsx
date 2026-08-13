import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  FullscreenControl,
} from "react-map-gl/maplibre";
import type { MapRef, MapMouseEvent } from "react-map-gl/maplibre";
import type { GeoJSONSource } from "maplibre-gl";
import type { FeatureCollection, Point } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, Layers, RotateCcw } from "lucide-react";
import type { Quarry } from "../../../types/quarry";
import { STATUS_META, type QuarryStatus } from "../../../types/common";
import { TN_CENTER, TN_BOUNDS, DISTRICT_CENTERS } from "../../../data/mock/districts";
import { useDashboardStore } from "../../../store/dashboardStore";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Skeleton } from "../../../components/ui/Skeleton";

/**
 * OpenFreeMap "positron" — a light, label-light basemap that gives roads/towns/coastline context
 * without competing with the status markers. Token-free and no billing account (see CLAUDE.md).
 * Replaces an empty background style, which left the map blank whenever the camera zoomed into a
 * district.
 */
const BASEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

const TN_DISTRICTS_GEOJSON_URL = "/geo/tn-districts.geojson?v=4";
/** World polygon with Tamil Nadu punched out — hides every neighbouring state on the basemap. */
const TN_MASK_GEOJSON_URL = "/geo/tn-mask.geojson?v=2";
const TN_OUTLINE_GEOJSON_URL = "/geo/tn-outline.geojson?v=2";

interface QuarryMapProps {
  quarries: Quarry[];
  selectedDistrict?: string | null;
  onDistrictSelect?: (district: string | null) => void;
}

const QUARRY_SOURCE_ID = "quarries";
const DISTRICTS_SOURCE_ID = "tn-districts";
const CLUSTER_SHADOW_LAYER = "quarry-clusters-shadow";
const CLUSTER_LAYER = "quarry-clusters";
const CLUSTER_COUNT_LAYER = "quarry-cluster-count";
const UNCLUSTERED_HALO_LAYER = "quarry-unclustered-halo";
const UNCLUSTERED_LAYER = "quarry-unclustered-point";
const SELECTED_RING_LAYER = "quarry-selected-ring";
const QUARRY_LABEL_LAYER = "quarry-labels";

/**
 * District name lookup. The bundled TN GeoJSON stores the name in `NAME_2` — earlier code compared
 * `["get","dtname"]`, a property that doesn't exist in the file, so the selected/hovered district
 * never highlighted. Coalesce over the known spellings so alternate sources keep working.
 */
// `any` so it can be spliced into both paint (DataDrivenPropertyValueSpecification) and layout
// (text-field) expressions without fighting MapLibre's generated expression types.
const DISTRICT_NAME_EXPR: any = [
  "coalesce",
  ["get", "dtname"],
  ["get", "NAME_2"],
  ["get", "Dist_Name"],
  ["get", "district"],
  ["get", "name"],
  "",
];

/** Frames the whole state — used on first load and whenever the district filter is cleared. */
function frameTamilNadu(map: { fitBounds: MapRef["fitBounds"] }, duration: number) {
  map.fitBounds(
    [
      [TN_BOUNDS.minLng, TN_BOUNDS.minLat],
      [TN_BOUNDS.maxLng, TN_BOUNDS.maxLat],
    ],
    { padding: 44, duration }
  );
}

interface HoveredQuarry {
  id: string;
  name: string;
  status: QuarryStatus;
  mineralType: string;
  lng: number;
  lat: number;
}

function quarriesToGeoJSON(quarries: Quarry[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: quarries.map((q) => ({
      type: "Feature",
      id: q.id,
      geometry: { type: "Point", coordinates: [q.lng, q.lat] },
      properties: { id: q.id, status: q.status, name: q.name, mineralType: q.mineralType },
    })),
  };
}

// Map style expression: ["match", ["get","status"], "Compliant", "#22c55e", ..., fallbackColor]
const STATUS_COLOR_MATCH: unknown[] = ["match", ["get", "status"]];
(Object.keys(STATUS_META) as QuarryStatus[]).forEach((status) => {
  STATUS_COLOR_MATCH.push(status, STATUS_META[status].color);
});
STATUS_COLOR_MATCH.push("#6b7280"); // fallback

export function QuarryMap({ quarries, selectedDistrict, onDistrictSelect }: QuarryMapProps) {
  const mapRef = useRef<MapRef>(null);
  const selectQuarry = useDashboardStore((s) => s.selectQuarry);
  const selectedQuarryId = useDashboardStore((s) => s.selectedQuarryId);
  const [hovered, setHovered] = useState<HoveredQuarry | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

  const geojson = useMemo(() => quarriesToGeoJSON(quarries), [quarries]);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  // Read the current quarries inside the camera effect without re-running it on every
  // 5-minute refresh — the camera should only move when the district selection changes.
  const quarriesRef = useRef(quarries);
  quarriesRef.current = quarries;

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!selectedDistrict) {
      frameTamilNadu(map, 900);
      return;
    }

    // Frame the district's actual quarries so individual pits separate out instead of
    // staying stacked in one cluster at a fixed zoom.
    const points = quarriesRef.current.filter((q) => q.district === selectedDistrict);
    if (points.length > 0) {
      const lngs = points.map((q) => q.lng);
      const lats = points.map((q) => q.lat);
      const pad = 0.04; // keeps a single-quarry district from zooming to street level
      map.fitBounds(
        [
          [Math.min(...lngs) - pad, Math.min(...lats) - pad],
          [Math.max(...lngs) + pad, Math.max(...lats) + pad],
        ],
        { padding: 64, maxZoom: 10.5, duration: 900 }
      );
      return;
    }

    const center = DISTRICT_CENTERS[selectedDistrict as keyof typeof DISTRICT_CENTERS];
    if (center) map.flyTo({ center: [center.lng, center.lat], zoom: 9, duration: 900 });
  }, [selectedDistrict]);

  const handleClick = useCallback(
    (event: MapMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;

      if (feature.layer?.id === CLUSTER_LAYER) {
        const clusterId = feature.properties?.cluster_id;
        const source = mapRef.current?.getMap().getSource(QUARRY_SOURCE_ID) as GeoJSONSource | undefined;
        if (source && typeof clusterId === "number") {
          source
            .getClusterExpansionZoom(clusterId)
            .then((zoom) => {
              const [lng, lat] = (feature.geometry as Point).coordinates;
              mapRef.current?.easeTo({ center: [lng, lat], zoom, duration: 400 });
            })
            .catch(() => {
              // Expansion zoom lookup failed — leave the map as-is rather than throwing.
            });
        }
        return;
      }

      if (feature.layer?.id === UNCLUSTERED_LAYER) {
        const id = feature.properties?.id as string | undefined;
        if (id) {
          selectQuarry(id);
          // Nudge the marker left of centre so the detail drawer doesn't cover it.
          const [lng, lat] = (feature.geometry as Point).coordinates;
          const map = mapRef.current;
          map?.easeTo({
            center: [lng, lat],
            zoom: Math.max(map.getZoom(), 10),
            offset: [-170, 0],
            duration: 500,
          });
        }
        return;
      }

      if (feature.layer?.id === "tn-district-fill" && onDistrictSelect) {
        const p = feature.properties || {};
        const districtName = p.dtname || p.Dist_Name || p.NAME_2 || p.district || p.name;
        if (districtName) {
          onDistrictSelect(districtName === selectedDistrict ? null : districtName);
        }
      }
    },
    [selectQuarry, selectedDistrict, onDistrictSelect]
  );

  const handleMouseMove = useCallback((event: MapMouseEvent) => {
    const feature = event.features?.[0];
    if (feature?.layer?.id === UNCLUSTERED_LAYER) {
      const [lng, lat] = (feature.geometry as Point).coordinates;
      setHovered({
        id: feature.properties?.id as string,
        name: feature.properties?.name as string,
        status: feature.properties?.status as QuarryStatus,
        mineralType: feature.properties?.mineralType as string,
        lng,
        lat,
      });
    } else {
      setHovered(null);
    }
    
    if (feature?.layer?.id === "tn-district-fill") {
      const p = feature.properties || {};
      const districtName = p.dtname || p.Dist_Name || p.NAME_2 || p.district || p.name;
      setHoveredDistrict(districtName || null);
    } else {
      setHoveredDistrict(null);
    }
  }, []);

  return (
    <div className="relative h-full w-full">
      {!isStyleLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-canvas-deep">
          <Skeleton className="h-full w-full" />
        </div>
      )}
      <Map
        ref={mapRef}
        initialViewState={{ longitude: TN_CENTER.lng, latitude: TN_CENTER.lat, zoom: 6.0 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={BASEMAP_STYLE_URL}
        interactiveLayerIds={[CLUSTER_LAYER, UNCLUSTERED_LAYER, "tn-district-fill"]}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredDistrict(null)}
        onLoad={(e) => {
          setIsStyleLoaded(true);
          const map = e.target;
          // One frame later, so the fit is computed against the settled container size — fitting
          // during `load` uses a stale (taller) size and leaves the state cropped and over-zoomed.
          requestAnimationFrame(() => {
            map.resize();
            // Fill the frame with Tamil Nadu, then pin that as the furthest-out view: the scale bar
            // reads 100 km there, and zooming out further would only reveal the masked-off
            // neighbouring states. maxBounds is applied *after* the fit and derived from it — set
            // up-front it makes MapLibre zoom IN to keep a wide viewport inside the box, which
            // overrides the state-wide framing.
            frameTamilNadu(map, 0);
            map.setMinZoom(map.getZoom());
            map.setMaxBounds(map.getBounds());
          });
        }}
        cursor={hovered || hoveredDistrict ? "pointer" : "grab"}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <GeolocateControl position="top-right" />
        <ScaleControl position="bottom-right" maxWidth={120} unit="metric" />

        {/* Tamil Nadu only: everything outside the state is covered by the mask */}
        <Source id="tn-mask" type="geojson" data={TN_MASK_GEOJSON_URL}>
          <Layer
            id="tn-mask-fill"
            type="fill"
            paint={{ "fill-color": "#e7eaf6", "fill-opacity": 1 }}
          />
        </Source>
        <Source id="tn-outline" type="geojson" data={TN_OUTLINE_GEOJSON_URL}>
          <Layer
            id="tn-outline-line"
            type="line"
            paint={{ "line-color": "#2a2680", "line-width": 1.6, "line-opacity": 0.85 }}
          />
        </Source>

        {/* Real district boundaries */}
        <Source id={DISTRICTS_SOURCE_ID} type="geojson" data={TN_DISTRICTS_GEOJSON_URL}>
          <Layer
            id="tn-district-fill"
            type="fill"
            paint={{
              "fill-color": [
                "case",
                ["==", DISTRICT_NAME_EXPR, selectedDistrict || "__none__"],
                "rgba(91, 98, 236, 0.16)", // brand-500 selection wash
                ["==", DISTRICT_NAME_EXPR, hoveredDistrict || "__none__"],
                "rgba(91, 98, 236, 0.07)", // brand-400 hover wash
                "rgba(255, 255, 255, 0)" // unselected districts stay clear so the basemap reads through
              ],
              "fill-outline-color": "transparent"
            }}
          />
          <Layer
            id="tn-district-outline"
            type="line"
            paint={{
              "line-color": [
                "case",
                ["==", DISTRICT_NAME_EXPR, selectedDistrict || "__none__"],
                "#4a46dc", // brand-600 outline for the selected district
                "#9aa3bf" // muted boundary over the basemap
              ],
              "line-width": [
                "case",
                ["==", DISTRICT_NAME_EXPR, selectedDistrict || "__none__"],
                2,
                1
              ],
              "line-opacity": 1,
              "line-dasharray": [2, 1.5],
            }}
          />
          <Layer
            id="tn-district-labels"
            type="symbol"
            layout={{
              "text-field": DISTRICT_NAME_EXPR,
              "text-font": ["Noto Sans Bold"],
              "text-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                6, 8,
                8, 11
              ],
              "text-transform": "uppercase",
              "text-letter-spacing": 0.05,
              "text-justify": "center"
            }}
            paint={{
              "text-color": "#8b93ad", // muted slate for district labels
              "text-halo-color": "#ffffff",
              "text-halo-width": 2,
              "text-halo-blur": 1,
              "text-opacity": [
                "case",
                ["==", DISTRICT_NAME_EXPR, selectedDistrict || "__none__"],
                1,
                ["==", DISTRICT_NAME_EXPR, hoveredDistrict || "__none__"],
                1,
                0.8
              ]
            }}
          />
        </Source>

        {/* clusterMaxZoom/Radius kept low so quarries in one district break apart as soon as
            the camera frames that district, rather than staying one lump */}
        <Source id={QUARRY_SOURCE_ID} type="geojson" data={geojson} cluster clusterMaxZoom={9} clusterRadius={38}>
          {/* Soft drop-shadow beneath clusters for depth */}
          <Layer
            id={CLUSTER_SHADOW_LAYER}
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": "#000000",
              "circle-opacity": 0.15,
              "circle-blur": 0.6,
              "circle-radius": ["step", ["get", "point_count"], 19, 10, 23, 30, 29],
              "circle-translate": [0, 1.5],
            }}
          />
          <Layer
            id={CLUSTER_LAYER}
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": ["step", ["get", "point_count"], "#5b62ec", 10, "#4a46dc", 30, "#2a2680"],
              "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 30, 26],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#d4a72c",
            }}
          />
          <Layer
            id={CLUSTER_COUNT_LAYER}
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": ["get", "point_count_abbreviated"],
              "text-size": 12,
              "text-font": ["Noto Sans Bold"],
            }}
            paint={{ "text-color": "#ffffff" }}
          />
          {/* White halo behind each marker for contrast against the basemap */}
          <Layer
            id={UNCLUSTERED_HALO_LAYER}
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{ "circle-color": "#ffffff", "circle-radius": 10, "circle-opacity": 0.9 }}
          />
          <Layer
            id={UNCLUSTERED_LAYER}
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": STATUS_COLOR_MATCH as unknown as string,
              "circle-radius": 7,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            }}
          />
          {/* Names appear once the camera is close enough for them to be readable */}
          <Layer
            id={QUARRY_LABEL_LAYER}
            type="symbol"
            filter={["!", ["has", "point_count"]]}
            minzoom={9}
            layout={{
              "text-field": ["get", "name"],
              "text-font": ["Noto Sans Bold"],
              "text-size": 11,
              "text-offset": [0, 1.4],
              "text-anchor": "top",
              "text-allow-overlap": false,
            }}
            paint={{
              "text-color": "#1b1a4e",
              "text-halo-color": "#ffffff",
              "text-halo-width": 1.6,
            }}
          />
          {/* Gold ring marks the quarry whose detail drawer is open */}
          <Layer
            id={SELECTED_RING_LAYER}
            type="circle"
            filter={["==", ["get", "id"], selectedQuarryId ?? "__none__"]}
            paint={{
              "circle-color": "transparent",
              "circle-radius": 14,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#d4a72c",
            }}
          />
        </Source>

        {hovered && (
          <Popup
            longitude={hovered.lng}
            latitude={hovered.lat}
            closeButton={false}
            closeOnClick={false}
            offset={12}
            anchor="bottom"
            className="quarry-hover-popup"
          >
            <div className="min-w-40 px-3 py-2">
              <p className="text-sm font-semibold text-brand-900">{hovered.name}</p>
              <p className="mb-1.5 text-xs text-neutral-ink/60">{hovered.mineralType}</p>
              <StatusBadge status={hovered.status} />
            </div>
          </Popup>
        )}

        <MapLegend quarries={quarries} />
      </Map>

      {/* Camera state chip — names the framed district and offers a way back to the state view */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2">
        <span className="glass-bar inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-900 shadow-card ring-1 ring-inset ring-neutral-border">
          <MapPin className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
          {selectedDistrict ? `${selectedDistrict} district` : "Tamil Nadu · all districts"}
        </span>
        <span className="glass-bar inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-neutral-ink/60 shadow-card ring-1 ring-inset ring-neutral-border">
          {quarries.length} quarries
        </span>
        {selectedDistrict && onDistrictSelect && (
          <button
            type="button"
            onClick={() => onDistrictSelect(null)}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-brand-900 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-card transition-colors hover:bg-brand-700"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset view
          </button>
        )}
      </div>
    </div>
  );
}

function MapLegend({ quarries }: { quarries: Quarry[] }) {
  const counts = useMemo(() => {
    const tally = {} as Record<QuarryStatus, number>;
    (Object.keys(STATUS_META) as QuarryStatus[]).forEach((status) => (tally[status] = 0));
    quarries.forEach((q) => {
      tally[q.status] = (tally[q.status] ?? 0) + 1;
    });
    return tally;
  }, [quarries]);

  return (
    <div className="glass-bar absolute bottom-3 left-3 z-10 rounded-xl p-3 text-xs shadow-card ring-1 ring-inset ring-neutral-border">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-ink/50">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        Quarry status
      </p>
      <div className="space-y-1.5">
        {(Object.keys(STATUS_META) as QuarryStatus[]).map((status) => (
          <div key={status} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 font-medium text-neutral-ink/75">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-inset ring-white/70"
                style={{ backgroundColor: STATUS_META[status].color }}
              />
              {STATUS_META[status].label}
            </span>
            <span className="font-bold tabular-nums text-brand-900">{counts[status]}</span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 border-t border-neutral-line pt-2 text-[11px] text-neutral-ink/50">
        <Layers className="h-3 w-3" aria-hidden="true" />
        Click a district to filter
      </div>
    </div>
  );
}
