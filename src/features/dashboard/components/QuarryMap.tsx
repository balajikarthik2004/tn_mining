import { useCallback, useMemo, useRef, useState } from "react";
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
import { MapPin, Layers } from "lucide-react";
import type { Quarry } from "../../../types/quarry";
import { STATUS_META, type QuarryStatus } from "../../../types/common";
import { TN_CENTER, TN_BOUNDS } from "../../../data/mock/districts";
import { useDashboardStore } from "../../../store/dashboardStore";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Skeleton } from "../../../components/ui/Skeleton";

/**
 * OpenFreeMap (https://openfreemap.org) — a fully free, no-signup, no-token, no-billing
 * vector tile + style host built on OpenStreetMap data. Chosen over Mapbox specifically
 * because Mapbox now requires a billing-enabled account even for its free tier.
 */
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

const TN_DISTRICTS_GEOJSON_URL = "/geo/tn-districts.geojson?v=3";

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
  const [hovered, setHovered] = useState<HoveredQuarry | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

  const geojson = useMemo(() => quarriesToGeoJSON(quarries), [quarries]);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

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
        if (id) selectQuarry(id);
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
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gold-50">
          <Skeleton className="h-full w-full" />
        </div>
      )}
      <Map
        ref={mapRef}
        initialViewState={{ longitude: TN_CENTER.lng, latitude: TN_CENTER.lat, zoom: 6.4 }}
        maxBounds={[
          [TN_BOUNDS.minLng - 1, TN_BOUNDS.minLat - 1], // South West
          [TN_BOUNDS.maxLng + 1, TN_BOUNDS.maxLat + 1], // North East
        ] as any}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE_URL}
        interactiveLayerIds={[CLUSTER_LAYER, UNCLUSTERED_LAYER, "tn-district-fill"]}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredDistrict(null)}
        onLoad={() => setIsStyleLoaded(true)}
        cursor={hovered || hoveredDistrict ? "pointer" : "grab"}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <GeolocateControl position="top-right" />
        <ScaleControl position="bottom-right" maxWidth={120} unit="metric" />

        {/* Real district boundaries */}
        <Source id={DISTRICTS_SOURCE_ID} type="geojson" data={TN_DISTRICTS_GEOJSON_URL}>
          <Layer
            id="tn-district-fill"
            type="fill"
            paint={{
              "fill-color": [
                "case",
                ["==", ["get", "dtname"], selectedDistrict || ""],
                "rgba(239, 68, 68, 0.15)", // red-500 with opacity
                ["==", ["get", "dtname"], hoveredDistrict || ""],
                "rgba(248, 113, 113, 0.1)", // red-400 with opacity
                "transparent"
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
                ["==", ["get", "dtname"], selectedDistrict || ""],
                "#ef4444", // Solid red-500 for selected
                "#7A0C2E" // Default
              ],
              "line-width": [
                "case",
                ["==", ["get", "dtname"], selectedDistrict || ""],
                2,
                1
              ],
              "line-opacity": [
                "case",
                ["==", ["get", "dtname"], selectedDistrict || ""],
                1,
                0.45
              ],
              "line-dasharray": [2, 1.5],
            }}
          />
        </Source>

        <Source id={QUARRY_SOURCE_ID} type="geojson" data={geojson} cluster clusterMaxZoom={11} clusterRadius={50}>
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
              "circle-color": ["step", ["get", "point_count"], "#7A0C2E", 10, "#5C0A1E", 30, "#400715"],
              "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 30, 26],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#D4A017",
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

        <MapLegend />
      </Map>
    </div>
  );
}

function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 z-10 rounded-md border border-neutral-border bg-white/95 p-3 text-xs shadow-md backdrop-blur">
      <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-brand-900">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        Quarry Status
      </p>
      <div className="space-y-1">
        {(Object.keys(STATUS_META) as QuarryStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full border border-white"
              style={{ backgroundColor: STATUS_META[status].color }}
            />
            {STATUS_META[status].label}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 border-t border-neutral-border pt-1.5 text-neutral-ink/60">
        <Layers className="h-3 w-3" aria-hidden="true" />
        District boundaries
      </div>
    </div>
  );
}
