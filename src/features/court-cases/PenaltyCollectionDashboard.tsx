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
      <div className="bg-white border border-neutral-border rounded-2xl p-5 shadow-sm">
        <h3 className="text-[10px] font-black text-neutral-ink/50 uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-500" /> Total Penalties Imposed
        </h3>
        <p className="text-2xl md:text-3xl font-black text-brand-900 mt-2">{formatINR(stats.totalImposed)}</p>
        <p className="text-xs font-bold text-neutral-ink/60 mt-1 uppercase tracking-wide">Across {cases.length} active cases</p>
      </div>
      
      <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="relative z-10">
          <h3 className="text-[10px] font-black text-green-700 uppercase tracking-widest flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-green-600" /> Amount Collected
          </h3>
          <p className="text-2xl md:text-3xl font-black text-green-700 mt-2">{formatINR(stats.totalCollected)}</p>
          <p className="text-xs font-bold text-green-700/70 mt-1 uppercase tracking-wide">{((stats.totalCollected / stats.totalImposed) * 100).toFixed(1)}% recovery rate</p>
        </div>
      </div>

      <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="relative z-10">
          <h3 className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" /> Outstanding Arrears
          </h3>
          <p className="text-2xl md:text-3xl font-black text-red-700 mt-2">{formatINR(stats.totalOutstanding)}</p>
          <p className="text-xs font-bold text-red-700/70 mt-1 uppercase tracking-wide">Pending collection/appeals</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-border rounded-2xl p-5 shadow-sm bg-neutral-surface">
        <h3 className="text-[10px] font-black text-neutral-ink/50 uppercase tracking-widest flex items-center gap-2">
          <FileX className="w-4 h-4 text-neutral-ink/40" /> Written Off
        </h3>
        <p className="text-2xl md:text-3xl font-black text-brand-900 mt-2">{formatINR(stats.totalWrittenOff)}</p>
        <p className="text-xs font-bold text-neutral-ink/60 mt-1 uppercase tracking-wide">Unrecoverable / court dismissed</p>
      </div>
    </div>
  );
}
