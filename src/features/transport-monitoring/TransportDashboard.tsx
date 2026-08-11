import { useMemo } from "react";
import type { InternalTrip } from "../../types/transport";
import { formatINR } from "../../utils/formatters";
import { Truck, CheckCircle2, AlertTriangle, IndianRupee } from "lucide-react";

interface Props {
  trips: InternalTrip[];
}

export function TransportDashboard({ trips }: Props) {
  const stats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let anomaliesCount = 0;
    let totalTonnes = 0;

    trips.forEach(t => {
      if (t.status === "Delivered") completed++;
      else inProgress++;
      
      if (t.anomalies.length > 0) anomaliesCount++;
      totalTonnes += t.loadingWeightTonnes;
    });

    const revenue = trips.length * 100 + totalTonnes * 50;

    return { total: trips.length, completed, inProgress, anomaliesCount, totalTonnes, revenue };
  }, [trips]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-indigo-400" /> Today's Trips
        </h3>
        <p className="text-3xl font-bold text-slate-100 mt-2">{stats.total}</p>
        <p className="text-sm text-slate-400 mt-1">Total scheduled</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed
        </h3>
        <p className="text-3xl font-bold text-emerald-400 mt-2">{stats.completed}</p>
        <p className="text-sm text-slate-400 mt-1">Successfully delivered</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-400" /> In Progress
        </h3>
        <p className="text-3xl font-bold text-blue-400 mt-2">{stats.inProgress}</p>
        <p className="text-sm text-slate-400 mt-1">Currently on route</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-red-500/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 rounded-bl-full -mr-2 -mt-2"></div>
        <h3 className="text-xs font-medium text-red-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" /> Anomalies
        </h3>
        <p className="text-3xl font-bold text-red-500 mt-2">{stats.anomaliesCount}</p>
        <p className="text-sm text-red-400/70 mt-1">Trips flagged</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-yellow-400" /> Permit Revenue
        </h3>
        <p className="text-2xl font-bold text-yellow-400 mt-2">{formatINR(stats.revenue)}</p>
        <p className="text-sm text-slate-400 mt-1">{stats.totalTonnes} tonnes total</p>
      </div>
    </div>
  );
}
