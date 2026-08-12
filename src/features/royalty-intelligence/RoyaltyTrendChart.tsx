import { useMemo } from "react";
import type { RoyaltyRecord } from "../../types/royalty";
import { BarChart3 } from "lucide-react";
import { formatINR } from "../../utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

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
        return { 
          name: label, 
          Expected: data.expected,
          Paid: data.paid,
          Gap: data.expected - data.paid
        };
      });
  }, [records]);

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white border border-neutral-border rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 sm:px-6 py-4 border-b border-neutral-border bg-neutral-surface flex justify-between items-center shrink-0">
        <h3 className="font-bold text-brand-900 flex items-center gap-2 text-sm">
          <BarChart3 className="w-5 h-5 text-brand-500" /> 12-Month Royalty Collection Trend
        </h3>
      </div>
      
      <div className="flex-1 p-6 bg-white min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => formatINR(value).replace('₹', '')}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 600 }}
              labelStyle={{ color: '#0f172a', fontWeight: 800, marginBottom: '8px' }}
              formatter={(value: number) => formatINR(value)}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 700 }}
              iconType="circle"
            />
            <Bar dataKey="Expected" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="Paid" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
