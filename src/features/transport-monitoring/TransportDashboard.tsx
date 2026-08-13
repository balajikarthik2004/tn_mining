import { useMemo } from "react";
import type { InternalTrip } from "../../types/transport";
import { Truck, CheckCircle2, AlertTriangle, FileDigit, ScanLine } from "lucide-react";

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

    const checkpostScans = trips.reduce((acc, t) => acc + t.checkpostsPassed, 0);

    return { total: trips.length, completed, inProgress, anomaliesCount, totalTonnes, checkpostScans };
  }, [trips]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <FileDigit className="w-4 h-4 text-brand-500" /> Active e-Passes
        </h3>
        <p className="text-3xl font-black text-brand-900">{stats.total}</p>
        <p className="text-xs font-semibold text-neutral-ink/50 mt-1">Generated today</p>
      </div>

      <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <Truck className="w-4 h-4 text-blue-500" /> In Transit
        </h3>
        <p className="text-3xl font-black text-blue-600">{stats.inProgress}</p>
        <p className="text-xs font-semibold text-neutral-ink/50 mt-1">Currently on route</p>
      </div>

      <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Delivered
        </h3>
        <p className="text-3xl font-black text-emerald-600">{stats.completed}</p>
        <p className="text-xs font-semibold text-neutral-ink/50 mt-1">Verified unloading</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-12 h-12 bg-red-100 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
        <h3 className="text-xs font-bold text-red-800 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <AlertTriangle className="w-4 h-4 text-red-600" /> Route Deviations
        </h3>
        <p className="text-3xl font-black text-red-700 relative z-10">{stats.anomaliesCount}</p>
        <p className="text-xs font-semibold text-red-600/70 mt-1 relative z-10">Suspicious trips flagged</p>
      </div>

      <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <ScanLine className="w-4 h-4 text-indigo-500" /> Checkpost Scans
        </h3>
        <p className="text-3xl font-black text-brand-900">{stats.checkpostScans}</p>
        <p className="text-xs font-semibold text-neutral-ink/50 mt-1">Automatic verification</p>
      </div>
    </div>
  );
}
