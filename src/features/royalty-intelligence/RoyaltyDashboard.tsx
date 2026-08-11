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
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" /> Expected (This Month)
        </h3>
        <p className="text-2xl font-bold text-slate-100 mt-2">{formatINR(stats.expected)}</p>
        <p className="text-sm text-slate-400 mt-1">Based on AI estimates</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-400" /> Collected (This Month)
        </h3>
        <p className="text-2xl font-bold text-emerald-500 mt-2">{formatINR(stats.collected)}</p>
        <p className="text-sm text-emerald-400/70 mt-1">{((stats.collected / stats.expected) * 100).toFixed(1)}% recovery</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-orange-500/30 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-medium text-orange-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" /> Gap / Outstanding
        </h3>
        <p className="text-2xl font-bold text-orange-500 mt-2">{formatINR(stats.outstanding)}</p>
        <p className="text-sm text-orange-400/70 mt-1">Deficit against AI estimate</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full" />
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" /> YTD Collection
        </h3>
        <p className="text-2xl font-bold text-indigo-300 mt-2">{formatINR(stats.ytdCollected)}</p>
        <p className="text-sm text-slate-500 mt-1">Target: {formatINR(stats.ytdExpected)}</p>
      </div>
    </div>
  );
}
