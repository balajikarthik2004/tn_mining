import { Flame, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import type { NightAlert } from "../../types/nightMining";
import { formatTimeAgo } from "../../utils/formatters";

interface Props {
  alerts: NightAlert[];
}

export function NightAlertFeed({ alerts }: Props) {
  return (
    <div className="bg-white border border-neutral-border rounded-2xl shadow-sm flex flex-col h-full">
      <div className="p-3 sm:px-4 border-b border-neutral-border flex justify-between items-center bg-neutral-surface rounded-t-2xl shrink-0">
        <h3 className="font-bold text-sm text-brand-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" /> Recent Night Detections
        </h3>
        <span className="bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-200 shadow-sm">
          {alerts.filter(a => a.status === "Active" || a.status === "Escalated").length} Active
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar">
        {alerts.map(alert => (
          <div key={alert.id} className="p-3 bg-white border border-neutral-border hover:border-brand-300 hover:shadow-md rounded-xl group transition-all cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="mt-0.5 p-2 rounded-lg shrink-0 bg-red-50 text-red-600 border border-red-100 group-hover:bg-red-100 transition-colors">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-brand-900">{alert.quarryName}</span>
                    <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${
                      alert.status === "Escalated" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      alert.status === "Active" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-green-50 text-green-700 border-green-200"
                    }`}>{alert.status}</span>
                  </div>
                  <p className="text-xs font-bold text-neutral-ink/60 mt-1.5 uppercase tracking-wide">
                    {alert.detectionType} <span className="text-brand-500">• AI Conf: {alert.confidenceScore}%</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-neutral-ink/40 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Detected {formatTimeAgo(alert.detectionTime)}</span>
                  </div>
                </div>
              </div>
              <Link 
                to={`/night-mining/${alert.id}`} 
                className="p-2 rounded-lg bg-neutral-surface text-neutral-ink/40 hover:text-brand-700 hover:bg-brand-50 border border-neutral-border hover:border-brand-200 transition-colors shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-center text-neutral-ink/50 p-8">
             <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-20" />
             <p className="font-bold text-sm">No night detections found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
