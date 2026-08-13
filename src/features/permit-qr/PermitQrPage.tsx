import { useState, useCallback } from "react";
import { getMockPermitData } from "../../data/mock/permitData";
import { ValidationDashboard } from "./ValidationDashboard";
import { FakePermitMap } from "./FakePermitMap";
import { QRScannerSimulator } from "./QRScannerSimulator";
import { ScanLogTable } from "./ScanLogTable";
import type { EPermit, ScanEvent } from "../../types/permit";

export function PermitQrPage() {
  const { permits: initialPermits, scans: initialScans } = getMockPermitData();
  const [permits, setPermits] = useState<EPermit[]>(initialPermits);
  const [scans, setScans] = useState<ScanEvent[]>(initialScans);

  const handleNewScan = useCallback((newScan: ScanEvent) => {
    setScans((prev) => [newScan, ...prev]);
  }, []);

  /** A cleared scan draws down the pass's remaining quota, and exhausts it at the limit. */
  const handleQuotaConsumed = useCallback((permitId: string, tonnes: number) => {
    setPermits((prev) =>
      prev.map((permit) => {
        if (permit.id !== permitId) return permit;
        const utilized = Math.min(
          permit.authorizedQuantityTonnes,
          permit.utilizedQuantityTonnes + tonnes
        );
        return {
          ...permit,
          utilizedQuantityTonnes: utilized,
          status: utilized >= permit.authorizedQuantityTonnes ? "Exhausted" : permit.status,
        };
      })
    );
  }, []);

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4 md:p-6">
      <ValidationDashboard scans={scans} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex min-h-[520px] flex-col lg:col-span-1">
          <QRScannerSimulator
            permits={permits}
            onScanResult={handleNewScan}
            onQuotaConsumed={handleQuotaConsumed}
          />
        </div>
        <div className="flex min-h-[520px] flex-col lg:col-span-2">
          <FakePermitMap scans={scans} />
        </div>
      </div>

      <div className="pb-2">
        <ScanLogTable scans={scans} />
      </div>
    </div>
  );
}
