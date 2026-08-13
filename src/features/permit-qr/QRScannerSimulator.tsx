import { useState } from "react";
import { QrCode, Camera, CheckCircle2, XCircle, RotateCcw, ShieldAlert, ScanLine } from "lucide-react";
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
    <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full relative group">
      <div className="p-4 border-b border-neutral-border flex justify-between items-center bg-neutral-surface shrink-0">
        <h3 className="font-bold text-brand-900 flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-brand-500" /> Mobile Field Scanner
        </h3>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>
      
      {/* Simulate a rugged device screen */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center relative bg-slate-950 overflow-hidden">
        {/* Subtle grid pattern background for the "camera" */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {!isScanning && !result && (
          <div className="text-center space-y-8 z-10">
            <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
              <QrCode className="w-20 h-20 text-white/30" />
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/50 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/50 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/50 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/50 rounded-br-xl" />
            </div>
            <button 
              onClick={simulateScan}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 mx-auto uppercase tracking-widest text-sm"
            >
              <Camera className="w-5 h-5" /> Tap to Scan
            </button>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Awaiting target permit</p>
          </div>
        )}

        {isScanning && (
          <div className="text-center space-y-8 z-10">
            <div className="relative w-56 h-56 mx-auto flex items-center justify-center overflow-hidden">
              <QrCode className="w-20 h-20 text-blue-400 opacity-80" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-xl" />
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,1)] animate-[scan_1.5s_ease-in-out_infinite]" />
            </div>
            <p className="text-blue-400 font-bold uppercase tracking-widest text-sm animate-pulse">Decrypting e-Pass...</p>
          </div>
        )}

        {result && (
          <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in duration-300 z-10">
            {result.result === "Valid" ? (
              <div className="w-full max-w-sm bg-emerald-950/80 backdrop-blur border border-emerald-500/50 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(34,197,94,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-widest mb-6">Verified</h2>
                <div className="bg-black/40 rounded-xl p-4 text-left space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">e-Pass ID</span>
                    <span className="text-sm font-mono font-bold text-white">{result.permitId}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Operator</span>
                    <span className="text-sm font-bold text-white truncate max-w-[150px]">{scannedPermit?.operatorName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Cargo</span>
                    <span className="text-sm font-bold text-white">{scannedPermit?.mineralType}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/10">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Quota</span>
                      <span className="text-xs font-black text-emerald-400">
                        {(scannedPermit?.authorizedQuantityTonnes || 0) - (scannedPermit?.utilizedQuantityTonnes || 0)}t remaining
                      </span>
                    </div>
                    <div className="w-full bg-black rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${((scannedPermit?.authorizedQuantityTonnes || 1) - (scannedPermit?.utilizedQuantityTonnes || 0)) / (scannedPermit?.authorizedQuantityTonnes || 1) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-sm bg-red-950/80 backdrop-blur border border-red-500/50 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(239,68,68,0.2)] relative overflow-hidden animate-[shake_0.5s_ease-in-out]">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                  <XCircle className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-1">Seize</h2>
                <h3 className="text-sm font-bold text-red-400/80 uppercase tracking-widest mb-6">Invalid Permit</h3>
                
                <div className="bg-black/40 rounded-xl p-4 text-left space-y-3 border border-red-500/20">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Reason</span>
                    <span className="text-sm font-black text-red-400 uppercase">{result.invalidReason}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Scanned ID</span>
                    <span className="text-sm font-mono font-bold text-white opacity-50 line-through">{result.permitId}</span>
                  </div>
                  
                  {result.invalidReason === "Quantity Exceeded" && scannedPermit && (
                    <div className="pt-2 mt-2">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Quota Status</span>
                        <span className="text-xs font-black text-red-400">0t remaining</span>
                      </div>
                      <div className="w-full bg-red-950 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full w-full"></div>
                      </div>
                    </div>
                  )}
                  {result.invalidReason === "Forged" && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-xs font-bold text-red-300 uppercase tracking-wider leading-relaxed">
                        Automatic alert sent to control room. Retain vehicle and driver.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setResult(null)}
              className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold transition-colors flex items-center gap-2 uppercase tracking-widest text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Reset Scanner
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 4px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
