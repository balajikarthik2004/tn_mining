import { useState } from "react";
import { QrCode, Camera, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import type { ScanEvent, EPermit } from "../../types/permit";

interface Props {
  permits: EPermit[];
  onScanResult: (scan: ScanEvent) => void;
}

export function QRScannerSimulator({ permits, onScanResult }: Props) {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanEvent | null>(null);
  const [scannedPermit, setScannedPermit] = useState<EPermit | null>(null);

  const simulateScan = () => {
    setIsScanning(true);
    setResult(null);
    setScannedPermit(null);

    setTimeout(() => {
      const isInvalid = Math.random() < 0.3;
      
      const eventId = `SCN-SIM-${Date.now()}`;
      const location = { lat: 13.0827, lng: 80.2707, name: "Chennai Highway Checkpost" };
      
      if (isInvalid) {
        const reasons = ["Forged", "Expired", "Quantity Exceeded", "Revoked"] as const;
        const invalidReason = reasons[Math.floor(Math.random() * reasons.length)];
        
        const event: ScanEvent = {
          id: eventId,
          permitId: invalidReason === "Forged" ? `PER-2026-${Math.floor(Math.random() * 90000 + 10000)}` : permits[Math.floor(Math.random() * permits.length)].id,
          timestamp: new Date().toISOString(),
          scannedByOfficer: "Officer Simulation",
          location,
          result: "Invalid",
          invalidReason
        };
        
        setResult(event);
        if (invalidReason !== "Forged") {
          setScannedPermit(permits.find(p => p.id === event.permitId) || null);
        }
        onScanResult(event);
      } else {
        const validPermits = permits.filter(p => p.status === "Active");
        const permit = validPermits[Math.floor(Math.random() * validPermits.length)];
        
        const event: ScanEvent = {
          id: eventId,
          permitId: permit.id,
          timestamp: new Date().toISOString(),
          scannedByOfficer: "Officer Simulation",
          location,
          result: "Valid"
        };
        
        setResult(event);
        setScannedPermit(permit);
        onScanResult(event);
      }
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30 shrink-0">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <Camera className="w-4 h-4 text-indigo-400" /> Scanner Simulator
        </h3>
      </div>
      
      <div className="flex-1 p-6 flex flex-col items-center justify-center relative bg-slate-950">
        {!isScanning && !result && (
          <div className="text-center space-y-6">
            <div className="relative w-48 h-48 mx-auto border-2 border-slate-600 rounded-xl flex items-center justify-center bg-slate-900">
              <QrCode className="w-16 h-16 text-slate-500 opacity-50" />
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500 rounded-br-xl" />
            </div>
            <button 
              onClick={simulateScan}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-900/20 transition-all flex items-center gap-2 mx-auto"
            >
              <Camera className="w-5 h-5" /> Tap to Scan Next Vehicle
            </button>
          </div>
        )}

        {isScanning && (
          <div className="text-center space-y-6 animate-pulse">
            <div className="relative w-48 h-48 mx-auto border-2 border-indigo-500 rounded-xl flex items-center justify-center bg-slate-900 overflow-hidden">
              <QrCode className="w-16 h-16 text-indigo-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,1)] animate-[scan_1.5s_ease-in-out_infinite]" />
            </div>
            <p className="text-indigo-400 font-bold">Verifying with central database...</p>
          </div>
        )}

        {result && (
          <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in duration-300">
            {result.result === "Valid" ? (
              <div className="w-full max-w-sm bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-6 text-center space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-400 uppercase tracking-widest">Valid Permit</h2>
                <div className="bg-slate-900/50 rounded-lg p-4 text-left border border-slate-700/50 space-y-2">
                  <p className="text-sm text-slate-400 flex justify-between">ID: <span className="text-slate-100 font-medium">{result.permitId}</span></p>
                  <p className="text-sm text-slate-400 flex justify-between">Operator: <span className="text-slate-100 font-medium">{scannedPermit?.operatorName}</span></p>
                  <p className="text-sm text-slate-400 flex justify-between">Material: <span className="text-slate-100 font-medium">{scannedPermit?.mineralType}</span></p>
                  <div className="pt-2 mt-2 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-1">Quantity Remaining</p>
                    <div className="w-full bg-slate-800 rounded-full h-2 mb-1">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${((scannedPermit?.authorizedQuantityTonnes || 1) - (scannedPermit?.utilizedQuantityTonnes || 0)) / (scannedPermit?.authorizedQuantityTonnes || 1) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-emerald-400 text-right font-medium">
                      {(scannedPermit?.authorizedQuantityTonnes || 0) - (scannedPermit?.utilizedQuantityTonnes || 0)}t / {scannedPermit?.authorizedQuantityTonnes}t
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-sm bg-red-950/30 border border-red-500/30 rounded-xl p-6 text-center space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-red-500 uppercase tracking-widest">Invalid Permit</h2>
                <div className="bg-slate-900/50 rounded-lg p-4 text-left border border-red-500/20 space-y-2">
                  <p className="text-sm text-red-400 font-bold flex justify-between">Reason: <span>{result.invalidReason}</span></p>
                  <p className="text-sm text-slate-400 flex justify-between mt-2">ID Scanned: <span className="text-slate-100 font-medium">{result.permitId}</span></p>
                  
                  {result.invalidReason === "Quantity Exceeded" && scannedPermit && (
                    <div className="pt-2 mt-2 border-t border-slate-700/50">
                      <p className="text-xs text-slate-500 mb-1">Quota Status</p>
                      <div className="w-full bg-red-900 rounded-full h-2 mb-1">
                        <div className="bg-red-500 h-2 rounded-full w-full"></div>
                      </div>
                      <p className="text-xs text-red-400 text-right font-medium">0t remaining</p>
                    </div>
                  )}
                  {result.invalidReason === "Forged" && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                      Alert has been dispatched to district task force. Retain vehicle and driver.
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setResult(null)}
              className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Scan Next
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 4px); }
        }
      `}</style>
    </div>
  );
}
