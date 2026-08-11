import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Zap, FileText, TrendingDown, AlertTriangle, Calendar, BellRing } from "lucide-react";
import { getMockRoyaltyData } from "../../data/mock/royaltyData";
import type { RoyaltyRecord } from "../../types/royalty";
import { formatINR, formatDate } from "../../utils/formatters";

export function QuarryRoyaltyDetailPage() {
  const { id } = useParams();
  const [records, setRecords] = useState<RoyaltyRecord[]>([]);

  useEffect(() => {
    const data = getMockRoyaltyData();
    setRecords(data.filter(r => r.quarryId === id).sort((a,b) => b.month.localeCompare(a.month)));
  }, [id]);

  const latestRecord = records[0];

  if (!latestRecord) return <div className="p-8 text-slate-400">Loading quarry data...</div>;

  const totalGap = records.reduce((acc, r) => acc + (r.expectedRoyalty - r.paidRoyalty > 0 ? r.expectedRoyalty - r.paidRoyalty : 0), 0);
  const totalReminders = records.reduce((acc, r) => acc + r.remindersSent, 0);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/royalty-intelligence" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              {latestRecord.quarryName}
              {totalGap > 0 ? (
                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                   <AlertTriangle className="w-3.5 h-3.5" /> Defaulter
                 </span>
              ) : (
                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                   Compliant
                 </span>
              )}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {latestRecord.operatorName} • {latestRecord.district} • {latestRecord.mineralType}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium text-sm border border-slate-700/50">
            <BellRing className="w-4 h-4" /> Send Legal Notice
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm">
            <FileText className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" /> 3-Way Gap Analysis (Last 12 Months)
            </h3>
            
            <div className="space-y-4">
              {records.map(r => {
                return (
                  <div key={r.month} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-slate-200">{new Date(r.month + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                         r.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                         r.status === "Overdue" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                         "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      }`}>{r.status}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>AI Estimated ({r.aiEstimatedExtractionTonnes.toLocaleString()}t)</span>
                          <span>{formatINR(r.expectedRoyalty)}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div className="bg-indigo-400 h-1.5 rounded-full w-full"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Operator Declared ({r.declaredExtractionTonnes.toLocaleString()}t)</span>
                          <span>{formatINR(r.declaredRoyalty)}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: `${(r.declaredExtractionTonnes / r.aiEstimatedExtractionTonnes) * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className={r.paidRoyalty >= r.expectedRoyalty ? "text-emerald-400" : "text-orange-400"}>Actually Paid</span>
                          <span className={r.paidRoyalty >= r.expectedRoyalty ? "text-emerald-400" : "text-orange-400"}>{formatINR(r.paidRoyalty)}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${r.paidRoyalty >= r.expectedRoyalty ? "bg-emerald-500" : "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"}`} style={{ width: `${Math.min((r.paidRoyalty / r.expectedRoyalty) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-orange-400" /> Outstanding Summary
            </h3>
            <div className="text-center p-6 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Total Outstanding</p>
              <p className="text-4xl font-bold text-orange-500">{formatINR(totalGap)}</p>
              {totalGap > 0 && <p className="text-xs text-orange-400 mt-2">Triggered {totalReminders} automated reminders.</p>}
            </div>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" /> Payment History
            </h3>
            {records.some(r => r.payments.length > 0) ? (
              <div className="space-y-3">
                {records.flatMap(r => r.payments).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                  <div key={p.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-emerald-400">{formatINR(p.amount)}</span>
                      <span className="text-xs text-slate-500">{formatDate(p.date)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>{p.id}</span>
                      <span>{p.method}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-sm text-slate-500">No payments recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
