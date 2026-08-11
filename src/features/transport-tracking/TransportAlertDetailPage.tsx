import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, FileText, Activity, MapPin, ShieldAlert, Crosshair } from "lucide-react";
import Map, { Source, Layer, Marker, NavigationControl } from "react-map-gl/maplibre";

import { getMockTransportTrips } from "../../data/mock/transportData";
import type { VehicleTrip } from "../../types/transport";
import { generateTransportViolationSummary, draftFIRDraft } from "../../services/claudeTransport";
import { formatDateTime } from "../../utils/formatters";

export function TransportAlertDetailPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState<VehicleTrip | null>(null);

  useEffect(() => {
    const data = getMockTransportTrips();
    const found = data.find(t => t.id === id);
    if (found) setTrip(found);
  }, [id]);

  const alertData = useMemo(() => {
    if (!trip) return null;
    const summary = generateTransportViolationSummary(trip);
    const firDraft = draftFIRDraft(trip);
    
    const actualLine = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: trip.actualRoute.map(p => [p.lng, p.lat])
      }
    };
    
    const declaredLine = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: trip.declaredRoute.map(p => [p.lng, p.lat])
      }
    };

    return { summary, firDraft, actualLine, declaredLine };
  }, [trip]);

  if (!trip || !alertData) {
    return <div className="p-8 text-slate-400">Loading...</div>;
  }

  const minLng = Math.min(...trip.actualRoute.map(p => p.lng));
  const maxLng = Math.max(...trip.actualRoute.map(p => p.lng));
  const minLat = Math.min(...trip.actualRoute.map(p => p.lat));
  const maxLat = Math.max(...trip.actualRoute.map(p => p.lat));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/transport-tracking" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            Vehicle {trip.vehicleNumber}
            <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
              trip.status === "Illegal" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
            }`}>
              {trip.status === "Illegal" ? "Illegal Transport" : "Suspicious Route"}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Driver: {trip.driverName} • Operator: {trip.operatorName} • Load: {trip.declaredWeightTonnes}t {trip.mineralType}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm h-[400px] relative">
            <Map
              initialViewState={{
                longitude: (minLng + maxLng) / 2,
                latitude: (minLat + maxLat) / 2,
                zoom: 7,
              }}
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
              attributionControl={false}
            >
              <NavigationControl position="top-right" />
              
              <Source type="geojson" data={alertData.declaredLine as any}>
                <Layer
                  id="declared-route"
                  type="line"
                  paint={{
                    "line-color": "#94a3b8",
                    "line-width": 3,
                    "line-dasharray": [2, 2]
                  }}
                />
              </Source>

              <Source type="geojson" data={alertData.actualLine as any}>
                <Layer
                  id="actual-route"
                  type="line"
                  paint={{
                    "line-color": trip.status === "Illegal" ? "#ef4444" : "#eab308",
                    "line-width": 4
                  }}
                />
              </Source>

              <Marker
                longitude={trip.currentLocation.lng}
                latitude={trip.currentLocation.lat}
                anchor="bottom"
              >
                <div className="bg-slate-900 border-2 border-red-500 rounded-full p-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  <Crosshair className="w-4 h-4 text-red-500" />
                </div>
              </Marker>
            </Map>
            <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur px-4 py-3 rounded-lg border border-slate-700/50 shadow-lg text-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 border-t-2 border-dashed border-slate-400"></div>
                <span className="text-slate-300">Declared Route to {trip.declaredDestination}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-1 border-t-2 ${trip.status === 'Illegal' ? 'border-red-500' : 'border-orange-500'}`}></div>
                <span className="text-slate-300">Actual GPS Path</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4" /> Transit Details
              </h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Origin</span>
                  <span className="font-medium text-slate-200">{trip.originQuarry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Declared Dest</span>
                  <span className="font-medium text-slate-200">{trip.declaredDestination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Actual Heading</span>
                  <span className="font-medium text-orange-400">{trip.borderState} Border</span>
                </div>
                {trip.crossingTimestamp && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Crossed At</span>
                    <span className="font-medium text-red-400">{formatDateTime(trip.crossingTimestamp)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" /> Permit Status
              </h3>
              <div className="flex items-center justify-between">
                <div className={`text-xl font-bold ${trip.permitStatus === 'Valid' ? 'text-emerald-400' : 'text-red-500'}`}>
                  {trip.permitStatus}
                </div>
                {trip.permitStatus !== "Valid" && (
                  <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded-md text-xs border border-red-500/20">
                    Violation
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-3">
                Minerals leaving the state must have a valid inter-state transport e-permit verified at checkposts.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Claude AI & Actions */}
        <div className="space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.1)] overflow-hidden">
            <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-5 py-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-indigo-200">Claude AI Insight</h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-200 leading-relaxed">
                {alertData.summary.english}
              </p>
              <div className="h-px bg-slate-700/50"></div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {alertData.summary.tamil}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-200 mb-4">Recommended Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-medium">
                <ShieldAlert className="w-4 h-4" />
                Block Vehicle Remotely
              </button>
              <button className="w-full flex items-center justify-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600/50 font-medium">
                <Send className="w-4 h-4 text-orange-400" />
                Alert Border Police
              </button>
            </div>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              AI Generated FIR Draft
            </h3>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {alertData.firDraft}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                Generate Official FIR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
