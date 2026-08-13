import { useMemo } from "react";
import type { RoyaltyRecord } from "../../types/royalty";
import { formatINR } from "../../utils/formatters";
import { IndianRupee, TrendingUp, AlertTriangle } from "lucide-react";

export function RoyaltyDashboard({ records }: { records: RoyaltyRecord[] }) {
  const stats = useMemo(() => {
    const currentMonth = records[0]?.month;
    const thisMonthRecords = records.filter(r => r.month === currentMonth);

    let expected = 0;
    let collected = 0;
    let outstanding = 0;

    let ytdExpected = 0;
    let ytdCollected = 0;

    thisMonthRecords.forEach(r => {
      expected += r.expectedRoyalty;
      collected += r.paidRoyalty;
      if (r.status !== "Paid") outstanding += (r.expectedRoyalty - r.paidRoyalty);
    });

    records.forEach(r => {
      ytdExpected += r.expectedRoyalty;
      ytdCollected += r.paidRoyalty;
    });

    return { expected, collected, outstanding, ytdExpected, ytdCollected };
  }, [records]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-neutral-border rounded-2xl p-4 shadow-sm overflow-hidden flex flex-col justify-center">
        <h3 className="text-[10px] font-black text-neutral-ink/50 uppercase tracking-widest flex items-center gap-1.5 truncate">
          <TrendingUp className="w-3.5 h-3.5 text-brand-500 shrink-0" /> Expected (This Month)
        </h3>
        <p className="text-xl font-black text-brand-900 mt-2 truncate" title={formatINR(stats.expected)}>{formatINR(stats.expected)}</p>
        <p className="text-[10px] font-bold text-neutral-ink/60 mt-1 uppercase tracking-wide truncate">Based on AI estimates</p>
      </div>

      <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="relative z-10 w-full">
          <h3 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5 truncate">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Collected (This Month)
          </h3>
          <p className="text-xl font-black text-emerald-700 mt-2 truncate" title={formatINR(stats.collected)}>{formatINR(stats.collected)}</p>
          <p className="text-[10px] font-bold text-emerald-700/70 mt-1 uppercase tracking-wide truncate">{((stats.collected / stats.expected) * 100).toFixed(1)}% recovery rate</p>
        </div>
      </div>

      <div className="bg-white border border-red-200 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="relative z-10 w-full">
          <h3 className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-1.5 truncate">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" /> Gap / Outstanding
          </h3>
          <p className="text-xl font-black text-red-700 mt-2 truncate" title={formatINR(stats.outstanding)}>{formatINR(stats.outstanding)}</p>
          <p className="text-[10px] font-bold text-red-700/70 mt-1 uppercase tracking-wide truncate">Deficit against AI estimate</p>
        </div>
      </div>

      <div className="bg-brand-900 border border-brand-800 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-center">
        <div className="absolute right-0 top-0 w-20 h-20 bg-brand-800 rounded-bl-full" />
        <div className="relative z-10 w-full">
          <h3 className="text-[10px] font-black text-brand-300 uppercase tracking-widest flex items-center gap-1.5 truncate">
            <TrendingUp className="w-3.5 h-3.5 text-brand-400 shrink-0" /> YTD Collection
          </h3>
          <p className="text-xl font-black text-white mt-2 truncate" title={formatINR(stats.ytdCollected)}>{formatINR(stats.ytdCollected)}</p>
          <p className="text-[10px] font-bold text-brand-300/80 mt-1 uppercase tracking-wide truncate">Target: {formatINR(stats.ytdExpected)}</p>
        </div>
      </div>
    </div>
  );
}
