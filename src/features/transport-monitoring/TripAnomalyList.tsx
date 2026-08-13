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
      <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] p-6">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-brand-900 font-bold text-lg">No Anomalies Detected</p>
        <p className="text-sm font-medium text-neutral-ink/50 mt-1 max-w-[250px]">All monitored internal trips are currently compliant with their declared e-Pass routes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[800px]">
      <div className="p-4 border-b border-neutral-border flex justify-between items-center bg-neutral-surface shrink-0">
        <h3 className="font-bold text-brand-900 flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-500" /> Actionable Anomalies
        </h3>
        <span className="bg-red-50 text-red-700 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border border-red-200">
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
            <div key={trip.id} className="p-4 bg-white border border-neutral-border hover:border-brand-500/50 hover:shadow-md rounded-xl group transition-all relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${latestAnomaly.severity === 'High' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className={`mt-0.5 p-2 rounded-lg shrink-0 border ${
                    latestAnomaly.severity === "High" ? "bg-red-50 text-red-600 border-red-100" :
                    "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-brand-900 text-sm">{trip.vehicleNumber}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-ink/60 bg-neutral-surface border border-neutral-border px-1.5 py-0.5 rounded">{latestAnomaly.type}</span>
                    </div>
                    <p className="text-xs font-medium text-neutral-ink/70 mt-1 line-clamp-2 leading-relaxed">{latestAnomaly.description}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[10px] font-bold text-neutral-ink/50 uppercase tracking-wide">
                      <span className="flex items-center gap-1">TS: {trip.tripSheetNumber.split('/').pop()}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-border"></span>
                      <span>{formatTimeAgo(latestAnomaly.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <Link to={`/transport-monitoring/${trip.id}`} className="p-1.5 rounded-md bg-neutral-surface border border-neutral-border text-neutral-ink/40 group-hover:text-brand-900 group-hover:border-brand-200 transition-colors shrink-0">
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
