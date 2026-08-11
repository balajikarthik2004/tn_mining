import { useState, useCallback } from "react";
import { QrCode } from "lucide-react";
import { getMockPermitData } from "../../data/mock/permitData";
import { ValidationDashboard } from "./ValidationDashboard";
import { FakePermitMap } from "./FakePermitMap";
import { QRScannerSimulator } from "./QRScannerSimulator";
import { ScanLogTable } from "./ScanLogTable";
import type { ScanEvent } from "../../types/permit";

export function PermitQrPage() {
  const { permits, scans: initialScans } = getMockPermitData();
  const [scans, setScans] = useState<ScanEvent[]>(initialScans);

  const handleNewScan = useCallback((newScan: ScanEvent) => {
    setScans(prev => [newScan, ...prev]);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-indigo-400" />
          QR Permit Validation
        </h1>
        <p className="text-slate-400 mt-2">
          Instantly verify encrypted transport permits, enforce quantity controls, and track forged permit attempts.
        </p>
      </div>

      <ValidationDashboard scans={scans} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QRScannerSimulator permits={permits} onScanResult={handleNewScan} />
        </div>
        <div className="lg:col-span-2">
          <FakePermitMap scans={scans} />
        </div>
      </div>
      
      <div>
        <ScanLogTable scans={scans} />
      </div>
    </div>
  );
}
