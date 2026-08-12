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
    <div className="flex flex-col h-full bg-gold-50 overflow-y-auto p-4 md:p-6 gap-6">
      <div className="shrink-0 flex items-center justify-between border-b border-neutral-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-brand-900 tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-brand-500" />
            Field Enforcement: QR Scanner
          </h1>
          <p className="text-sm font-medium text-neutral-ink/60 mt-1">
            Instantly verify encrypted transport permits, enforce quantity controls, and track forged permit attempts.
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <ValidationDashboard scans={scans} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col min-h-[500px]">
          <QRScannerSimulator permits={permits} onScanResult={handleNewScan} />
        </div>
        <div className="lg:col-span-2 flex flex-col min-h-[500px]">
          <FakePermitMap scans={scans} />
        </div>
      </div>
      
      <div className="pb-6">
        <ScanLogTable scans={scans} />
      </div>
    </div>
  );
}
