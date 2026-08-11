import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Zap, FileText, Download, Printer, Gavel, Calendar } from "lucide-react";
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

  if (!courtCase) return <div className="p-8 text-slate-400">Loading case details...</div>;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/court-cases" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              Case {courtCase.id}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-300">
                {courtCase.status}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {courtCase.quarryName} • {courtCase.operatorName} • {courtCase.district}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm">
            <FileText className="w-4 h-4" /> Auto-Generate Notice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" /> Claude AI Case Summary
            </h3>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <p className="text-slate-300 text-sm leading-relaxed">
                This case involves a <strong>{courtCase.violationType}</strong> violation detected on {formatDate(courtCase.violationDate)}. 
                The department has imposed a total penalty of <strong>{formatINR(courtCase.penaltyAmount)}</strong>. 
                <br/><br/>
                Currently, the case status is <strong className="text-indigo-400">{courtCase.status}</strong>, with {formatINR(courtCase.amountPaid)} collected so far.
                The operator, {courtCase.operatorName}, has had {courtCase.hearings.length} legal hearings scheduled regarding this matter.
                <br/><br/>
                <strong className="text-slate-200">Recommended Action:</strong> {
                  courtCase.status === "Violation Detected" ? "Generate and issue a Show Cause Notice immediately." :
                  courtCase.status === "Penalty Imposed" && courtCase.amountPaid === 0 ? "Generate Recovery Warrant." :
                  "Monitor upcoming hearing outcomes."
                }
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Auto-Generated Document Preview
              </h3>
              <div className="flex gap-2">
                <button className="text-xs flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button className="text-xs flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800">
                  <Download className="w-3.5 h-3.5" /> Save PDF
                </button>
              </div>
            </div>
            
            <div className="p-8 bg-slate-200 text-slate-900 font-serif min-h-[400px]">
              <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
                <h2 className="font-bold text-xl uppercase tracking-widest">Government of Tamil Nadu</h2>
                <h3 className="font-semibold text-lg">Department of Geology and Mining</h3>
                <p className="text-sm mt-1">District Office, {courtCase.district}</p>
              </div>
              
              <div className="flex justify-between mb-8 text-sm">
                <div>
                  <p><strong>Ref No:</strong> {courtCase.id}/DGM/2026</p>
                  <p><strong>To:</strong><br/>{courtCase.operatorName},<br/>{courtCase.quarryName}</p>
                </div>
                <div>
                  <p><strong>Date:</strong> {formatDate(new Date().toISOString())}</p>
                </div>
              </div>

              <div className="text-center font-bold mb-6 underline">
                SUBJECT: SHOW CAUSE NOTICE FOR {courtCase.violationType.toUpperCase()}
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-justify">
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

              <div className="mt-16 text-right text-sm">
                <p><strong>District Assistant Director</strong></p>
                <p>Department of Geology and Mining</p>
                <p>{courtCase.district} District</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-indigo-400" /> Court Hearings
            </h3>
            {courtCase.hearings.length > 0 ? (
              <div className="space-y-4">
                {courtCase.hearings.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(h => {
                  const isFuture = new Date(h.date) > new Date();
                  return (
                    <div key={h.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${isFuture ? "text-indigo-400" : "text-slate-400"}`}>
                          {formatDate(h.date)}
                        </span>
                        {isFuture && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">Upcoming</span>}
                      </div>
                      <p className="text-sm font-medium text-slate-200">{h.court}</p>
                      <p className="text-xs text-slate-400 mt-1">Counsel: {h.lawyer}</p>
                      {h.outcome && (
                        <p className="text-xs mt-2 p-1.5 bg-slate-800 rounded border border-slate-700 text-emerald-400">
                          Outcome: {h.outcome}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No hearings scheduled yet.</p>
            )}
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" /> Case Documents
            </h3>
            {courtCase.documents.length > 0 ? (
              <div className="space-y-3">
                {courtCase.documents.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors group cursor-pointer border border-transparent hover:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-200 group-hover:text-indigo-400 transition-colors">{d.type}</p>
                        <p className="text-[10px] text-slate-500">{formatDate(d.date)}</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-sm text-slate-500">No documents attached.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
