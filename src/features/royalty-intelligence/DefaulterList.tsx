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
    <div className="bg-white border border-neutral-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-4 sm:px-6 py-4 border-b border-neutral-border bg-neutral-surface flex justify-between items-center shrink-0">
        <h3 className="font-bold text-brand-900 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-red-500" /> High-Risk Defaulters
        </h3>
        <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 shadow-sm px-2.5 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> Action Req
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-white">
        {defaulters.map(d => (
          <div key={d.quarryId} className="p-4 bg-white border border-neutral-border hover:border-red-300 hover:shadow-md transition-all rounded-xl group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <div className="flex justify-between items-start mb-1.5 pl-2">
              <span className="text-sm font-bold text-brand-900">{d.operatorName}</span>
              <span className="text-xs font-black text-red-700">{formatINR(d.totalOutstanding)}</span>
            </div>
            <div className="flex justify-between items-end pl-2">
              <div>
                <p className="text-xs font-bold text-neutral-ink/60">{d.quarryName}</p>
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1">Overdue: {d.daysOverdue}+ days</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-700 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-widest" title="Issue Legal Notice">
                  <MessageSquareWarning className="w-3.5 h-3.5" /> Notice
                </button>
                <Link to={`/royalty-intelligence/${d.quarryId}`} className="flex items-center justify-center p-1.5 bg-white border border-neutral-border hover:border-brand-200 hover:bg-brand-50 rounded-lg text-neutral-ink/40 hover:text-brand-700 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        {defaulters.length === 0 && (
          <div className="text-center text-neutral-ink/50 p-8">
            <AlertCircle className="w-8 h-8 text-neutral-ink/20 mx-auto mb-3" />
            <p className="font-bold text-sm text-brand-900">No major defaulters found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
