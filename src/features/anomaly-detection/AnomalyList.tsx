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
      <div className="bg-slate-800/80 backdrop-blur rounded-xl p-8 text-center border border-slate-700/50 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
        <p className="text-slate-400 font-medium">No anomalies detected.</p>
        <p className="text-slate-500 text-sm mt-1">All quarries are operating within expected limits.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-700/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-100">Flagged Quarries</h2>
        <span className="bg-red-500/10 text-red-500 text-xs font-medium px-2.5 py-1 rounded-full border border-red-500/20">
          {anomalies.length} Violations
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-400 bg-slate-900/50 uppercase">
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
          <tbody className="divide-y divide-slate-700/50">
            {anomalies.map((anomaly) => (
              <tr key={anomaly.id} className="hover:bg-slate-700/40 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-200">{anomaly.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{anomaly.district} • {anomaly.mineralType}</div>
                </td>
                <td className="px-6 py-4 text-slate-400">{anomaly.declaredExtractionVolumeM3Monthly.toLocaleString()}</td>
                <td className="px-6 py-4 font-medium text-orange-400">{anomaly.aiEstimatedExtractionVolumeM3Monthly.toLocaleString()}</td>
                <td className="px-6 py-4 font-semibold text-red-400">{Math.round(anomaly.gapTonnes).toLocaleString()} t</td>
                <td className="px-6 py-4 text-slate-200 font-medium">{formatINR(anomaly.revenueLoss)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    anomaly.severity === "High" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                    anomaly.severity === "Medium" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                    "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {anomaly.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/anomaly-detection/${anomaly.id}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-indigo-500 hover:text-white transition-all group-hover:scale-110"
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
