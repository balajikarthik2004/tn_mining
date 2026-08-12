import { Radio, ScanLine } from "lucide-react";
import { getMockInternalTrips } from "../../data/mock/monitoringData";
import { TransportDashboard } from "./TransportDashboard";
import { TripAnomalyList } from "./TripAnomalyList";
import { LiveMonitoringMap } from "./LiveMonitoringMap";

export function TransportMonitoringPage() {
  const trips = getMockInternalTrips();

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6 gap-6">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-neutral-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-brand-900 flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-brand-500" />
            Internal Transport Monitoring
          </h1>
          <p className="text-sm font-medium text-neutral-ink/60 mt-1">
            Enforce e-Pass compliance, track route deviations, and monitor weighbridge data for intra-state transit.
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <TransportDashboard trips={trips} />
      </div>

      {/* Main Grid: Map and Anomalies side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        <div className="lg:col-span-2 bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden relative">
          <LiveMonitoringMap trips={trips} />
        </div>
        <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <TripAnomalyList trips={trips} />
        </div>
      </div>
    </div>
  );
}
