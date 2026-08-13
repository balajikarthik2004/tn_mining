import { getMockInternalTrips } from "../../data/mock/monitoringData";
import { TransportDashboard } from "./TransportDashboard";
import { TripAnomalyList } from "./TripAnomalyList";
import { LiveMonitoringMap } from "./LiveMonitoringMap";

export function TransportMonitoringPage() {
  const trips = getMockInternalTrips();

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4 md:p-6">
      <div className="shrink-0">
        <TransportDashboard trips={trips} />
      </div>

      {/* Live map + anomaly queue */}
      <div className="grid min-h-[600px] flex-1 grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="surface-card relative overflow-hidden lg:col-span-2">
          <LiveMonitoringMap trips={trips} />
        </div>
        <div className="surface-card flex flex-col overflow-hidden">
          <TripAnomalyList trips={trips} />
        </div>
      </div>
    </div>
  );
}
