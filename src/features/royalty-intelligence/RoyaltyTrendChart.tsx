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
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" /> 12-Month Royalty Collection Trend
        </h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-600"></div> AI Expected</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> Actually Paid</div>
        </div>
      </div>
      
      <div className="flex-1 flex items-end gap-2 mt-4 relative pt-10">
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-slate-500 pb-8">
          <span>{formatINR(maxVal).replace('₹', '')}</span>
          <span>{formatINR(maxVal/2).replace('₹', '')}</span>
          <span>0</span>
        </div>
        
        <div className="ml-14 flex-1 flex items-end justify-between h-full border-b border-slate-700/50 pb-2 relative">
          <div className="absolute left-0 right-0 top-0 border-t border-slate-700/30"></div>
          <div className="absolute left-0 right-0 top-1/2 border-t border-slate-700/30"></div>
          
          {chartData.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 relative group h-full justify-end">
              <div className="w-full max-w-[40px] flex items-end gap-0.5 justify-center h-full relative z-10">
                <div 
                  className="w-1/2 bg-slate-600 rounded-t opacity-50 group-hover:opacity-80 transition-opacity"
                  style={{ height: `${(d.expected / maxVal) * 100}%` }}
                ></div>
                <div 
                  className="w-1/2 bg-emerald-500 rounded-t shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:brightness-110 transition-all"
                  style={{ height: `${(d.paid / maxVal) * 100}%` }}
                ></div>
              </div>
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-slate-700 p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none w-max min-w-[150px]">
                <p className="text-xs font-bold text-slate-300 mb-1 border-b border-slate-700 pb-1">{d.label}</p>
                <div className="flex justify-between text-[10px]"><span className="text-slate-400">Expected:</span> <span className="text-slate-200">{formatINR(d.expected)}</span></div>
                <div className="flex justify-between text-[10px]"><span className="text-emerald-400">Paid:</span> <span className="text-emerald-300 font-bold">{formatINR(d.paid)}</span></div>
                <div className="flex justify-between text-[10px] mt-1 pt-1 border-t border-slate-700"><span className="text-orange-400">Gap:</span> <span className="text-orange-400 font-bold">{formatINR(d.expected - d.paid)}</span></div>
              </div>

              <span className="text-[10px] text-slate-400 mt-2 block">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
