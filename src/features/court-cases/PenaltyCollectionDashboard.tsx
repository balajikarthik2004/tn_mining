import { useMemo } from "react";
import type { CourtCase } from "../../types/courtCases";
import { formatINR } from "../../utils/formatters";
import { IndianRupee, TrendingUp, AlertCircle, FileX } from "lucide-react";

interface Props {
  cases: CourtCase[];
}

export function PenaltyCollectionDashboard({ cases }: Props) {
  const stats = useMemo(() => {
    let totalImposed = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalWrittenOff = 0;

    cases.forEach(c => {
      totalImposed += c.penaltyAmount;
      totalCollected += c.amountPaid;
      if (c.status === "Written Off") {
        totalWrittenOff += c.penaltyAmount;
      } else {
        totalOutstanding += (c.penaltyAmount - c.amountPaid);
      }
    });

    return { totalImposed, totalCollected, totalOutstanding, totalWrittenOff };
  }, [cases]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" /> Total Penalties Imposed
        </h3>
        <p className="text-2xl font-bold text-slate-100 mt-2">{formatINR(stats.totalImposed)}</p>
        <p className="text-sm text-slate-400 mt-1">Across {cases.length} active cases</p>
      </div>
      
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-400" /> Amount Collected
        </h3>
        <p className="text-2xl font-bold text-emerald-500 mt-2">{formatINR(stats.totalCollected)}</p>
        <p className="text-sm text-emerald-400/70 mt-1">{((stats.totalCollected / stats.totalImposed) * 100).toFixed(1)}% recovery rate</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-orange-500/30 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-orange-400 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-400" /> Outstanding Arrears
        </h3>
        <p className="text-2xl font-bold text-orange-500 mt-2">{formatINR(stats.totalOutstanding)}</p>
        <p className="text-sm text-orange-400/70 mt-1">Pending collection/appeals</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FileX className="w-4 h-4 text-slate-400" /> Written Off
        </h3>
        <p className="text-2xl font-bold text-slate-300 mt-2">{formatINR(stats.totalWrittenOff)}</p>
        <p className="text-sm text-slate-500 mt-1">Unrecoverable / court dismissed</p>
      </div>
    </div>
  );
}
