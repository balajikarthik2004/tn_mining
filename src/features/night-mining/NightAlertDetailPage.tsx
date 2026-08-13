import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Flame, Download, ShieldAlert, Zap, FileText, CheckCircle2, Circle } from "lucide-react";
import { getMockNightAlerts } from "../../data/mock/nightMiningData";
import type { NightAlert } from "../../types/nightMining";
import { formatDateTime } from "../../utils/formatters";

export function NightAlertDetailPage() {
  const { id } = useParams();
  const [alert, setAlert] = useState<NightAlert | null>(null);

  useEffect(() => {
    const alerts = getMockNightAlerts();
    setAlert(alerts.find(a => a.id === id) || null);
  }, [id]);

  if (!alert) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-900"></div>
      </div>
    );
  }

  const ESCALATION_STEPS = [
    { level: "Field Inspector", icon: ShieldAlert },
    { level: "District Collector", icon: ShieldAlert },
    { level: "Department Secretary", icon: ShieldAlert }
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-neutral-border px-4 py-3 sm:px-6 sm:py-4 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 z-10 relative">
        <div className="flex items-start gap-4">
          <Link to="/night-mining" className="mt-1 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-neutral-border hover:bg-neutral-50 text-neutral-ink/70 transition-colors shadow-sm shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-brand-900 tracking-tight">
                Night Infraction Report
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                alert.status === "Escalated" ? "bg-purple-50 text-purple-700 border-purple-200" :
                alert.status === "Active" ? "bg-red-50 text-red-700 border-red-200" :
                "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}>
                {alert.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-neutral-ink/70">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-ink/50 uppercase tracking-widest text-[10px]">Quarry:</span> 
                <span className="text-brand-900 font-bold">{alert.quarryName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-ink/50 uppercase tracking-widest text-[10px]">Detected:</span> 
                <span className="text-brand-900 font-bold">{formatDateTime(alert.detectionTime)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-red-50 border border-neutral-border hover:border-red-200 text-red-700 rounded-lg transition-colors font-bold text-sm shadow-sm group">
            <ShieldAlert className="w-4 h-4 text-red-500 group-hover:animate-pulse" /> Dispatch Police
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg transition-colors font-bold text-sm shadow-sm">
            <FileText className="w-4 h-4" /> Issue FIR
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex justify-between items-center">
                <h3 className="font-bold text-brand-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-brand-500" /> Thermal Satellite Evidence (Simulated)
                </h3>
                <button className="text-xs font-bold uppercase tracking-widest text-brand-500 hover:text-brand-700 flex items-center gap-1 transition-colors">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
              <div className="relative">
                <img src={alert.evidence.imageUrl} alt="Thermal Evidence" className="w-full h-[400px] object-cover grayscale opacity-90 contrast-125" />
                {/* Simulated thermal overlay effect */}
                <div className="absolute inset-0 bg-red-500/10 mix-blend-multiply pointer-events-none"></div>
                
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-neutral-border flex flex-wrap justify-between items-center text-xs font-mono text-brand-900 shadow-lg">
                  <div>
                    <p className="font-black">LAT: {alert.evidence.location.lat}</p>
                    <p className="font-black">LNG: {alert.evidence.location.lng}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-ink/50 uppercase tracking-widest text-[9px] mb-1">Evidentiary SHA-256 Hash</p>
                    <p className="font-bold text-brand-500 truncate w-48 sm:w-64" title={alert.evidence.hash}>{alert.evidence.hash}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex items-center gap-2">
                 <Zap className="w-5 h-5 text-brand-500" />
                 <h3 className="font-bold text-brand-900">AI Analysis & Legal Context</h3>
              </div>
              <div className="p-6">
                <div className="p-5 bg-neutral-surface rounded-xl border border-neutral-border relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                  <div className="mb-4">
                    <span className="inline-block bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                      Confidence Score: {alert.confidenceScore}%
                    </span>
                  </div>
                  <p className="text-brand-900 text-sm font-medium leading-relaxed">
                    The thermal satellite imagery captured at <strong className="font-black">{formatDateTime(alert.detectionTime)}</strong> strongly indicates anomalous heat signatures consistent with heavy excavation machinery. The activity is located exactly within the registered boundary coordinates of <strong className="font-black">{alert.quarryName}</strong>.
                    <br/><br/>
                    According to the Tamil Nadu Minor Mineral Concession Rules, 1959, all quarrying operations are strictly prohibited after sunset.
                  </p>
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                     <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                     <div>
                       <strong className="text-red-800 text-sm font-black uppercase tracking-wide block mb-1">Recommended Action</strong>
                       <p className="text-red-700/80 text-sm font-medium">Immediate dispatch of the local task force to secure the premises, halt operations, and confiscate the operating machinery.</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border">
                <h3 className="font-bold text-brand-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-brand-500" /> Escalation Tracker
                </h3>
              </div>
              <div className="p-6">
                <div className="relative">
                  <div className="absolute top-4 bottom-4 left-[15px] w-0.5 bg-neutral-border"></div>
                  <div className="space-y-8">
                    {ESCALATION_STEPS.map((step, idx) => {
                      const logEntry = alert.escalationLog.find(log => log.level === step.level);
                      
                      return (
                        <div key={idx} className="relative flex items-start gap-5">
                          <div className="relative z-10 shrink-0 bg-white py-1">
                            {logEntry ? (
                              logEntry.acknowledged ? (
                                <div className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center shadow-sm">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-500 flex items-center justify-center animate-pulse shadow-sm">
                                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                                </div>
                              )
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-neutral-surface border-2 border-neutral-border flex items-center justify-center">
                                <Circle className="w-4 h-4 text-neutral-ink/30" />
                              </div>
                            )}
                          </div>
                          <div className="pt-1.5 flex-1">
                            <p className={`text-sm font-black ${logEntry ? "text-brand-900" : "text-neutral-ink/40"}`}>{step.level}</p>
                            {logEntry && (
                              <div className="mt-2 space-y-1.5 p-3 rounded-lg border border-neutral-border bg-neutral-surface">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-ink/50">Alerted: {formatDateTime(logEntry.timestamp)}</p>
                                {logEntry.acknowledged ? (
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Ack'd by: {logEntry.acknowledgedBy} at {logEntry.acknowledgedAt && formatDateTime(logEntry.acknowledgedAt)}</p>
                                ) : (
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 animate-pulse">Pending acknowledgement</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
