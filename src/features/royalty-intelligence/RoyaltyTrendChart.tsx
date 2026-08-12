import { useMemo } from "react";
import type { RoyaltyRecord } from "../../types/royalty";
import { BarChart3 } from "lucide-react";
import { formatINR } from "../../utils/formatters";

export function RoyaltyTrendChart({ records }: { records: RoyaltyRecord[] }) {
  const chartData = useMemo(() => {
    const dataByMonth: Record<string, { expected: number, declared: number, paid: number }> = {};
    
    records.forEach(r => {
      if (!dataByMonth[r.month]) {
        dataByMonth[r.month] = { expected: 0, declared: 0, paid: 0 };
      }
      dataByMonth[r.month].expected += r.expectedRoyalty;
      dataByMonth[r.month].declared += r.declaredRoyalty;
      dataByMonth[r.month].paid += r.paidRoyalty;
    });

    return Object.entries(dataByMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => {
        const date = new Date(`${month}-01`);
        const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        return { label, ...data };
      });
  }, [records]);

  if (chartData.length === 0) return null;
  const maxVal = Math.max(...chartData.map(d => d.expected));

  return (
    <div className="bg-white border border-neutral-border rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 sm:px-6 py-4 border-b border-neutral-border bg-neutral-surface flex justify-between items-center shrink-0">
        <h3 className="font-bold text-brand-900 flex items-center gap-2 text-sm">
          <BarChart3 className="w-5 h-5 text-brand-500" /> 12-Month Royalty Collection Trend
        </h3>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-neutral-ink/60">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-neutral-ink/20"></div> AI Expected</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-brand-500"></div> Actually Paid</div>
        </div>
      </div>
      
      <div className="flex-1 flex items-end gap-2 p-6 relative pt-10 bg-white">
        <div className="absolute left-6 top-10 bottom-14 w-12 flex flex-col justify-between text-[10px] font-bold text-neutral-ink/40">
          <span>{formatINR(maxVal).replace('₹', '')}</span>
          <span>{formatINR(maxVal/2).replace('₹', '')}</span>
          <span>0</span>
        </div>
        
        <div className="ml-14 flex-1 flex items-end justify-between h-full border-b border-neutral-border pb-2 relative">
          <div className="absolute left-0 right-0 top-0 border-t border-neutral-border border-dashed opacity-50"></div>
          <div className="absolute left-0 right-0 top-1/2 border-t border-neutral-border border-dashed opacity-50"></div>
          
          {chartData.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 relative group h-full justify-end">
              <div className="w-full max-w-[40px] flex items-end gap-0.5 justify-center h-full relative z-10">
                <div 
                  className="w-1/2 bg-neutral-ink/10 rounded-t group-hover:bg-neutral-ink/20 transition-colors"
                  style={{ height: `${(d.expected / maxVal) * 100}%` }}
                ></div>
                <div 
                  className="w-1/2 bg-brand-500 rounded-t shadow-sm group-hover:bg-brand-600 transition-colors"
                  style={{ height: `${(d.paid / maxVal) * 100}%` }}
                ></div>
              </div>
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-brand-900 border border-brand-800 p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none w-max min-w-[150px]">
                <p className="text-xs font-bold text-white mb-2 border-b border-brand-800 pb-2 uppercase tracking-wide">{d.label}</p>
                <div className="flex justify-between text-[10px] mb-1"><span className="text-brand-200">Expected:</span> <span className="text-white font-bold">{formatINR(d.expected)}</span></div>
                <div className="flex justify-between text-[10px] mb-1"><span className="text-brand-200">Paid:</span> <span className="text-white font-bold">{formatINR(d.paid)}</span></div>
                <div className="flex justify-between text-[10px] mt-2 pt-2 border-t border-brand-800"><span className="text-red-400">Gap:</span> <span className="text-red-400 font-bold">{formatINR(d.expected - d.paid)}</span></div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-ink/40 mt-2 block">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
