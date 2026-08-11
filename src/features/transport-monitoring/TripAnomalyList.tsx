import { AlertTriangle, Clock, Map, Scale, ChevronRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { InternalTrip } from "../../types/transport";
import { formatTimeAgo } from "../../utils/formatters";

interface Props {
  trips: InternalTrip[];
}

export function TripAnomalyList({ trips }: Props) {
  const anomalousTrips = trips.filter(t => t.anomalies.length > 0).sort((a, b) => {
    const timeA = Math.max(...a.anomalies.map(anm => new Date(anm.timestamp).getTime()));
    const timeB = Math.max(...b.anomalies.map(anm => new Date(anm.timestamp).getTime()));
    return timeB - timeA;
  });

  if (anomalousTrips.length === 0) {
    return (
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-slate-300 font-medium">No Anomalies Detected</p>
        <p className="text-sm text-slate-500 mt-1">All monitored trips are currently compliant.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl shadow-sm flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30 rounded-t-xl shrink-0">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" /> Recent Trip Anomalies
        </h3>
        <span className="bg-red-500/10 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/20">
          {anomalousTrips.length} Active
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {anomalousTrips.map(trip => {
          const latestAnomaly = [...trip.anomalies].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
          
          const Icon = 
            latestAnomaly.type === "Weight Mismatch" ? Scale :
            latestAnomaly.type === "Route Deviation" ? Map :
            latestAnomaly.type === "Time Anomaly" ? Clock : AlertTriangle;

          return (
            <div key={trip.id} className="p-4 bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 rounded-lg group transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                    latestAnomaly.severity === "High" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                    "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{trip.vehicleNumber}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{latestAnomaly.type}</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-2">{latestAnomaly.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                      <span>Trip: {trip.tripSheetNumber}</span>
                      <span>From: {trip.originQuarry}</span>
                      <span>{formatTimeAgo(latestAnomaly.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <Link to={`/transport-monitoring/${trip.id}`} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-indigo-500 transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
