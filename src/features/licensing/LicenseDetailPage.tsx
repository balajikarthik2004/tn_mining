import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Download, CheckCircle2, AlertCircle, Clock, Truck, FileSignature, Receipt } from "lucide-react";
import { getMockData } from "../../data/mock/generateMockData";
import type { License } from "../../types/license";
import type { Quarry } from "../../types/quarry";
import type { Operator } from "../../types/operator";
import { formatINR, formatDateTime } from "../../utils/formatters";
import { RenewalApplicationModal } from "./RenewalApplicationModal";

export function LicenseDetailPage() {
  const { id } = useParams();
  const [license, setLicense] = useState<License | null>(null);
  const [quarry, setQuarry] = useState<Quarry | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);

  useEffect(() => {
    const { licenses, quarries, operators } = getMockData();
    const l = licenses.find(x => x.id === id);
    if (l) {
      setLicense(l);
      const q = quarries.find(x => x.id === l.quarryId);
      setQuarry(q || null);
      if (q) {
        setOperator(operators.find(x => x.id === q.operatorId) || null);
      }
    }
  }, [id]);

  if (!license || !quarry || !operator) {
    return <div className="p-8 text-slate-400">Loading...</div>;
  }

  const StatusIcon = 
    license.status === "Active" ? CheckCircle2 :
    license.status === "Expiring Soon" ? Clock : AlertCircle;
    
  const statusColor = 
    license.status === "Active" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
    license.status === "Expiring Soon" ? "text-orange-400 bg-orange-500/10 border-orange-500/20" :
    "text-red-400 bg-red-500/10 border-red-500/20";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/licensing" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              License: {license.licenseNumber}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColor}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {license.status}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Quarry: {quarry.name} • Operator: {operator.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium text-sm border border-slate-700/50">
            <Download className="w-4 h-4" /> Export Details
          </button>
          {(license.status === "Expiring Soon" || license.status === "Expired") && (
            <button 
              onClick={() => setShowRenewalModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-indigo-500/20"
            >
              Apply for Renewal
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700/50 pb-3">License Particulars</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Mineral Type</span>
                <span className="block mt-1 text-slate-200 font-medium">{quarry.mineralType}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">District</span>
                <span className="block mt-1 text-slate-200 font-medium">{quarry.district}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Issue Date</span>
                <span className="block mt-1 text-slate-200 font-medium">{new Date(license.validFrom).toLocaleDateString("en-IN")}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Expiry Date</span>
                <span className="block mt-1 text-slate-200 font-medium">{new Date(license.validUntil).toLocaleDateString("en-IN")}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Operator Phone</span>
                <span className="block mt-1 text-slate-200 font-medium">{operator.contactPhone}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Operator Email</span>
                <span className="block mt-1 text-slate-200 font-medium">{operator.contactEmail}</span>
              </div>
            </div>
            {license.status === "Expired" && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-400 text-sm">Automated Suspension Triggered</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">E-permit generation for this quarry has been automatically suspended due to license expiry. Enforcement teams have been alerted and transit passes are blocked.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-indigo-400" /> Document Attachments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {license.documents.map(doc => (
                <div key={doc.id} className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-700/50 rounded-lg hover:border-indigo-500/50 transition-colors group cursor-pointer">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-200 text-sm">{doc.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Uploaded {formatDateTime(doc.uploadedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" /> Linked Vehicles
            </h3>
            <div className="flex flex-wrap gap-2">
              {license.vehicles.map(veh => (
                <div key={veh.id} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">{veh.registrationNumber}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider font-medium border border-slate-700/50">{veh.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-700/50 pb-3">
              <Receipt className="w-5 h-5 text-indigo-400" /> Payment History
            </h3>
            <div className="space-y-4">
              {license.payments.map(pay => (
                <div key={pay.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div>
                    <div className="font-medium text-slate-200 text-sm">{pay.type}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{new Date(pay.date).toLocaleDateString("en-IN")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-200">{formatINR(pay.amountINR)}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${pay.status === 'Success' ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {pay.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-700/50 pb-3">
              <Clock className="w-5 h-5 text-indigo-400" /> Renewal History
            </h3>
            {license.renewals.length > 0 ? (
              <div className="space-y-4">
                {license.renewals.map((ren) => (
                  <div key={ren.id} className="p-3 rounded-lg border border-slate-700 bg-slate-900 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-200 text-sm">{ren.periodStart.slice(0, 4)} - {ren.periodEnd.slice(0, 4)}</div>
                      <div className="text-[10px] font-medium text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">{ren.status}</div>
                    </div>
                    <div className="text-xs text-slate-500">Period approved successfully.</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4 bg-slate-900/50 rounded-lg border border-slate-700/50">No previous renewals recorded.</p>
            )}
          </div>
        </div>
      </div>
      
      {showRenewalModal && (
        <RenewalApplicationModal 
          licenseId={license.licenseNumber} 
          onClose={() => setShowRenewalModal(false)} 
        />
      )}
    </div>
  );
}
