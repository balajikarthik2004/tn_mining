import { useState } from "react";
import { X, Upload, CheckCircle2 } from "lucide-react";

interface Props {
  licenseId: string;
  onClose: () => void;
}

export function RenewalApplicationModal({ licenseId, onClose }: Props) {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100">License Renewal Application</h2>
            <p className="text-sm text-slate-400 mt-1">Applying for renewal for License {licenseId}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Operator Name</label>
                  <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" defaultValue="Pre-filled Operator" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Requested Period</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500">
                    <option>5 Years</option>
                    <option>10 Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Required Documents</label>
                <div className="space-y-3">
                  <div className="border border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <Upload className="w-6 h-6 text-indigo-400 mb-2" />
                    <span className="text-sm font-medium text-slate-300">Upload Updated Environmental Clearance</span>
                    <span className="text-xs text-slate-500 mt-1">PDF up to 10MB</span>
                  </div>
                  <div className="border border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <Upload className="w-6 h-6 text-indigo-400 mb-2" />
                    <span className="text-sm font-medium text-slate-300">Upload Latest Mining Plan</span>
                    <span className="text-xs text-slate-500 mt-1">PDF up to 10MB</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in slide-in-from-bottom-4 duration-300">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Application Submitted!</h3>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                Your renewal application for license <span className="text-slate-200 font-semibold">{licenseId}</span> has been submitted successfully and is currently <span className="text-indigo-400 font-medium">Under Review</span>.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-lg font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
                Submit Application
              </button>
            </>
          ) : (
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium text-sm text-white bg-slate-700 hover:bg-slate-600 transition-colors">
              Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
