import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Zap, FileText, Download, Printer, Gavel, Calendar, CheckCircle2 } from "lucide-react";
import { getMockCourtCases } from "../../data/mock/courtCaseData";
import type { CourtCase } from "../../types/courtCases";
import { formatDate, formatINR } from "../../utils/formatters";

export function CourtCaseDetailPage() {
  const { id } = useParams();
  const [courtCase, setCourtCase] = useState<CourtCase | null>(null);

  useEffect(() => {
    const cases = getMockCourtCases();
    setCourtCase(cases.find(c => c.id === id) || null);
  }, [id]);

  if (!courtCase) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gold-50 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-neutral-border px-4 py-3 sm:px-6 sm:py-4 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 z-10 relative">
        <div className="flex items-start gap-4">
          <Link to="/court-cases" className="mt-1 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-neutral-border hover:bg-neutral-50 text-neutral-ink/70 transition-colors shadow-sm shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-brand-900 tracking-tight">
                Legal Case Dossier: {courtCase.id}
              </h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                courtCase.status === "Collected" ? "bg-green-50 text-green-700 border-green-200" :
                courtCase.status === "Written Off" ? "bg-neutral-surface text-neutral-ink/50 border-neutral-border" :
                courtCase.status === "Violation Detected" ? "bg-red-50 text-red-700 border-red-200" :
                "bg-orange-50 text-orange-700 border-orange-200"
              }`}>
                {courtCase.status}
              </span>
            </div>
            <p className="text-neutral-ink/60 text-sm mt-1.5 font-bold uppercase tracking-wide">
              {courtCase.quarryName} • {courtCase.operatorName} • {courtCase.district}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg transition-colors font-bold text-sm shadow-sm">
            <FileText className="w-4 h-4" /> Issue Formal Notice
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex items-center gap-2">
                 <Zap className="w-5 h-5 text-brand-500" />
                 <h3 className="font-bold text-brand-900">AI Legal Summary & Recommendation</h3>
              </div>
              <div className="p-6">
                <div className="p-5 bg-neutral-surface rounded-xl border border-neutral-border relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                  <p className="text-brand-900 text-sm font-medium leading-relaxed">
                    This case involves a <strong className="font-black text-red-700">{courtCase.violationType}</strong> violation detected on <strong className="font-black">{formatDate(courtCase.violationDate)}</strong>. 
                    The department has imposed a total penalty of <strong className="font-black">{formatINR(courtCase.penaltyAmount)}</strong>. 
                    <br/><br/>
                    Currently, the case status is <strong className="font-black text-brand-500 uppercase tracking-wide">{courtCase.status}</strong>, with {formatINR(courtCase.amountPaid)} collected so far.
                    The operator, {courtCase.operatorName}, has had {courtCase.hearings.length} legal hearings scheduled regarding this matter.
                  </p>
                  
                  <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-lg flex gap-3">
                     <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                     <div>
                       <strong className="text-brand-800 text-sm font-black uppercase tracking-wide block mb-1">Recommended Action</strong>
                       <p className="text-brand-700/80 text-sm font-medium">
                         {courtCase.status === "Violation Detected" ? "Generate and issue a Show Cause Notice immediately." :
                          courtCase.status === "Penalty Imposed" && courtCase.amountPaid === 0 ? "Generate Recovery Warrant." :
                          "Monitor upcoming hearing outcomes and await judicial instruction."}
                       </p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex justify-between items-center">
                <h3 className="font-bold text-brand-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-500" /> Auto-Generated Document Preview
                </h3>
                <div className="flex gap-2">
                  <button className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-neutral-ink/50 hover:text-brand-700 px-3 py-1.5 rounded-lg border border-neutral-border bg-white shadow-sm transition-colors">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-neutral-ink/50 hover:text-brand-700 px-3 py-1.5 rounded-lg border border-neutral-border bg-white shadow-sm transition-colors">
                    <Download className="w-3.5 h-3.5" /> Save PDF
                  </button>
                </div>
              </div>
              
              <div className="p-8 bg-neutral-surface border-t border-neutral-border text-neutral-900 font-serif min-h-[400px] shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
                <div className="max-w-2xl mx-auto bg-white p-10 border border-neutral-border shadow-md relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gold-50 border-b border-l border-neutral-border opacity-30"></div>
                  <div className="text-center mb-8 border-b-2 border-neutral-900 pb-4">
                    <h2 className="font-black text-xl uppercase tracking-widest text-neutral-900">Government of Tamil Nadu</h2>
                    <h3 className="font-bold text-lg mt-1">Department of Geology and Mining</h3>
                    <p className="text-sm mt-1 text-neutral-600">District Office, {courtCase.district}</p>
                  </div>
                  
                  <div className="flex justify-between mb-8 text-sm text-neutral-800">
                    <div>
                      <p><strong>Ref No:</strong> {courtCase.id}/DGM/2026</p>
                      <p className="mt-3"><strong>To:</strong><br/>{courtCase.operatorName},<br/>{courtCase.quarryName}</p>
                    </div>
                    <div>
                      <p><strong>Date:</strong> {formatDate(new Date().toISOString())}</p>
                    </div>
                  </div>

                  <div className="text-center font-black mb-6 underline underline-offset-4 text-neutral-900 tracking-wide">
                    SUBJECT: SHOW CAUSE NOTICE FOR {courtCase.violationType.toUpperCase()}
                  </div>

                  <div className="space-y-4 text-sm leading-relaxed text-justify text-neutral-800">
                    <p>
                      Whereas, it has been brought to the notice of the undersigned that a violation of type <strong>{courtCase.violationType}</strong> was detected at your quarry premises ({courtCase.quarryName}) on <strong>{formatDate(courtCase.violationDate)}</strong>.
                    </p>
                    <p>
                      Under the provisions of the Tamil Nadu Minor Mineral Concession Rules, 1959, you are hereby directed to show cause within 15 days of receipt of this notice as to why a penalty of <strong>{formatINR(courtCase.penaltyAmount)}</strong> should not be levied against you.
                    </p>
                    <p>
                      Failure to submit a satisfactory response within the stipulated time will result in ex-parte proceedings and the penalty will be finalized and added to your arrears for recovery under the Revenue Recovery Act.
                    </p>
                  </div>

                  <div className="mt-20 text-right text-sm text-neutral-900">
                    <p className="font-black">District Assistant Director</p>
                    <p>Department of Geology and Mining</p>
                    <p>{courtCase.district} District</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border">
                <h3 className="font-bold text-brand-900 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-brand-500" /> Court Hearings
                </h3>
              </div>
              <div className="p-6">
                {courtCase.hearings.length > 0 ? (
                  <div className="space-y-4">
                    {courtCase.hearings.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(h => {
                      const isFuture = new Date(h.date) > new Date();
                      return (
                        <div key={h.id} className="p-4 bg-white rounded-xl border border-neutral-border shadow-sm group">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isFuture ? "text-brand-500" : "text-neutral-ink/40"}`}>
                              {formatDate(h.date)}
                            </span>
                            {isFuture && <span className="text-[9px] font-bold uppercase tracking-widest bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-100">Upcoming</span>}
                          </div>
                          <p className="text-sm font-bold text-brand-900">{h.court}</p>
                          <p className="text-xs text-neutral-ink/60 mt-1 font-medium">Counsel: {h.lawyer}</p>
                          {h.outcome && (
                            <div className="mt-3 p-2 bg-neutral-surface rounded-lg border border-neutral-border text-xs font-bold text-brand-900">
                              <span className="text-neutral-ink/50 uppercase tracking-widest text-[9px] block mb-0.5">Outcome</span>
                              {h.outcome}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm font-bold text-neutral-ink/40 text-center py-4">No hearings scheduled yet.</p>
                )}
              </div>
            </div>
            
            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border">
                <h3 className="font-bold text-brand-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-500" /> Case Documents
                </h3>
              </div>
              <div className="p-6">
                {courtCase.documents.length > 0 ? (
                  <div className="space-y-3">
                    {courtCase.documents.map(d => (
                      <div key={d.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors group cursor-pointer border border-neutral-border shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg border border-neutral-border group-hover:border-brand-200">
                            <FileText className="w-4 h-4 text-brand-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-brand-900 group-hover:text-brand-700 transition-colors">{d.type}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-ink/40 mt-0.5">{formatDate(d.date)}</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-neutral-ink/30 group-hover:text-brand-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-sm font-bold text-neutral-ink/40 text-center py-4">No documents attached.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
