import { useMemo } from "react";
import type { ScanEvent } from "../../types/permit";
import { QrCode, CheckCircle2, ShieldAlert, AlertOctagon } from "lucide-react";

interface Props {
  scans: ScanEvent[];
}

export function ValidationDashboard({ scans }: Props) {
  const stats = useMemo(() => {
    let valid = 0;
    let invalid = 0;
    let forged = 0;
    let quotaExceeded = 0;

    scans.forEach(s => {
      if (s.result === "Valid") valid++;
      else {
        invalid++;
        if (s.invalidReason === "Forged") forged++;
        if (s.invalidReason === "Quantity Exceeded") quotaExceeded++;
      }
    });

    return { total: scans.length, valid, invalid, forged, quotaExceeded };
  }, [scans]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <QrCode className="w-4 h-4 text-indigo-400" /> Total Scans Today
        </h3>
        <p className="text-3xl font-bold text-slate-100 mt-2">{stats.total}</p>
        <p className="text-sm text-slate-400 mt-1">Across all checkposts</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Valid Permits
        </h3>
        <p className="text-3xl font-bold text-emerald-500 mt-2">{stats.valid}</p>
        <p className="text-sm text-emerald-400/70 mt-1">Cleared for transport</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-red-500/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 rounded-bl-full -mr-2 -mt-2"></div>
        <h3 className="text-xs font-medium text-red-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" /> Fake / Forged Flags
        </h3>
        <p className="text-3xl font-bold text-red-500 mt-2">{stats.forged}</p>
        <p className="text-sm text-red-400/70 mt-1">Immediate alerts triggered</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-orange-500/30 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-orange-400 uppercase tracking-wider flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-orange-400" /> Quota Exceeded
        </h3>
        <p className="text-3xl font-bold text-orange-500 mt-2">{stats.quotaExceeded}</p>
        <p className="text-sm text-orange-400/70 mt-1">Permit auto-expired</p>
      </div>
    </div>
  );
}
