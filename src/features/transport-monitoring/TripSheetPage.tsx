import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, QrCode, MapPin, Navigation2, CheckCircle2, AlertTriangle, Scale, ShieldAlert, Clock } from "lucide-react";
import { getMockInternalTrips } from "../../data/mock/monitoringData";
import type { InternalTrip } from "../../types/transport";
import { formatDateTime } from "../../utils/formatters";

export function TripSheetPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState<InternalTrip | null>(null);

  useEffect(() => {
    const trips = getMockInternalTrips();
    setTrip(trips.find(t => t.id === id) || null);
  }, [id]);

  if (!trip) return <div className="p-8 text-slate-400">Loading...</div>;

  const StatusIcon = 
    trip.status === "Delivered" ? CheckCircle2 :
    trip.status === "Suspicious" || trip.status === "Overdue" ? AlertTriangle :
    Navigation2;

  const statusColor = 
    trip.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
    trip.status === "Suspicious" || trip.status === "Overdue" ? "bg-red-500/10 text-red-400 border-red-500/20" :
    "bg-blue-500/10 text-blue-400 border-blue-500/20";

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/transport-monitoring" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              Trip Sheet: {trip.tripSheetNumber}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColor}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {trip.status}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Vehicle: <span className="font-medium text-slate-300">{trip.vehicleNumber}</span> • Driver: {trip.driverName}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium text-sm border border-slate-700/50">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" /> Route & Cargo Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Origin Quarry</span>
                <span className="block mt-1 text-slate-200 font-medium">{trip.originQuarry}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Destination</span>
                <span className="block mt-1 text-slate-200 font-medium">{trip.destination}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Mineral Type</span>
                <span className="block mt-1 text-slate-200 font-medium">{trip.mineralType}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Operator</span>
                <span className="block mt-1 text-slate-200 font-medium">{trip.operatorName}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Start Time</span>
                <span className="block mt-1 text-slate-200 font-medium">{formatDateTime(trip.startTime)}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Estimated Arrival</span>
                <span className="block mt-1 text-slate-200 font-medium">{formatDateTime(trip.estimatedArrivalTime)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" /> Weighbridge Verification
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Loading Weight</span>
                <span className="block mt-1 text-2xl font-bold text-slate-200">{trip.loadingWeightTonnes} t</span>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Delivery Weight</span>
                <span className="block mt-1 text-2xl font-bold text-slate-200">
                  {trip.deliveryWeightTonnes ? `${trip.deliveryWeightTonnes} t` : "--"}
                </span>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Discrepancy</span>
                <span className={`block mt-1 text-2xl font-bold ${
                  trip.deliveryWeightTonnes 
                    ? Math.abs(trip.loadingWeightTonnes - trip.deliveryWeightTonnes) > (trip.loadingWeightTonnes * 0.05)
                      ? "text-red-500" : "text-emerald-500"
                    : "text-slate-400"
                }`}>
                  {trip.deliveryWeightTonnes 
                    ? `${Math.abs(trip.loadingWeightTonnes - trip.deliveryWeightTonnes)} t`
                    : "--"
                  }
                </span>
              </div>
            </div>
          </div>

          {trip.anomalies.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-red-400 mb-4 border-b border-red-500/20 pb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Detected Anomalies
              </h3>
              <div className="space-y-3">
                {trip.anomalies.map(anm => (
                  <div key={anm.id} className="p-4 bg-red-950/30 rounded-lg border border-red-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-red-400">{anm.type}</span>
                      <span className="text-xs text-red-400/70">{formatDateTime(anm.timestamp)}</span>
                    </div>
                    <p className="text-sm text-red-200">{anm.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-slate-200 mb-4 w-full border-b border-slate-700/50 pb-3 flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-400" /> E-Permit QR Code
            </h3>
            <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
              <svg className="w-40 h-40 text-black" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,0 h30 v30 h-30 z m5,5 v20 h20 v-20 z m5,5 h10 v10 h-10 z" />
                <path d="M70,0 h30 v30 h-30 z m5,5 v20 h20 v-20 z m5,5 h10 v10 h-10 z" />
                <path d="M0,70 h30 v30 h-30 z m5,5 v20 h20 v-20 z m5,5 h10 v10 h-10 z" />
                <path d="M40,0 h20 v10 h-20 z M40,20 h10 v10 h-10 z M50,10 h10 v10 h-10 z" />
                <path d="M40,70 h10 v30 h-10 z M50,70 h20 v10 h-20 z M50,90 h10 v10 h-10 z" />
                <path d="M70,40 h10 v20 h-10 z M80,40 h20 v10 h-20 z M90,50 h10 v10 h-10 z" />
                <path d="M0,40 h20 v10 h-20 z M0,50 h10 v20 h-10 z M20,50 h10 v10 h-10 z" />
                <path d="M30,30 h40 v40 h-40 z m10,10 v20 h20 v-20 z" />
                <path d="M70,70 h30 v30 h-30 z m10,10 v10 h10 v-10 z" />
              </svg>
            </div>
            <p className="text-xs text-slate-400">Scan at virtual checkposts or by field officers to verify trip details instantly.</p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" /> Checkpost Log
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-400"><CheckCircle2 className="w-4 h-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Virtual Checkposts Passed</p>
                    <p className="text-xs text-slate-400">{trip.checkpostsPassed} recorded points</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${trip.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Trip Status</p>
                    <p className="text-xs text-slate-400">{trip.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
