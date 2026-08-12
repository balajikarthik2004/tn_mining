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
      <div className="bg-white border border-neutral-border rounded-2xl p-4 shadow-sm overflow-hidden flex flex-col justify-center">
        <h3 className="text-[10px] font-black text-neutral-ink/50 uppercase tracking-widest flex items-center gap-1.5 truncate">
          <TrendingUp className="w-3.5 h-3.5 text-brand-500 shrink-0" /> Total Penalties Imposed
        </h3>
        <p className="text-xl font-black text-brand-900 mt-2 truncate" title={formatINR(stats.totalImposed)}>{formatINR(stats.totalImposed)}</p>
        <p className="text-[10px] font-bold text-neutral-ink/60 mt-1 uppercase tracking-wide truncate">Across {cases.length} active cases</p>
      </div>
      
      <div className="bg-white border border-green-200 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="relative z-10 w-full">
          <h3 className="text-[10px] font-black text-green-700 uppercase tracking-widest flex items-center gap-1.5 truncate">
            <IndianRupee className="w-3.5 h-3.5 text-green-600 shrink-0" /> Amount Collected
          </h3>
          <p className="text-xl font-black text-green-700 mt-2 truncate" title={formatINR(stats.totalCollected)}>{formatINR(stats.totalCollected)}</p>
          <p className="text-[10px] font-bold text-green-700/70 mt-1 uppercase tracking-wide truncate">{((stats.totalCollected / stats.totalImposed) * 100).toFixed(1)}% recovery rate</p>
        </div>
      </div>

      <div className="bg-white border border-red-200 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="relative z-10 w-full">
          <h3 className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-1.5 truncate">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /> Outstanding Arrears
          </h3>
          <p className="text-xl font-black text-red-700 mt-2 truncate" title={formatINR(stats.totalOutstanding)}>{formatINR(stats.totalOutstanding)}</p>
          <p className="text-[10px] font-bold text-red-700/70 mt-1 uppercase tracking-wide truncate">Pending collection/appeals</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-border rounded-2xl p-4 shadow-sm bg-neutral-surface overflow-hidden flex flex-col justify-center">
        <h3 className="text-[10px] font-black text-neutral-ink/50 uppercase tracking-widest flex items-center gap-1.5 truncate">
          <FileX className="w-3.5 h-3.5 text-neutral-ink/40 shrink-0" /> Written Off
        </h3>
        <p className="text-xl font-black text-brand-900 mt-2 truncate" title={formatINR(stats.totalWrittenOff)}>{formatINR(stats.totalWrittenOff)}</p>
        <p className="text-[10px] font-bold text-neutral-ink/60 mt-1 uppercase tracking-wide truncate">Unrecoverable / court dismissed</p>
      </div>
    </div>
  );
}
