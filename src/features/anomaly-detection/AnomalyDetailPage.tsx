import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, AlertTriangle, Send, FileText, ChevronRight, Activity,
  MapPin, ShieldAlert, User, FileDigit, Layers, Crosshair
} from "lucide-react";
import { getMockData } from "../../data/mock/generateMockData";
import type { Quarry } from "../../types/quarry";
import { calculateSeverity, calculateRevenueLoss, m3ToTonnes } from "../../utils/anomalyUtils";
import { generateAnomalyExplanation, draftShowCauseNotice } from "../../services/claude";
import { formatINR } from "../../utils/formatters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Map, { Source, Layer, NavigationControl, FullscreenControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const SATELLITE_STYLE: any = {
  version: 8,
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
  const [quarry, setQuarry] = useState<Quarry | null>(null);

  useEffect(() => {
    const data = getMockData();
    const found = data.quarries.find(q => q.id === id);
    if (found) setQuarry(found);
  }, [id]);

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
    if (!quarry) return null;
    const generatePolygon = (lat: number, lng: number, radiusDeg: number, points: number, irregularity: number) => {
      const coords = [];
      for (let i = 0; i < points; i++) {
        const angle = (i * 360) / points;
        const rad = (angle * Math.PI) / 180;
        const r = radiusDeg + (Math.sin(i * 45) * irregularity); // stable pseudo-random
        coords.push([
          lng + r * Math.cos(rad),
          lat + r * Math.sin(rad)
        ]);
      }
      coords.push(coords[0]); // close the polygon
      return coords;
    };

    // 0.001 degrees is ~111 meters.
    const leaseCoords = generatePolygon(quarry.lat, quarry.lng, 0.0015, 12, 0.0002);
    // AI boundary is slightly larger and more irregular
    const aiCoords = generatePolygon(quarry.lat, quarry.lng, 0.0022, 16, 0.0005);

    return {
      lease: { type: "Feature" as const, geometry: { type: "Polygon" as const, coordinates: [leaseCoords] } },
      ai: { type: "Feature" as const, geometry: { type: "Polygon" as const, coordinates: [aiCoords] } }
    };
  }, [quarry]);

  if (!quarry || !anomalyData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-900"></div>
      </div>
    );
  }

  const chartData = [
    {
      name: "Current Month",
      "Declared Vol": quarry.declaredExtractionVolumeM3Monthly,
      "AI Vol": quarry.aiEstimatedExtractionVolumeM3Monthly,
    }
  ];

  const gapPercentage = ((anomalyData.gapM3 / quarry.declaredExtractionVolumeM3Monthly) * 100).toFixed(1);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-neutral-border pb-6">
        <div className="flex items-start gap-4">
          <Link to="/anomaly-detection" className="mt-1 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-neutral-border hover:bg-neutral-50 text-neutral-ink/70 transition-colors shadow-sm shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-brand-900">{quarry.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                anomalyData.severity === "High" ? "bg-red-50 text-red-700 border-red-200" :
                anomalyData.severity === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                {anomalyData.severity} Severity Anomaly
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-ink/70">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-brand-500" />
                {quarry.district} District
              </div>
              <div className="flex items-center gap-1.5">
                <FileDigit className="w-4 h-4 text-neutral-ink/40" />
                License: <span className="font-semibold text-brand-900">{quarry.licenseId}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-neutral-ink/40" />
                Operator: <span className="font-semibold text-brand-900">{quarry.operatorId}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-neutral-ink/40" />
                Mineral: <span className="font-semibold text-brand-900">{quarry.mineralType}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
           <button className="flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-md">
            <FileText className="w-4 h-4" />
            Issue Notice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Metrics & Map */}
        <div className="xl:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <h3 className="text-sm font-semibold text-neutral-ink/60 uppercase tracking-wide mb-1">Declared Volume</h3>
              <p className="text-2xl font-bold text-brand-900">{quarry.declaredExtractionVolumeM3Monthly.toLocaleString()} <span className="text-sm font-semibold text-neutral-ink/50">m³</span></p>
            </div>
            
            <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-neutral-ink/60 uppercase tracking-wide">AI Volumetric Gap</h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-600">+{Math.round(anomalyData.gapTonnes).toLocaleString()} <span className="text-sm font-semibold text-amber-500/70">tonnes</span></p>
              <p className="text-xs font-semibold text-amber-600/80 mt-1">({gapPercentage}% deviation)</p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertTriangle className="w-16 h-16 text-red-600" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-1">Estimated Revenue Loss</h3>
                <p className="text-2xl font-bold text-red-700">{formatINR(anomalyData.revenueLoss)}</p>
                <p className="text-xs font-semibold text-red-600/80 mt-1">Pending Seigniorage Collection</p>
              </div>
            </div>
          </div>

          {/* Interactive GIS Map */}
          <div className="bg-white border border-neutral-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between bg-neutral-surface">
              <div>
                <h3 className="text-lg font-bold text-brand-900 flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-brand-500" />
                  Live Spatial Analysis
                </h3>
                <p className="text-sm text-neutral-ink/60 mt-0.5">Coordinates: {quarry.lat.toFixed(6)}° N, {quarry.lng.toFixed(6)}° E</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-ink/70">
                  <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-500/10"></div>
                  Approved Lease
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-ink/70">
                  <div className="w-3 h-3 rounded-full border-2 border-red-500 border-dashed bg-red-500/20"></div>
                  AI Extent
                </div>
              </div>
            </div>
            
            <div className="relative flex-1 w-full bg-slate-100">
              <Map
                initialViewState={{
                  longitude: quarry.lng,
                  latitude: quarry.lat,
                  zoom: 15.5,
                  pitch: 45
                }}
                mapStyle={SATELLITE_STYLE}
                interactive={true}
                attributionControl={false}
              >
                <NavigationControl position="top-right" />
                <FullscreenControl position="top-right" />
                
                {mapPolygons && (
                  <>
                    <Source id="approved-lease" type="geojson" data={mapPolygons.lease as any}>
                      <Layer
                        id="approved-fill"
                        type="fill"
                        paint={{ "fill-color": "rgba(34, 197, 94, 0.15)" }}
                      />
                      <Layer
                        id="approved-line"
                        type="line"
                        paint={{ "line-color": "#22c55e", "line-width": 2 }}
                      />
                    </Source>
                    
                    <Source id="ai-extent" type="geojson" data={mapPolygons.ai as any}>
                      <Layer
                        id="ai-fill"
                        type="fill"
                        paint={{ "fill-color": "rgba(239, 68, 68, 0.2)" }}
                      />
                      <Layer
                        id="ai-line"
                        type="line"
                        paint={{ "line-color": "#ef4444", "line-width": 2, "line-dasharray": [2, 2] }}
                      />
                    </Source>

                    {/* Center point marker */}
                    <Source id="quarry-center-source" type="geojson" data={{
                      type: "Feature",
                      geometry: { type: "Point", coordinates: [quarry.lng, quarry.lat] },
                      properties: {}
                    }}>
                      <Layer
                        id="quarry-center"
                        type="circle"
                        paint={{
                          "circle-radius": 4,
                          "circle-color": "#ffffff",
                          "circle-stroke-width": 2,
                          "circle-stroke-color": "#000000"
                        }}
                      />
                    </Source>
                  </>
                )}
              </Map>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Actions */}
        <div className="space-y-6">
          
          {/* Claude AI Insight */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm overflow-hidden relative">
            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
              <Activity className="w-32 h-32 text-indigo-700" />
            </div>
            <div className="px-5 py-4 flex items-center gap-3 border-b border-indigo-100/60">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900 leading-tight">AI Diagnostic Insight</h3>
                <p className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest mt-0.5">Confidence: 94%</p>
              </div>
            </div>
            <div className="p-5 relative z-10">
              <div className="bg-white/60 rounded-lg p-4 border border-indigo-100/50 shadow-sm backdrop-blur-sm">
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {anomalyData.explanation.english}
                </p>
                <div className="my-4 h-px bg-indigo-100/60"></div>
                <p className="text-sm text-slate-700 leading-relaxed font-sans font-medium">
                  {anomalyData.explanation.tamil}
                </p>
              </div>
            </div>
          </div>

           {/* Volume Chart */}
           <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-brand-900 mb-4">Volumetric Analysis</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                  <XAxis dataKey="name" stroke="#a3a3a3" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#a3a3a3" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e5e5', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                    cursor={{ fill: '#f5f5f5' }}
                  />
                  <Bar dataKey="Declared Vol" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="AI Vol" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Center */}
          <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-brand-900 mb-3">Enforcement Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 bg-white hover:bg-neutral-50 text-brand-900 rounded-lg transition-colors border border-neutral-border shadow-sm group">
                <span className="flex items-center gap-2.5 font-bold text-sm">
                  <Send className="w-4 h-4 text-brand-500" />
                  Dispatch Ground Inspector
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-ink/40 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-white hover:bg-red-50 text-red-700 rounded-lg transition-colors border border-neutral-border hover:border-red-200 shadow-sm group">
                <span className="flex items-center gap-2.5 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  Escalate to District Collector
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-ink/40 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Draft Notice Section */}
      <div className="bg-white border border-neutral-border rounded-xl overflow-hidden shadow-sm mt-6">
        <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex items-center justify-between">
           <h3 className="font-bold text-brand-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-500" />
            System-Generated Show-Cause Notice
          </h3>
          <span className="bg-white border border-neutral-border px-2.5 py-1 rounded-md text-[10px] font-bold text-neutral-ink/60 uppercase tracking-wider">Draft Mode</span>
        </div>
        <div className="p-6 bg-slate-50 border-b border-neutral-border">
          <div className="bg-white p-6 rounded-lg border border-slate-200 font-mono text-sm text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm">
            {anomalyData.draftNotice}
          </div>
        </div>
        <div className="px-6 py-4 bg-white flex justify-end gap-3">
          <button className="px-5 py-2 bg-white border border-neutral-border hover:bg-neutral-50 text-neutral-ink rounded-lg text-sm font-bold transition-colors shadow-sm">
            Edit Document
          </button>
          <button className="px-5 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
