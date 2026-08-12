import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { Quarry } from "../../types/quarry";
import { calculateSeverity, calculateRevenueLoss, m3ToTonnes } from "../../utils/anomalyUtils";
import { formatINR } from "../../utils/formatters";
import { AlertTriangle, ChevronRight } from "lucide-react";

interface Props {
  quarries: Quarry[];
}

export function AnomalyList({ quarries }: Props) {
  const anomalies = useMemo(() => {
    return quarries
      .map((q) => {
        const gapM3 = Math.max(0, q.aiEstimatedExtractionVolumeM3Monthly - q.declaredExtractionVolumeM3Monthly);
        const gapTonnes = m3ToTonnes(gapM3, q.mineralType);
        const severity = calculateSeverity(q.declaredExtractionVolumeM3Monthly, q.aiEstimatedExtractionVolumeM3Monthly);
        const revenueLoss = calculateRevenueLoss(gapM3, q.mineralType);

        return { ...q, gapTonnes, severity, revenueLoss };
      })
      .filter((q) => q.severity !== "None")
      .sort((a, b) => {
        const order = { High: 0, Medium: 1, Low: 2, None: 3 };
        if (order[a.severity] !== order[b.severity]) {
          return order[a.severity] - order[b.severity];
        }
        return b.revenueLoss - a.revenueLoss;
      });
  }, [quarries]);

  if (anomalies.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-slate-200 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">No anomalies detected.</p>
        <p className="text-slate-500 text-sm mt-1">All quarries are operating within expected limits.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-brand-900">Flagged Quarries</h2>
        <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-200 uppercase tracking-wide">
          {anomalies.length} Violations
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="text-xs text-slate-500 bg-slate-50 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Quarry Details</th>
              <th className="px-6 py-4 font-medium">Declared Vol (m³)</th>
              <th className="px-6 py-4 font-medium">AI Estimated (m³)</th>
              <th className="px-6 py-4 font-medium">Gap (Tonnes)</th>
              <th className="px-6 py-4 font-medium">Revenue Loss</th>
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {anomalies.map((anomaly) => (
              <tr key={anomaly.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-brand-900">{anomaly.name}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-wide">{anomaly.district} • {anomaly.mineralType}</div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-600">{anomaly.declaredExtractionVolumeM3Monthly.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-orange-600">{anomaly.aiEstimatedExtractionVolumeM3Monthly.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-red-600">{Math.round(anomaly.gapTonnes).toLocaleString()} t</td>
                <td className="px-6 py-4 text-slate-700 font-bold">{formatINR(anomaly.revenueLoss)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    anomaly.severity === "High" ? "bg-red-50 text-red-700 border border-red-200" :
                    anomaly.severity === "Medium" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                    "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    {anomaly.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/anomaly-detection/${anomaly.id}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-brand-900 hover:text-white transition-all group-hover:scale-105"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
