import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Quarry } from "../../types/quarry";
import { calculateRevenueLoss } from "../../utils/anomalyUtils";
import { formatINR } from "../../utils/formatters";

interface Props {
  quarries: Quarry[];
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#06b6d4", "#3b82f6"];

export function RevenueGapDashboard({ quarries }: Props) {
  const data = useMemo(() => {
    let totalDeclaredRevenue = 0;
    let totalPotentialRevenue = 0;
    const districtGap: Record<string, number> = {};
    const mineralGap: Record<string, number> = {};

    quarries.forEach((q) => {
      const gapM3 = Math.max(0, q.aiEstimatedExtractionVolumeM3Monthly - q.declaredExtractionVolumeM3Monthly);
      const revenueLoss = calculateRevenueLoss(gapM3, q.mineralType);
      
      const declaredRevenue = calculateRevenueLoss(q.declaredExtractionVolumeM3Monthly, q.mineralType);
      const potentialRevenue = calculateRevenueLoss(q.aiEstimatedExtractionVolumeM3Monthly, q.mineralType);

      totalDeclaredRevenue += declaredRevenue;
      totalPotentialRevenue += Math.max(declaredRevenue, potentialRevenue);

      if (revenueLoss > 0) {
        districtGap[q.district] = (districtGap[q.district] || 0) + revenueLoss;
        mineralGap[q.mineralType] = (mineralGap[q.mineralType] || 0) + revenueLoss;
      }
    });

    const totalGap = totalPotentialRevenue - totalDeclaredRevenue;
    
    const districtChartData = Object.entries(districtGap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const mineralChartData = Object.entries(mineralGap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const projectedAnnualRecovery = totalGap * 12;

    return { totalGap, totalDeclaredRevenue, totalPotentialRevenue, districtChartData, mineralChartData, projectedAnnualRecovery };
  }, [quarries]);

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue Gap</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{formatINR(data.totalGap)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Potential Revenue</h3>
          <p className="text-3xl font-bold text-brand-900 mt-2">{formatINR(data.totalPotentialRevenue)}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Declared: {formatINR(data.totalDeclaredRevenue)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projected Annual Recovery</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{formatINR(data.projectedAnnualRecovery)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-[340px] flex flex-col">
          <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Top 5 Districts by Leakage</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.districtChartData} layout="vertical" margin={{ left: 40, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#475569" width={80} fontSize={12} fontWeight={600} />
                <Tooltip 
                  formatter={(value: any) => [formatINR(value as number), "Revenue Loss"]} 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9', opacity: 0.8 }}
                />
                <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-[340px] flex flex-col">
          <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Mineral-wise Leakage</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.mineralChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.mineralChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatINR(value as number), "Revenue Loss"]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#475569', fontWeight: 500 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
