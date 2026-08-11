import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { RoyaltyRecord, Defaulter } from "../../types/royalty";
import { formatINR } from "../../utils/formatters";
import { AlertCircle, ChevronRight, MessageSquareWarning } from "lucide-react";

export function DefaulterList({ records }: { records: RoyaltyRecord[] }) {
  const defaulters = useMemo(() => {
    const map = new Map<string, Defaulter>();
    
    records.forEach(r => {
      if (r.status !== "Paid") {
        const gap = r.expectedRoyalty - r.paidRoyalty;
        if (gap > 0) {
          const existing = map.get(r.quarryId);
          if (existing) {
            existing.totalOutstanding += gap;
            existing.daysOverdue = Math.max(existing.daysOverdue, 30);
          } else {
            map.set(r.quarryId, {
              quarryId: r.quarryId,
              quarryName: r.quarryName,
              operatorName: r.operatorName,
              district: r.district,
              totalOutstanding: gap,
              daysOverdue: r.status === "Overdue" ? 60 : 15
            });
          }
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalOutstanding - a.totalOutstanding).slice(0, 15);
  }, [records]);

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-700/50 bg-slate-900/30 flex justify-between items-center">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" /> Top Defaulters
        </h3>
        <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          Action Req
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {defaulters.map(d => (
          <div key={d.quarryId} className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg group">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-bold text-slate-200">{d.operatorName}</span>
              <span className="text-xs font-bold text-red-400">{formatINR(d.totalOutstanding)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400">{d.quarryName}</p>
                <p className="text-[10px] text-orange-400 mt-0.5">{d.daysOverdue}+ days overdue</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300" title="Send Legal Notice">
                  <MessageSquareWarning className="w-3.5 h-3.5" />
                </button>
                <Link to={`/royalty-intelligence/${d.quarryId}`} className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-white">
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
