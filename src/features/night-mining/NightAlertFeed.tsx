import { Flame, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import type { NightAlert } from "../../types/nightMining";
import { formatTimeAgo } from "../../utils/formatters";

interface Props {
  alerts: NightAlert[];
}

export function NightAlertFeed({ alerts }: Props) {
  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl shadow-sm flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30 rounded-t-xl shrink-0">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" /> Recent Night Detections
        </h3>
        <span className="bg-red-500/10 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/20">
          {alerts.filter(a => a.status === "Active" || a.status === "Escalated").length} Active
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {alerts.map(alert => (
          <div key={alert.id} className="p-4 bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 rounded-lg group transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="mt-0.5 p-2 rounded-lg shrink-0 bg-red-500/10 text-red-400 border border-red-500/20">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{alert.quarryName}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      alert.status === "Escalated" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                      alert.status === "Active" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>{alert.status}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">{alert.detectionType} (AI Conf: {alert.confidenceScore}%)</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimeAgo(alert.detectionTime)}</span>
                  </div>
                </div>
              </div>
              <Link to={`/night-mining/${alert.id}`} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-indigo-500 transition-colors shrink-0">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-center text-slate-500 p-8">No night detections found.</div>
        )}
      </div>
    </div>
  );
}
