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

  if (!alert) return <div className="p-8 text-slate-400">Loading...</div>;

  const ESCALATION_STEPS = [
    { level: "Field Inspector", icon: ShieldAlert },
    { level: "District Collector", icon: ShieldAlert },
    { level: "Department Secretary", icon: ShieldAlert }
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/night-mining" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              Night Infraction: {alert.quarryName}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                alert.status === "Escalated" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                alert.status === "Active" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {alert.status}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Detected on {formatDateTime(alert.detectionTime)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium text-sm border border-slate-700/50">
            <ShieldAlert className="w-4 h-4" /> Alert Police
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm">
            <FileText className="w-4 h-4" /> Generate FIR Draft
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" /> Simulated Thermal Imagery Evidence
              </h3>
              <button className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                <Download className="w-3.5 h-3.5" /> Download Evidence PDF
              </button>
            </div>
            <div className="relative">
              <img src={alert.evidence.imageUrl} alt="Thermal Evidence" className="w-full h-[400px] object-cover" />
              
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur p-3 rounded-lg border border-slate-700 flex justify-between items-center text-xs font-mono text-slate-300">
                <div>
                  <p>LAT: {alert.evidence.location.lat}</p>
                  <p>LNG: {alert.evidence.location.lng}</p>
                </div>
                <div className="text-right text-emerald-400">
                  <p>SHA-256 HASH:</p>
                  <p className="truncate w-48" title={alert.evidence.hash}>{alert.evidence.hash}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" /> Claude AI Analysis
            </h3>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <p className="text-slate-300 text-sm leading-relaxed">
                <span className="font-bold text-slate-200 block mb-2">Confidence Score: {alert.confidenceScore}%</span>
                The thermal satellite imagery captured at {formatDateTime(alert.detectionTime)} strongly indicates anomalous heat signatures consistent with heavy excavation machinery. The activity is located exactly within the registered boundary coordinates of {alert.quarryName}.
                <br/><br/>
                According to the Tamil Nadu Minor Mineral Concession Rules, 1959, all quarrying operations are strictly prohibited after sunset.
                <br/><br/>
                <strong className="text-red-400">Recommended Action:</strong> Immediate dispatch of the local task force to secure the premises and confiscate the operating machinery.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" /> Escalation Tracker
            </h3>
            <div className="relative">
              <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-slate-700"></div>
              <div className="space-y-6">
                {ESCALATION_STEPS.map((step, idx) => {
                  const logEntry = alert.escalationLog.find(log => log.level === step.level);
                  
                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div className="relative z-10 shrink-0">
                        {logEntry ? (
                          logEntry.acknowledged ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center animate-pulse">
                              <ShieldAlert className="w-4 h-4 text-orange-400" />
                            </div>
                          )
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                            <Circle className="w-4 h-4 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="pt-1.5">
                        <p className={`text-sm font-bold ${logEntry ? "text-slate-200" : "text-slate-500"}`}>{step.level}</p>
                        {logEntry && (
                          <div className="mt-1 space-y-1">
                            <p className="text-xs text-slate-400">Alerted: {formatDateTime(logEntry.timestamp)}</p>
                            {logEntry.acknowledged ? (
                              <p className="text-xs text-emerald-400">Acknowledged: {logEntry.acknowledgedBy} at {logEntry.acknowledgedAt && formatDateTime(logEntry.acknowledgedAt)}</p>
                            ) : (
                              <p className="text-xs text-orange-400">Pending acknowledgement</p>
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
  );
}
