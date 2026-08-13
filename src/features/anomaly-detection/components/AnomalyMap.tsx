import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
} from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import { Search, MapPin, AlertTriangle, RotateCcw, ArrowUpRight, Crosshair } from "lucide-react";
import type { Quarry } from "../../../types/quarry";
import { TN_BOUNDS } from "../../../data/mock/districts";
import { formatINR } from "../../../utils/formatters";
import { calculateRevenueLoss } from "../../../utils/anomalyUtils";

/**
 * Esri World Imagery — the same satellite source the licence dossier and trip-sheet maps use, with
 * the attribution its terms require. (An earlier build pulled tiles straight from Google's internal
 * `mt1.google.com` endpoint, which isn't licensed for use outside Google Maps.)
 */
const SATELLITE_STYLE: any = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "&copy; Esri &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP",
    },
    "esri-reference": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
  },
  layers: [
    { id: "satellite-layer", type: "raster", source: "esri-satellite", minzoom: 0, maxzoom: 22 },
    { id: "reference-layer", type: "raster", source: "esri-reference", minzoom: 0, maxzoom: 22 },
  ],
};

const TN_DISTRICTS_GEOJSON_URL = "/geo/tn-districts.geojson?v=4";
const TN_MASK_GEOJSON_URL = "/geo/tn-mask.geojson?v=2";
const TN_OUTLINE_GEOJSON_URL = "/geo/tn-outline.geojson?v=2";

/** Width of the floating radar panel — the camera keeps quarries clear of it. */
const PANEL_WIDTH = 340;
const PANEL_GUTTER = 32;

interface Props {
  quarries: Quarry[];
}

