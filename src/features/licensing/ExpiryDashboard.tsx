import { useMemo } from "react";
import type { License } from "../../types/license";
import { formatINR } from "../../utils/formatters";
import { CheckCircle2, AlertTriangle, FileWarning, ShieldAlert, IndianRupee } from "lucide-react";

interface Props {
  licenses: License[];
}

export function ExpiryDashboard({ licenses }: Props) {
  const stats = useMemo(() => {
    let active = 0;
    let expiring30 = 0;
    let expiring90 = 0;
    let expired = 0;
    let suspended = 0;
    
    let revenueAtRisk = 0;

    licenses.forEach(l => {
      if (l.status === "Active") active++;
      if (l.status === "Suspended") suspended++;
      if (l.status === "Expired") expired++;
      
      if (l.status === "Expiring Soon") {
        if (l.daysToExpiry <= 30) {
          expiring30++;
        } else {
          expiring90++;
        }
        revenueAtRisk += 450000;
      }
    });

    return { total: licenses.length, active, expiring30, expiring90, expired, suspended, revenueAtRisk };
  }, [licenses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Active Leases
        </h3>
        <p className="text-3xl font-black text-brand-900">{stats.active}</p>
        <p className="text-xs font-semibold text-neutral-ink/50 mt-1">Fully compliant quarries</p>
      </div>

      <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <FileWarning className="w-4 h-4 text-amber-500" /> Pending Renewals
        </h3>
        <p className="text-3xl font-black text-amber-600">{stats.expiring30 + stats.expiring90}</p>
        <p className="text-xs font-semibold text-neutral-ink/50 mt-1">Expiring within 90 days</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-12 h-12 bg-red-100 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
        <h3 className="text-xs font-bold text-red-800 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <ShieldAlert className="w-4 h-4 text-red-600" /> Suspended Ops
        </h3>
        <p className="text-3xl font-black text-red-700 relative z-10">{stats.suspended}</p>
        <p className="text-xs font-semibold text-red-600/70 mt-1 relative z-10">Licenses seized/halted</p>
      </div>

      <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <AlertTriangle className="w-4 h-4 text-neutral-ink/40" /> Expired Leases
        </h3>
        <p className="text-3xl font-black text-neutral-ink/80">{stats.expired}</p>
        <p className="text-xs font-semibold text-neutral-ink/50 mt-1">Inactive operations</p>
      </div>

      <div className="bg-white border border-neutral-border rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <IndianRupee className="w-4 h-4 text-brand-500" /> Revenue Forecast
        </h3>
        <p className="text-2xl font-black text-brand-900 mt-1">{formatINR(stats.revenueAtRisk)}</p>
        <p className="text-xs font-semibold text-neutral-ink/50 mt-1">From pending renewals</p>
      </div>
    </div>
  );
}
