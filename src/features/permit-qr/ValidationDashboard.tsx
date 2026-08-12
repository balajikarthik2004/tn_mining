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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <QrCode className="w-4 h-4 text-brand-500" /> Field Scans Today
        </h3>
        <p className="text-3xl font-black text-brand-900">{stats.total}</p>
        <p className="text-xs font-semibold text-neutral-ink/50 mt-1">Across all checkposts</p>
      </div>

      <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <CheckCircle2 className="w-4 h-4 text-green-500" /> Valid e-Passes
        </h3>
        <p className="text-3xl font-black text-green-600">{stats.valid}</p>
        <p className="text-xs font-semibold text-neutral-ink/50 mt-1">Cleared for transport</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-12 h-12 bg-red-100 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
        <h3 className="text-xs font-bold text-red-800 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <ShieldAlert className="w-4 h-4 text-red-600" /> Forged Permits Seized
        </h3>
        <p className="text-3xl font-black text-red-700 relative z-10">{stats.forged}</p>
        <p className="text-xs font-semibold text-red-600/70 mt-1 relative z-10">Immediate alerts triggered</p>
      </div>

      <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <AlertOctagon className="w-4 h-4 text-orange-500" /> Volume Quota Exceeded
        </h3>
        <p className="text-3xl font-black text-orange-600">{stats.quotaExceeded}</p>
        <p className="text-xs font-semibold text-neutral-ink/50 mt-1">Permits auto-expired</p>
      </div>
    </div>
  );
}
