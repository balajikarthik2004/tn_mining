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

  if (!latestRecord) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-900"></div>
      </div>
    );
  }

  const totalGap = records.reduce((acc, r) => acc + (r.expectedRoyalty - r.paidRoyalty > 0 ? r.expectedRoyalty - r.paidRoyalty : 0), 0);
  const totalReminders = records.reduce((acc, r) => acc + r.remindersSent, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-neutral-border px-4 py-3 sm:px-6 sm:py-4 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 z-10 relative">
        <div className="flex items-start gap-4">
          <Link to="/royalty-intelligence" className="mt-1 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-neutral-border hover:bg-neutral-50 text-neutral-ink/70 transition-colors shadow-sm shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-brand-900 tracking-tight">
                Financial Audit Dossier: {latestRecord.quarryName}
              </h1>
              {totalGap > 0 ? (
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 shadow-sm">
                   <AlertTriangle className="w-3.5 h-3.5" /> Defaulter
                 </span>
              ) : (
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                   Compliant
                 </span>
              )}
            </div>
            <p className="text-neutral-ink/60 text-sm mt-1.5 font-bold uppercase tracking-wide">
              {latestRecord.operatorName} • {latestRecord.district} • {latestRecord.mineralType}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 text-brand-900 border border-neutral-border rounded-lg transition-colors font-bold text-sm shadow-sm">
            <BellRing className="w-4 h-4" /> Send Notice
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg transition-colors font-bold text-sm shadow-sm">
            <FileText className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex items-center gap-2">
                 <Zap className="w-5 h-5 text-brand-500" />
                 <h3 className="font-bold text-brand-900">AI 3-Way Gap Analysis (Last 12 Months)</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {records.map(r => {
                  return (
                    <div key={r.month} className="p-5 bg-white border border-neutral-border rounded-xl shadow-sm">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-border border-dashed">
                        <span className="font-black text-brand-900 uppercase tracking-widest">{new Date(r.month + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                           r.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                           r.status === "Overdue" ? "bg-red-50 text-red-700 border-red-200" :
                           "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>{r.status}</span>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-ink/50 mb-2">
                            <span>AI Estimated Extraction ({r.aiEstimatedExtractionTonnes.toLocaleString()}t)</span>
                            <span className="text-brand-900">{formatINR(r.expectedRoyalty)}</span>
                          </div>
                          <div className="w-full bg-neutral-surface rounded-full h-2 border border-neutral-border">
                            <div className="bg-brand-500 h-2 rounded-full w-full"></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-ink/50 mb-2">
                            <span>Operator Declared ({r.declaredExtractionTonnes.toLocaleString()}t)</span>
                            <span className="text-brand-900">{formatINR(r.declaredRoyalty)}</span>
                          </div>
                          <div className="w-full bg-neutral-surface rounded-full h-2 border border-neutral-border">
                            <div className="bg-neutral-ink/30 h-2 rounded-full" style={{ width: `${(r.declaredExtractionTonnes / r.aiEstimatedExtractionTonnes) * 100}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                            <span className={r.paidRoyalty >= r.expectedRoyalty ? "text-emerald-700" : "text-amber-600"}>Actually Paid</span>
                            <span className={r.paidRoyalty >= r.expectedRoyalty ? "text-emerald-700" : "text-amber-600"}>{formatINR(r.paidRoyalty)}</span>
                          </div>
                          <div className="w-full bg-neutral-surface rounded-full h-2 border border-neutral-border">
                            <div className={`h-2 rounded-full ${r.paidRoyalty >= r.expectedRoyalty ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Math.min((r.paidRoyalty / r.expectedRoyalty) * 100, 100)}%` }}></div>
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
            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-brand-900">Outstanding Summary</h3>
              </div>
              <div className="p-6">
                <div className="text-center p-6 bg-red-50 border border-red-200 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
                  <p className="text-red-700/80 text-[10px] font-bold uppercase tracking-widest mb-2 relative z-10">Total Outstanding Gap</p>
                  <p className="text-4xl font-black text-red-700 relative z-10">{formatINR(totalGap)}</p>
                  {totalGap > 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-red-700/60 mt-3 relative z-10">Triggered {totalReminders} automated reminders</p>}
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-brand-900">Payment History</h3>
              </div>
              <div className="p-6">
                {records.some(r => r.payments.length > 0) ? (
                  <div className="space-y-4">
                    {records.flatMap(r => r.payments).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                      <div key={p.id} className="p-4 bg-white border border-neutral-border rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-black text-brand-900">{formatINR(p.amount)}</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-ink/40">{formatDate(p.date)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-neutral-ink/60">
                          <span>Ref: {p.id}</span>
                          <span className="bg-neutral-surface px-2 py-0.5 rounded border border-neutral-border">{p.method}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-sm font-bold text-neutral-ink/40 text-center py-4">No payments recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
