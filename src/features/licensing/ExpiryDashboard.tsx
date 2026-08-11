import { useMemo } from "react";
import type { License } from "../../types/license";
import { formatINR } from "../../utils/formatters";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Licenses</h3>
        <p className="text-3xl font-bold text-slate-100 mt-2">{stats.total}</p>
      </div>
      <div className="bg-slate-800/80 backdrop-blur border border-orange-500/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 bg-orange-500/10 rounded-bl-full -mr-2 -mt-2"></div>
        <h3 className="text-xs font-medium text-orange-400 uppercase tracking-wider">Expiring {'<'} 30 Days</h3>
        <p className="text-3xl font-bold text-orange-500 mt-2">{stats.expiring30}</p>
      </div>
      <div className="bg-slate-800/80 backdrop-blur border border-yellow-500/30 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-yellow-400 uppercase tracking-wider">Expiring {'<'} 90 Days</h3>
        <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.expiring90}</p>
      </div>
      <div className="bg-slate-800/80 backdrop-blur border border-red-500/30 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-red-400 uppercase tracking-wider">Expired / Suspended</h3>
        <p className="text-3xl font-bold text-red-500 mt-2">{stats.expired + stats.suspended}</p>
      </div>
      <div className="bg-slate-800/80 backdrop-blur border border-indigo-500/30 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Est. Revenue at Risk</h3>
        <p className="text-2xl font-bold text-indigo-400 mt-2">{formatINR(stats.revenueAtRisk)}</p>
      </div>
    </div>
  );
}
