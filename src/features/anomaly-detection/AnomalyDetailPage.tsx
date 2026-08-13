import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, AlertTriangle, FileText, ChevronRight, Activity, MapPin, User, FileDigit,
  Layers, Crosshair, Copy, Check, SearchX, Locate, Send, ShieldAlert, ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import { getMockData } from "../../data/mock/generateMockData";
import type { Quarry } from "../../types/quarry";
import { calculateSeverity, calculateRevenueLoss, m3ToTonnes } from "../../utils/anomalyUtils";
import { generateAnomalyExplanation, draftShowCauseNotice } from "../../services/claude";
import { formatINR, formatINRCompact, formatQuantityCompact } from "../../utils/formatters";
import Map, { Source, Layer, NavigationControl, FullscreenControl, ScaleControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

/** Actions an officer can record against the case, in escalation order. */
const ENFORCEMENT_ACTIONS: { label: string; icon: LucideIcon; tone: string }[] = [
  { label: "Ground inspector dispatched", icon: Send, tone: "text-brand-500" },
  { label: "Weighbridge audit requested", icon: ClipboardCheck, tone: "text-amber-600" },
  { label: "Escalated to District Collector", icon: ShieldAlert, tone: "text-status-violation" },
];

const QUARRY_SITES_GEOJSON_URL = "/geo/quarry-sites.geojson?v=1";

const SATELLITE_STYLE: any = {
  version: 8,
  // Raster-only styles ship no glyphs; the pit label below is a symbol layer, so point at
  // OpenFreeMap's font endpoint (same one QuarryMap uses) or the label silently fails to render.
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
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
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: 'roads-layer',
      type: 'raster',
      source: 'esri-roads',
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: 'labels-layer',
      type: 'raster',
      source: 'esri-labels',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

export function AnomalyDetailPage() {
  const { id } = useParams();
  const mapRef = useRef<MapRef>(null);
  const [quarry, setQuarry] = useState<Quarry | null>(null);
  const [isResolved, setResolved] = useState(false);
  const [hasCopiedCoords, setCopiedCoords] = useState(false);

  useEffect(() => {
    // Reset first: navigating straight from /anomaly-detection/Q-047 to another id reuses this
    // component, so without clearing we would render the previous quarry's figures for a frame.
    setQuarry(null);
    setResolved(false);
    const data = getMockData();
    setQuarry(data.quarries.find((q) => q.id === id) ?? null);
    setResolved(true);
  }, [id]);

  // The real, mapped pit outline for this quarry (OpenStreetMap landuse=quarry, ODbL). Fetched
  // rather than bundled — the file is served from public/ like the district boundaries.
  const [siteFeature, setSiteFeature] = useState<any | null>(null);
  useEffect(() => {
    if (!quarry?.siteId) return;
    let cancelled = false;
    fetch(QUARRY_SITES_GEOJSON_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setSiteFeature(
          data.features.find((f: any) => f.properties?.siteId === quarry.siteId) ?? null
        );
      })
      .catch(() => setSiteFeature(null));
    return () => {
      cancelled = true;
    };
  }, [quarry?.siteId]);

  const anomalyData = useMemo(() => {
    if (!quarry) return null;
    const gapM3 = Math.max(0, quarry.aiEstimatedExtractionVolumeM3Monthly - quarry.declaredExtractionVolumeM3Monthly);
    const gapTonnes = m3ToTonnes(gapM3, quarry.mineralType);
    const severity = calculateSeverity(quarry.declaredExtractionVolumeM3Monthly, quarry.aiEstimatedExtractionVolumeM3Monthly);
    const revenueLoss = calculateRevenueLoss(gapM3, quarry.mineralType);
    const explanation = generateAnomalyExplanation(quarry, gapTonnes);
    const draftNotice = draftShowCauseNotice(quarry, gapTonnes, revenueLoss);

    return { gapM3, gapTonnes, severity, revenueLoss, explanation, draftNotice };
  }, [quarry]);

  const mapPolygons = useMemo(() => {
    if (!quarry || !anomalyData) return null;

    const gapRatio = quarry.declaredExtractionVolumeM3Monthly
      ? anomalyData.gapM3 / quarry.declaredExtractionVolumeM3Monthly
      : 1;
    // The AI-observed extent is the licensed footprint grown by the same proportion as the
    // volumetric over-extraction (capped so an extreme ratio stays readable on screen).
    const growth = 1 + Math.min(0.45, Math.max(0.06, gapRatio * 0.5));

    if (siteFeature?.geometry?.type === "Polygon") {
      const ring: [number, number][] = siteFeature.geometry.coordinates[0];
      const n = ring.length;
      // Centroid of the real ring, used as the origin to scale it outward from.
      const cx = ring.reduce((sum, c) => sum + c[0], 0) / n;
      const cy = ring.reduce((sum, c) => sum + c[1], 0) / n;
      const grown = ring.map(([lng, lat]) => [
        cx + (lng - cx) * growth,
        cy + (lat - cy) * growth,
      ]);

      return {
        lease: {
          type: "Feature" as const,
          properties: {},
          geometry: { type: "Polygon" as const, coordinates: [ring] },
        },
        ai: {
          type: "Feature" as const,
          properties: {},
          geometry: { type: "Polygon" as const, coordinates: [grown] },
        },
        isRealFootprint: true,
      };
    }

    // Fallback only if the footprint file can't be reached: a deterministic placeholder ring.
    const RADIUS_DEG = 0.0016;
    const POINTS = 20;
    const ring: [number, number][] = [];
    for (let i = 0; i < POINTS; i++) {
      const angle = (i / POINTS) * Math.PI * 2;
      ring.push([
        quarry.lng + (RADIUS_DEG * Math.cos(angle)) / Math.cos((quarry.lat * Math.PI) / 180),
        quarry.lat + RADIUS_DEG * Math.sin(angle),
      ]);
    }
    ring.push(ring[0]);
    const grown = ring.map(([lng, lat]) => [
      quarry.lng + (lng - quarry.lng) * growth,
      quarry.lat + (lat - quarry.lat) * growth,
    ]);

    return {
      lease: { type: "Feature" as const, properties: {}, geometry: { type: "Polygon" as const, coordinates: [ring] } },
      ai: { type: "Feature" as const, properties: {}, geometry: { type: "Polygon" as const, coordinates: [grown] } },
      isRealFootprint: false,
    };
  }, [quarry, anomalyData, siteFeature]);

  /** Frames the pit; also re-run when the route id changes so the map never shows a stale location. */
  const focusQuarry = useCallback(
    (duration: number) => {
      if (!quarry) return;
      const map = mapRef.current;
      if (!map) return;

      // Frame the mapped pit itself where we have its outline, so the whole working is visible
      // regardless of how big the site is.
      const ring: [number, number][] | undefined = siteFeature?.geometry?.coordinates?.[0];
      if (ring?.length) {
        const lngs = ring.map((c) => c[0]);
        const lats = ring.map((c) => c[1]);
        map.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: 80, maxZoom: 17, duration }
        );
        return;
      }
      map.flyTo({ center: [quarry.lng, quarry.lat], zoom: 15.5, duration, essential: true });
    },
    [quarry, siteFeature]
  );

  useEffect(() => {
    focusQuarry(900);
  }, [focusQuarry]);

  /**
   * Actions recorded in this session. A real deployment would POST these to the case file; the
   * prototype keeps them in component state so the flow can be demonstrated end to end.
   */
  const [actionLog, setActionLog] = useState<{ label: string; at: string }[]>([]);
  const [isNoticeOpen, setNoticeOpen] = useState(false);
  const [hasCopiedNotice, setCopiedNotice] = useState(false);

  // Clear the log when the route moves to a different quarry.
  useEffect(() => {
    setActionLog([]);
    setNoticeOpen(false);
  }, [id]);

  const isActionDone = useCallback(
    (label: string) => actionLog.some((entry) => entry.label === label),
    [actionLog]
  );

  const recordAction = useCallback((label: string) => {
    setActionLog((log) =>
      log.some((entry) => entry.label === label)
        ? log
        : [
          {
            label,
            at: new Date().toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...log,
        ]
    );
  }, []);

  const copyNotice = useCallback(() => {
    if (!anomalyData) return;
    navigator.clipboard
      ?.writeText(anomalyData.draftNotice)
      .then(() => {
        setCopiedNotice(true);
        setTimeout(() => setCopiedNotice(false), 1800);
      })
      .catch(() => setCopiedNotice(false));
  }, [anomalyData]);

  const copyCoords = useCallback(() => {
    if (!quarry) return;
    navigator.clipboard
      ?.writeText(`${quarry.lat.toFixed(6)}, ${quarry.lng.toFixed(6)}`)
      .then(() => {
        setCopiedCoords(true);
        setTimeout(() => setCopiedCoords(false), 1800);
      })
      .catch(() => setCopiedCoords(false));
  }, [quarry]);

  if (isResolved && !quarry) {
    // Unknown id (bad link, deleted record) — say so instead of spinning forever.
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="surface-card max-w-md p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-subtle text-neutral-ink/40">
            <SearchX className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-extrabold text-brand-900">
            Anomaly record not found
          </h1>
          <p className="mt-2 text-sm text-neutral-ink/60">
            No quarry matches <span className="font-mono text-brand-900">{id}</span>. It may have been
            re-indexed since this link was shared.
          </p>
          <Link
            to="/anomaly-detection"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to anomaly detection
          </Link>
        </div>
      </div>
    );
  }

  if (!quarry || !anomalyData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-900" />
      </div>
    );
  }


  const gapPercentage = quarry.declaredExtractionVolumeM3Monthly
    ? ((anomalyData.gapM3 / quarry.declaredExtractionVolumeM3Monthly) * 100).toFixed(1)
    : "—";
  // Width of the declared portion of the volume bar; the remainder is the AI-observed excess.
  const declaredShare = quarry.aiEstimatedExtractionVolumeM3Monthly
    ? (quarry.declaredExtractionVolumeM3Monthly / quarry.aiEstimatedExtractionVolumeM3Monthly) * 100
    : 100;

  const severityStyle =
    anomalyData.severity === "High"
      ? "bg-status-violation/10 text-red-700 ring-status-violation/25"
      : anomalyData.severity === "Medium"
        ? "bg-status-warning/10 text-amber-700 ring-status-warning/30"
        : "bg-neutral-subtle text-neutral-ink/60 ring-neutral-border";

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">
      {/* Case header */}
      <header className="surface-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <Link
              to="/anomaly-detection"
              aria-label="Back to anomaly detection"
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-surface text-neutral-ink/60 ring-1 ring-inset ring-neutral-border transition-colors hover:text-brand-900 hover:ring-brand-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-xl font-extrabold text-brand-900 md:text-2xl">
                  {quarry.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset ${severityStyle}`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {anomalyData.severity} severity
                </span>
              </div>
              <dl className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-neutral-ink/60">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-500" />
                  {quarry.district}
                </div>
                <div className="flex items-center gap-1.5">
                  <FileDigit className="h-3.5 w-3.5 text-neutral-ink/35" />
                  <span className="font-semibold text-brand-900">{quarry.licenseId}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-neutral-ink/35" />
                  <span className="font-semibold text-brand-900">{quarry.operatorId}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-neutral-ink/35" />
                  <span className="font-semibold text-brand-900">{quarry.mineralType}</span>
                </div>
              </dl>
            </div>
          </div>

          <button
            onClick={() => recordAction("Show-cause notice issued")}
            disabled={isActionDone("Show-cause notice issued")}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-b from-brand-700 to-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-card ring-1 ring-inset ring-white/15 transition-all hover:from-brand-600 hover:to-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isActionDone("Show-cause notice issued") ? (
              <>
                <Check className="h-4 w-4" /> Notice issued
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" /> Issue notice
              </>
            )}
          </button>
        </div>
      </header>

      {/* Evidence: the four numbers the case turns on */}
      <section className="surface-card p-5">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <Metric
            label="Declared volume"
            value={`${quarry.declaredExtractionVolumeM3Monthly.toLocaleString("en-IN")} m³`}
            hint="Operator monthly return"
          />
          <Metric
            label="AI estimated"
            value={`${quarry.aiEstimatedExtractionVolumeM3Monthly.toLocaleString("en-IN")} m³`}
            hint="From satellite volumetrics"
            tone="text-amber-600"
          />
          <Metric
            label="Excess extraction"
            value={`+${formatQuantityCompact(anomalyData.gapTonnes, "t")}`}
            valueTitle={`${Math.round(anomalyData.gapTonnes).toLocaleString("en-IN")} tonnes`}
            hint={`${gapPercentage}% above declared`}
            tone="text-status-violation"
          />
          <Metric
            label="Revenue at risk"
            value={formatINRCompact(anomalyData.revenueLoss)}
            valueTitle={formatINR(anomalyData.revenueLoss)}
            hint="Unpaid seigniorage this month"
            tone="text-status-violation"
          />
        </div>

        {/* Proportional bar: declared vs the AI-observed excess */}
        <div className="mt-5">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-subtle">
            <div className="bg-brand-500" style={{ width: `${declaredShare}%` }} />
            <div className="bg-status-violation" style={{ width: `${100 - declaredShare}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-ink/45">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> Declared
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-status-violation" /> Undeclared excess
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Primary evidence: the pit itself */}
        <div className="space-y-5 xl:col-span-2">
          <div className="surface-card flex h-[520px] flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-line bg-neutral-subtle/60 px-5 py-4">
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 font-heading text-[15px] font-bold text-brand-900">
                  <Crosshair className="h-4 w-4 text-brand-500" />
                  Site evidence
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <button
                    onClick={copyCoords}
                    title="Copy coordinates"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-border bg-neutral-surface px-2 py-1 font-mono text-xs text-neutral-ink/70 transition-colors hover:border-brand-200 hover:text-brand-900"
                  >
                    {quarry.lat.toFixed(6)}, {quarry.lng.toFixed(6)}
                    {hasCopiedCoords ? (
                      <Check className="h-3.5 w-3.5 text-status-compliant" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-neutral-ink/40" />
                    )}
                  </button>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-border bg-neutral-surface px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-neutral-ink/60">
                    <Layers className="h-3.5 w-3.5" />
                    {(quarry.siteAreaSqM / 10000).toFixed(1)} ha pit
                  </span>
                  <button
                    onClick={() => focusQuarry(700)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-border bg-neutral-surface px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-neutral-ink/60 transition-colors hover:border-brand-200 hover:text-brand-900"
                  >
                    <Locate className="h-3.5 w-3.5" />
                    Recentre
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-ink/70">
                  <span className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-emerald-500/10" />
                  Mapped pit outline
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-ink/70">
                  <span className="h-3 w-3 rounded-full border-2 border-dashed border-red-500 bg-red-500/20" />
                  AI extent (+{gapPercentage}%)
                </span>
              </div>
            </div>

            <div className="relative w-full flex-1 bg-canvas-deep">
              <Map
                ref={mapRef}
                initialViewState={{ longitude: quarry.lng, latitude: quarry.lat, zoom: 15.5 }}
                mapStyle={SATELLITE_STYLE}
                interactive
                attributionControl={{ compact: true }}
              >
                <NavigationControl position="top-right" />
                <FullscreenControl position="top-right" />
                <ScaleControl position="top-left" maxWidth={110} unit="metric" />

                {mapPolygons && (
                  <>
                    <Source id="approved-lease" type="geojson" data={mapPolygons.lease as any}>
                      <Layer
                        id="approved-fill"
                        type="fill"
                        paint={{ "fill-color": "rgba(16, 185, 129, 0.15)" }}
                      />
                      <Layer
                        id="approved-line"
                        type="line"
                        paint={{ "line-color": "#10b981", "line-width": 2 }}
                      />
                    </Source>

                    <Source id="ai-extent" type="geojson" data={mapPolygons.ai as any}>
                      <Layer
                        id="ai-fill"
                        type="fill"
                        paint={{ "fill-color": "rgba(239, 68, 68, 0.18)" }}
                      />
                      <Layer
                        id="ai-line"
                        type="line"
                        paint={{
                          "line-color": "#ef4444",
                          "line-width": 2,
                          "line-dasharray": [2, 2],
                        }}
                      />
                    </Source>

                    <Source
                      id="quarry-center-source"
                      type="geojson"
                      data={{
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [quarry.lng, quarry.lat] },
                        properties: {},
                      }}
                    >
                      <Layer
                        id="quarry-center"
                        type="circle"
                        paint={{
                          "circle-radius": 5,
                          "circle-color": "#ffffff",
                          "circle-stroke-width": 2,
                          "circle-stroke-color": "#1b1a4e",
                        }}
                      />
                    </Source>
                  </>
                )}
              </Map>
            </div>
          </div>

          {/* Draft notice — long, so it stays folded until wanted */}
          <div className="surface-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-line bg-neutral-subtle/60 px-5 py-4">
              <h3 className="flex items-center gap-2 font-heading text-[15px] font-bold text-brand-900">
                <FileText className="h-4 w-4 text-brand-500" />
                System-generated show-cause notice
                <span className="rounded-md bg-neutral-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-ink/50 ring-1 ring-inset ring-neutral-border">
                  Draft
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyNotice}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-border bg-neutral-surface px-3 py-1.5 text-xs font-bold text-neutral-ink/70 transition-colors hover:border-brand-200 hover:text-brand-900"
                >
                  {hasCopiedNotice ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-status-compliant" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => setNoticeOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-border bg-neutral-surface px-3 py-1.5 text-xs font-bold text-neutral-ink/70 transition-colors hover:border-brand-200 hover:text-brand-900"
                >
                  {isNoticeOpen ? "Hide" : "Review"}
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${isNoticeOpen ? "rotate-90" : ""}`}
                  />
                </button>
              </div>
            </div>
            {isNoticeOpen && (
              <div className="animate-fade-in bg-neutral-subtle/40 p-5">
                <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl border border-neutral-border bg-neutral-surface p-5 font-mono text-[13px] leading-relaxed text-neutral-ink/80">
                  {anomalyData.draftNotice}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right rail: interpretation + what to do about it */}
        <div className="space-y-5">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-neutral-line bg-brand-50/60 px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 to-brand-800 text-white">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-[15px] font-bold text-brand-900">
                  AI diagnostic insight
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
                  Confidence 94%
                </p>
              </div>
            </div>
            <div className="space-y-3 p-5 text-sm leading-relaxed text-neutral-ink/75">
              <p>{anomalyData.explanation.english}</p>
              <div className="h-px bg-neutral-line" />
              <p>{anomalyData.explanation.tamil}</p>
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="border-b border-neutral-line px-5 py-4">
              <h3 className="font-heading text-[15px] font-bold text-brand-900">
                Enforcement actions
              </h3>
              <p className="mt-0.5 text-xs text-neutral-ink/50">Recorded against case {quarry.id}</p>
            </div>

            <div className="space-y-2 p-4">
              {ENFORCEMENT_ACTIONS.map((action) => {
                const done = isActionDone(action.label);
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => recordAction(action.label)}
                    disabled={done}
                    className={`group flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${done
                      ? "border-status-compliant/30 bg-status-compliant/5"
                      : "border-neutral-border bg-neutral-surface hover:border-brand-200 hover:bg-brand-50/40"
                      }`}
                  >
                    <span className="flex items-center gap-2.5 text-sm font-semibold text-brand-900">
                      <Icon className={`h-4 w-4 ${done ? "text-status-compliant" : action.tone}`} />
                      {action.label}
                    </span>
                    {done ? (
                      <Check className="h-4 w-4 shrink-0 text-status-compliant" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-ink/30 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-neutral-line bg-neutral-subtle/50 px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-ink/45">
                Case activity
              </p>
              {actionLog.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-ink/50">
                  No action recorded yet. Actions taken here are logged against the case file.
                </p>
              ) : (
                <ol className="mt-3 space-y-3">
                  {actionLog.map((entry) => (
                    <li key={entry.label} className="flex gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-status-compliant ring-4 ring-status-compliant/15" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brand-900">{entry.label}</p>
                        <p className="text-[11px] text-neutral-ink/45">
                          {entry.at} · District Officer, Enforcement Cell
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone = "text-brand-900",
  valueTitle,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: string;
  /** Exact figure on hover, for values shortened to lakh/crore. */
  valueTitle?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-neutral-ink/45">
        {label}
      </p>
      <p
        title={valueTitle}
        className={`mt-2 font-heading text-[1.45rem] font-extrabold leading-none tabular-nums ${tone}`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-xs text-neutral-ink/50">{hint}</p>
    </div>
  );
}
