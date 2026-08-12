import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, Activity, MapPin, ShieldAlert, Crosshair, Camera, CheckCircle2, AlertTriangle, Scale } from "lucide-react";
import Map, { Source, Layer, Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { getMockTransportTrips } from "../../data/mock/transportData";
import type { VehicleTrip } from "../../types/transport";
import { generateTransportViolationSummary, draftFIRDraft } from "../../services/claudeTransport";
import { formatDateTime } from "../../utils/formatters";

const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-900"></div>
      </div>
    );
  }

  const minLng = Math.min(...trip.actualRoute.map(p => p.lng));
  const maxLng = Math.max(...trip.actualRoute.map(p => p.lng));
  const minLat = Math.min(...trip.actualRoute.map(p => p.lat));
  const maxLat = Math.max(...trip.actualRoute.map(p => p.lat));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-neutral-border pb-6">
        <div className="flex items-start gap-4">
          <Link to="/transport-hub" className="mt-1 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-neutral-border hover:bg-neutral-50 text-neutral-ink/70 transition-colors shadow-sm shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-brand-900">Vehicle {trip.vehicleNumber}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                trip.status === "Illegal" ? "bg-red-50 text-red-700 border-red-200" :
                trip.status === "Suspicious" ? "bg-orange-50 text-orange-700 border-orange-200" :
                "bg-green-50 text-green-700 border-green-200"
              }`}>
                {trip.status === "Illegal" ? <ShieldAlert className="w-3.5 h-3.5" /> : trip.status === "Suspicious" ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {trip.status === "Illegal" ? "Illegal Transport" : trip.status === "Suspicious" ? "Suspicious Route" : "Compliant"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-ink/70">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-brand-900">Driver:</span> {trip.driverName}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-brand-900">Operator:</span> {trip.operatorName}
              </div>
              <div className="flex items-center gap-1.5 font-bold text-neutral-ink">
                Load: {trip.declaredWeightTonnes}t {trip.mineralType}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[450px]">
            <div className="px-5 py-3 border-b border-neutral-border bg-neutral-surface flex justify-between items-center">
              <h3 className="font-bold text-brand-900 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-brand-500" />
                Live Route Trajectory
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-ink/70">
                  <div className="w-3 h-1 bg-slate-300 border border-slate-400 border-dashed"></div>
                  Declared
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-ink/70">
                  <div className={`w-3 h-1 ${trip.status === 'Illegal' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                  Actual
                </div>
              </div>
            </div>
            <div className="flex-1 relative">
              <Map
                initialViewState={{
                  longitude: (minLng + maxLng) / 2,
                  latitude: (minLat + maxLat) / 2,
                  zoom: 6.5,
                }}
                mapStyle={MAP_STYLE_URL}
                interactive={true}
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
                      "line-color": trip.status === "Illegal" ? "#ef4444" : "#f97316",
                      "line-width": 4
                    }}
                  />
                </Source>

                <Marker
                  longitude={trip.currentLocation.lng}
                  latitude={trip.currentLocation.lat}
                  anchor="center"
                >
                  <div className={`bg-white border-2 rounded-full p-1.5 shadow-md flex items-center justify-center transition-transform hover:scale-110 ${trip.status === 'Illegal' ? 'border-red-500' : 'border-orange-500'}`}>
                    <Crosshair className={`w-3.5 h-3.5 ${trip.status === 'Illegal' ? 'text-red-500' : 'text-orange-500'}`} />
                  </div>
                </Marker>
              </Map>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-brand-900 flex items-center gap-2 mb-4 pb-2 border-b border-neutral-border/50">
                <MapPin className="w-4 h-4 text-brand-500" /> 
                Transit Details
              </h3>
              <div className="space-y-3 text-sm text-neutral-ink/70">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Origin</span>
                  <span className="font-bold text-brand-900">{trip.originQuarry}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Declared Dest.</span>
                  <span className="font-bold text-brand-900">{trip.declaredDestination}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Actual Heading</span>
                  <span className="font-bold text-orange-600">{trip.borderState} Border</span>
                </div>
                {trip.crossingTimestamp && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Detected At</span>
                    <span className="font-bold text-red-600">{formatDateTime(trip.crossingTimestamp)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-brand-900 flex items-center gap-2 mb-4 pb-2 border-b border-neutral-border/50">
                <Camera className="w-4 h-4 text-brand-500" /> 
                RTO Checkpost Integration
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-ink/70">ANPR Scan Status</span>
                  <span className="font-bold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Matched</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-ink/70">RFID FASTag</span>
                  <span className="font-bold text-brand-900">Verified</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-neutral-border/50">
                  <span className="font-medium text-neutral-ink/70">e-Pass Validation</span>
                  <div className="flex flex-col items-end">
                     <span className={`font-black ${trip.permitStatus === 'Valid' ? 'text-green-600' : 'text-red-600'}`}>
                      {trip.permitStatus}
                    </span>
                    {trip.permitStatus !== "Valid" && (
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-1 rounded mt-0.5">Seizure Authorized</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Claude AI & Actions */}
        <div className="space-y-6">
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
                <p className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest mt-0.5">Automated Analysis</p>
              </div>
            </div>
            <div className="p-5 relative z-10">
              <div className="bg-white/60 rounded-lg p-4 border border-indigo-100/50 shadow-sm backdrop-blur-sm">
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {alertData.summary.english}
                </p>
                <div className="my-4 h-px bg-indigo-100/60"></div>
                <p className="text-sm text-slate-700 leading-relaxed font-sans font-medium">
                  {alertData.summary.tamil}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-brand-900 mb-3">Enforcement Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors border border-red-200 shadow-sm group">
                <span className="flex items-center gap-2.5 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  Order Vehicle Confiscation
                </span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-white hover:bg-neutral-50 text-brand-900 rounded-lg transition-colors border border-neutral-border shadow-sm group">
                <span className="flex items-center gap-2.5 font-bold text-sm">
                  <Send className="w-4 h-4 text-brand-500" />
                  Alert Border Police Checkpost
                </span>
              </button>
            </div>
          </div>
          
          <div className="bg-white border border-neutral-border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-neutral-surface px-5 py-4 border-b border-neutral-border flex items-center justify-between">
              <h3 className="font-bold text-brand-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-500" />
                AI Generated FIR Draft
              </h3>
              <span className="bg-white border border-neutral-border px-2 py-1 rounded-md text-[10px] font-bold text-neutral-ink/60 uppercase tracking-wider">Draft</span>
            </div>
            <div className="bg-slate-50 p-5 border-b border-neutral-border">
              <div className="bg-white p-5 rounded-lg border border-slate-200 font-mono text-sm text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm max-h-[300px] overflow-y-auto">
                {alertData.firDraft}
              </div>
            </div>
            <div className="px-5 py-3 bg-white flex justify-end">
              <button className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-sm font-bold transition-colors shadow-sm w-full">
                Generate Official FIR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
