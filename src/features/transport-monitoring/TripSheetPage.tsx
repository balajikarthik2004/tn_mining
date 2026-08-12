import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, QrCode, MapPin, Navigation2, CheckCircle2, AlertTriangle, Scale, ShieldAlert, Clock, ScanFace, Check, ArrowRight } from "lucide-react";
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

  if (!trip) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-900"></div>
    </div>
  );

  const StatusIcon = 
    trip.status === "Delivered" ? CheckCircle2 :
    trip.status === "Suspicious" || trip.status === "Overdue" ? AlertTriangle :
    Navigation2;

  const statusColor = 
    trip.status === "Delivered" ? "bg-green-50 text-green-700 border-green-200" :
    trip.status === "Suspicious" || trip.status === "Overdue" ? "bg-red-50 text-red-700 border-red-200" :
    "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-border pb-6">
        <div className="flex items-start gap-4">
          <Link to="/transport-hub" className="mt-1 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-neutral-border hover:bg-neutral-50 text-neutral-ink/70 transition-colors shadow-sm shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-brand-900">
                Trip Sheet: {trip.tripSheetNumber}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${statusColor}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {trip.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-ink/70">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-brand-900">Vehicle:</span> {trip.vehicleNumber}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-brand-900">Driver:</span> {trip.driverName}
              </div>
            </div>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg transition-colors font-bold text-sm shadow-sm shrink-0">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex justify-between items-center">
              <h3 className="font-bold text-brand-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" /> Authorized Route
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 bg-neutral-surface border border-neutral-border rounded-lg p-4">
                  <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">Origin Quarry</span>
                  <span className="block text-brand-900 font-bold">{trip.originQuarry}</span>
                </div>
                <ArrowRight className="w-6 h-6 text-neutral-ink/30 shrink-0" />
                <div className="flex-1 bg-neutral-surface border border-neutral-border rounded-lg p-4">
                  <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">Destination</span>
                  <span className="block text-brand-900 font-bold">{trip.destination}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-neutral-border/50">
                <div>
                  <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">Mineral</span>
                  <span className="block text-brand-900 font-bold">{trip.mineralType}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">Operator</span>
                  <span className="block text-brand-900 font-bold">{trip.operatorName}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">Start Time</span>
                  <span className="block text-neutral-ink/80 font-medium">{formatDateTime(trip.startTime)}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">Estimated Arrival</span>
                  <span className="block text-neutral-ink/80 font-medium">{formatDateTime(trip.estimatedArrivalTime)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex justify-between items-center">
              <h3 className="font-bold text-brand-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-brand-500" /> Weighbridge Verification
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-neutral-surface rounded-lg border border-neutral-border relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-8 h-8 bg-neutral-100 rounded-bl-full -mr-2 -mt-2"></div>
                  <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest">Loading Weight</span>
                  <span className="block mt-2 text-3xl font-black text-brand-900">{trip.loadingWeightTonnes} t</span>
                  <span className="flex items-center gap-1 mt-2 text-[10px] font-bold text-green-600 bg-green-50 w-max px-1.5 py-0.5 rounded uppercase border border-green-100">
                    <Check className="w-3 h-3" /> Verified at Source
                  </span>
                </div>
                
                <div className="p-5 bg-neutral-surface rounded-lg border border-neutral-border">
                  <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest">Delivery Weight</span>
                  <span className="block mt-2 text-3xl font-black text-brand-900">
                    {trip.deliveryWeightTonnes ? `${trip.deliveryWeightTonnes} t` : "--"}
                  </span>
                  {trip.deliveryWeightTonnes ? (
                    <span className="flex items-center gap-1 mt-2 text-[10px] font-bold text-green-600 bg-green-50 w-max px-1.5 py-0.5 rounded uppercase border border-green-100">
                      <Check className="w-3 h-3" /> Verified at Dest
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 mt-2 text-[10px] font-bold text-orange-600 bg-orange-50 w-max px-1.5 py-0.5 rounded uppercase border border-orange-100">
                      Pending
                    </span>
                  )}
                </div>
                
                <div className={`p-5 rounded-lg border ${
                   trip.deliveryWeightTonnes 
                   ? Math.abs(trip.loadingWeightTonnes - trip.deliveryWeightTonnes) > (trip.loadingWeightTonnes * 0.05)
                     ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                   : "bg-neutral-surface border-neutral-border"
                }`}>
                  <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest">Discrepancy</span>
                  <span className={`block mt-2 text-3xl font-black ${
                    trip.deliveryWeightTonnes 
                      ? Math.abs(trip.loadingWeightTonnes - trip.deliveryWeightTonnes) > (trip.loadingWeightTonnes * 0.05)
                        ? "text-red-700" : "text-green-700"
                      : "text-neutral-ink/40"
                  }`}>
                    {trip.deliveryWeightTonnes 
                      ? `${Math.abs(trip.loadingWeightTonnes - trip.deliveryWeightTonnes)} t`
                      : "--"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {trip.anomalies.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm overflow-hidden">
               <div className="bg-red-100/50 px-6 py-4 border-b border-red-200 flex justify-between items-center">
                <h3 className="font-bold text-red-800 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" /> Detected Enforcement Anomalies
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {trip.anomalies.map(anm => (
                  <div key={anm.id} className="p-4 bg-white rounded-lg border border-red-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-red-700">{anm.type}</span>
                      <span className="text-xs font-bold text-neutral-ink/50">{formatDateTime(anm.timestamp)}</span>
                    </div>
                    <p className="text-sm text-neutral-ink/80 font-medium leading-relaxed">{anm.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-neutral-border rounded-xl shadow-sm overflow-hidden flex flex-col items-center text-center">
            <div className="w-full bg-neutral-surface px-6 py-4 border-b border-neutral-border flex items-center justify-center">
              <h3 className="font-bold text-brand-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-500" /> Official e-Permit QR
              </h3>
            </div>
            <div className="p-8">
              <div className="bg-white p-2 rounded-xl border border-neutral-border shadow-sm mb-4">
                <svg className="w-40 h-40 text-brand-900" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
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
              <p className="text-xs font-medium text-neutral-ink/60 max-w-[200px] mx-auto">
                Scan by flying squads to verify digital trip sheet and tracking data instantly.
              </p>
            </div>
          </div>

          <div className="bg-white border border-neutral-border rounded-xl shadow-sm overflow-hidden">
            <div className="w-full bg-neutral-surface px-6 py-4 border-b border-neutral-border">
              <h3 className="font-bold text-brand-900 flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-brand-500" /> Verification Log
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-surface rounded-lg border border-neutral-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg border border-green-100 text-green-600"><CheckCircle2 className="w-4 h-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-brand-900">Digital Scans Passed</p>
                    <p className="text-xs font-medium text-neutral-ink/60">{trip.checkpostsPassed} automated checkpoints</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-surface rounded-lg border border-neutral-border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${trip.status === "Delivered" ? "bg-green-50 border-green-100 text-green-600" : "bg-blue-50 border-blue-100 text-blue-600"}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-900">Transport Status</p>
                    <p className="text-xs font-medium text-neutral-ink/60">{trip.status}</p>
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
