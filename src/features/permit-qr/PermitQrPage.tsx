import { useState, useCallback } from "react";
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
    setScans((prev) => [newScan, ...prev]);
  }, []);

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4 md:p-6">
      <div className="shrink-0">
        <ValidationDashboard scans={scans} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex min-h-[500px] flex-col lg:col-span-1">
          <QRScannerSimulator permits={permits} onScanResult={handleNewScan} />
        </div>
        <div className="flex min-h-[500px] flex-col lg:col-span-2">
          <FakePermitMap scans={scans} />
        </div>
      </div>

      <div className="pb-2">
        <ScanLogTable scans={scans} />
      </div>
    </div>
  );
}