export function AnomalyMap({ quarries }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuarryId, setSelectedQuarryId] = useState<string | null>(null);
  const [hoveredQuarry, setHoveredQuarry] = useState<Quarry | null>(null);

  const anomalies = useMemo(
    () =>
      quarries.filter(
        (q) => q.aiEstimatedExtractionVolumeM3Monthly > q.declaredExtractionVolumeM3Monthly
      ),
    [quarries]
  );

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

  const geojson = useMemo<FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: filteredQuarries.map((q) => {
        const gapM3 = q.aiEstimatedExtractionVolumeM3Monthly - q.declaredExtractionVolumeM3Monthly;
        return {
          type: "Feature",
          id: q.id,
          geometry: { type: "Point", coordinates: [q.lng, q.lat] },
          properties: {
            id: q.id,
            name: q.name,
            district: q.district,
            revenueLoss: calculateRevenueLoss(gapM3, q.mineralType),
            gapM3,
          },
        };
      }),
    }),
    [filteredQuarries]
  );

  /** Keeps the target clear of the floating panel, which otherwise covers a centred quarry. */
  const cameraPadding = useCallback(() => {
    const isDesktop = typeof window === "undefined" || window.innerWidth >= 768;
    return isDesktop ? { left: PANEL_WIDTH + PANEL_GUTTER, top: 0, right: 0, bottom: 0 } : { left: 0, top: 0, right: 0, bottom: 0 };
  }, []);

  const frameState = useCallback(() => {
    mapRef.current?.fitBounds(
      [
        [TN_BOUNDS.minLng, TN_BOUNDS.minLat],
        [TN_BOUNDS.maxLng, TN_BOUNDS.maxLat],
      ],
      { padding: { ...cameraPadding(), bottom: 24, top: 24, right: 24 }, duration: 900 }
    );
  }, [cameraPadding]);

  // Fly to whichever anomaly is selected. Deliberately keyed on the id alone: re-running this while
  // the user types in the search box (or on the 5-minute data refresh) would yank the camera back.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!selectedQuarryId) return;
    const quarry = quarries.find((q) => q.id === selectedQuarryId);
    if (!quarry) return;
    map.flyTo({
      center: [quarry.lng, quarry.lat],
      zoom: 13.5,
      padding: cameraPadding(),
      duration: 1400,
      essential: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuarryId]);

  // Hover only. Selecting a quarry moves the camera and marks its dot (red fill + lock ring); the
  // detail card appears when you point at that dot, so it never sits over the map uninvited.
  const popupQuarry = hoveredQuarry;

  return (
    <div className="relative mb-8 flex h-[650px] flex-col overflow-hidden rounded-2xl shadow-card ring-1 ring-inset ring-neutral-border md:flex-row">
      {/* Map area (full background) */}
      <div className="absolute inset-0 z-0 bg-brand-950">
        <Map
          ref={mapRef}
          initialViewState={{
            bounds: [
              [TN_BOUNDS.minLng, TN_BOUNDS.minLat],
              [TN_BOUNDS.maxLng, TN_BOUNDS.maxLat],
            ],
            fitBoundsOptions: { padding: { left: PANEL_WIDTH + PANEL_GUTTER, top: 24, right: 24, bottom: 24 } },
          } as any}
          mapStyle={SATELLITE_STYLE}
          interactiveLayerIds={["unclustered-point"]}
          onMouseMove={(e) => {
            const feature = e.features?.[0];
            const quarry = feature ? quarries.find((q) => q.id === feature.properties?.id) : null;
            setHoveredQuarry(quarry ?? null);
          }}
          // Without this the card stays on screen when the pointer exits over the radar panel,
          // because onMouseMove stops firing once the cursor is off the canvas.
          onMouseLeave={() => setHoveredQuarry(null)}
          onClick={(e) => {
            const feature = e.features?.[0];
            setSelectedQuarryId(feature ? (feature.properties?.id as string) : null);
          }}
          cursor={hoveredQuarry ? "pointer" : "grab"}
        >
          {/* Everything outside Tamil Nadu is dimmed away */}
          <Source id="tn-mask" type="geojson" data={TN_MASK_GEOJSON_URL}>
            <Layer
              id="mask-fill"
              type="fill"
              paint={{ "fill-color": "#020617", "fill-opacity": 0.93 }}
            />
          </Source>
          <Source id="tn-outline" type="geojson" data={TN_OUTLINE_GEOJSON_URL}>
            <Layer
              id="tn-outline-line"
              type="line"
              paint={{ "line-color": "#7f8bf6", "line-width": 1.6, "line-opacity": 0.9 }}
            />
          </Source>

          <Source id="tn-districts" type="geojson" data={TN_DISTRICTS_GEOJSON_URL}>
            <Layer
              id="districts-line"
              type="line"
              paint={{ "line-color": "#93c5fd", "line-width": 1, "line-opacity": 0.28 }}
            />
          </Source>

          <Source id="quarries" type="geojson" data={geojson}>
            {/* Glowing outer ring */}
            <Layer
              id="unclustered-point-glow"
              type="circle"
              paint={{
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 10, 10, 20, 15, 30],
                "circle-color": [
                  "case",
                  ["==", ["get", "id"], selectedQuarryId || "__none__"],
                  "#ef4444",
                  "#f97316",
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
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 5, 10, 8, 15, 10],
                "circle-color": [
                  "case",
                  ["==", ["get", "id"], selectedQuarryId || "__none__"],
                  "#ef4444",
                  "#f97316",
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
              }}
            />
            {/* Locked-on ring for the selected anomaly */}
            <Layer
              id="selected-lock-ring"
              type="circle"
              filter={["==", ["get", "id"], selectedQuarryId || "__none__"]}
              paint={{
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 12, 15, 22],
                "circle-color": "transparent",
                "circle-stroke-width": 2,
                "circle-stroke-color": "#fecaca",
              }}
            />
          </Source>

          {popupQuarry && (
            <Popup
              longitude={popupQuarry.lng}
              latitude={popupQuarry.lat}
              closeButton={false}
              closeOnClick={false}
              anchor="bottom"
              offset={16}
              className="z-50"
            >
              <div className="min-w-[230px] rounded-xl border border-neutral-line bg-white p-3">
                <div className="mb-1 font-heading font-bold text-brand-900">{popupQuarry.name}</div>
                <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-neutral-ink/50">
                  {popupQuarry.district} • {popupQuarry.mineralType}
                </div>
                <div className="flex flex-col gap-2 rounded-lg border border-neutral-line bg-neutral-subtle p-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-ink/55">Declared</span>
                    <span className="font-semibold text-neutral-ink">
                      {popupQuarry.declaredExtractionVolumeM3Monthly.toLocaleString()} m³
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-ink/55">AI estimated</span>
                    <span className="font-bold text-amber-600">
                      {popupQuarry.aiEstimatedExtractionVolumeM3Monthly.toLocaleString()} m³
                    </span>
                  </div>
                  <div className="my-0.5 h-px w-full bg-neutral-border" />
                  <div className="flex items-center justify-between text-xs font-bold text-red-600">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Gap
                    </span>
                    <span>
                      {(
                        popupQuarry.aiEstimatedExtractionVolumeM3Monthly -
                        popupQuarry.declaredExtractionVolumeM3Monthly
                      ).toLocaleString()}{" "}
                      m³
                    </span>
                  </div>
                </div>
                <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-ink/40">
                  <Crosshair className="h-3 w-3" />
                  {popupQuarry.lat.toFixed(4)}° N, {popupQuarry.lng.toFixed(4)}° E
                </p>
              </div>
            </Popup>
          )}

          <NavigationControl position="top-right" showCompass={false} />
          <FullscreenControl position="top-right" />
          <ScaleControl position="bottom-right" maxWidth={110} unit="metric" />
        </Map>
      </div>

      {/* Floating glass panel */}
      <div className="absolute bottom-4 left-4 top-4 z-10 flex w-[calc(100%-2rem)] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-panel backdrop-blur-xl md:w-[340px]">
        <div className="border-b border-neutral-line/70 bg-white/50 p-5">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900">
                <MapPin className="h-5 w-5 text-brand-500" />
                Anomaly Radar
              </h3>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-ink/45">
                {filteredQuarries.length} of {anomalies.length} flagged
              </p>
            </div>
            {selectedQuarryId && (
              <button
                onClick={() => {
                  setSelectedQuarryId(null);
                  frameState();
                }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-900 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-700"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
          <div className="group relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-ink/35 transition-colors group-focus-within:text-brand-500" />
            <input
              type="text"
              placeholder="Search quarries, districts..."
              className="w-full rounded-xl border border-neutral-border bg-white/70 py-2.5 pl-9 pr-4 text-sm font-medium shadow-sm outline-none transition-all placeholder:font-normal focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {filteredQuarries.length === 0 ? (
            <div className="rounded-xl border border-neutral-line bg-white/50 p-6 text-center text-sm text-neutral-ink/55">
              No anomalies match your search.
            </div>
          ) : (
            filteredQuarries.map((q) => {
              const gapM3 =
                q.aiEstimatedExtractionVolumeM3Monthly - q.declaredExtractionVolumeM3Monthly;
              const revenueLoss = calculateRevenueLoss(gapM3, q.mineralType);
              const isSelected = selectedQuarryId === q.id;

              return (
                <div
                  key={q.id}
                  className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${isSelected
                    ? "border-brand-200 bg-white shadow-card ring-1 ring-brand-500/20"
                    : "border-transparent bg-white/45 hover:bg-white/80 hover:shadow-sm"
                    }`}
                >
                  {isSelected && <div className="absolute bottom-0 left-0 top-0 w-1 bg-brand-500" />}

                  <button
                    onClick={() => setSelectedQuarryId(q.id)}
                    aria-pressed={isSelected}
                    className="flex w-full items-start gap-3 p-3.5 text-left"
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${isSelected ? "bg-brand-100 text-brand-600" : "bg-neutral-subtle text-neutral-ink/35"
                        }`}
                    >
                      <MapPin className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate text-sm font-bold ${isSelected ? "text-brand-900" : "text-neutral-ink/80"}`}
                      >
                        {q.name}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-widest text-neutral-ink/45">
                        {q.district} • {q.mineralType}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          {gapM3.toLocaleString()} m³
                        </div>
                        <div className="rounded-full bg-neutral-subtle px-2 py-0.5 text-xs font-bold text-brand-900">
                          {formatINR(revenueLoss)}
                        </div>
                      </div>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="flex items-center justify-between gap-2 border-t border-neutral-line bg-neutral-subtle/70 px-3.5 py-2">
                      <span className="font-mono text-[10px] text-neutral-ink/50">
                        {q.lat.toFixed(4)}°N {q.lng.toFixed(4)}°E
                      </span>
                      <Link
                        to={`/anomaly-detection/${q.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-brand-700 transition-colors hover:text-brand-500"
                      >
                        Full analysis
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
