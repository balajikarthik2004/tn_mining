import { Radio } from "lucide-react";
import { getMockInternalTrips } from "../../data/mock/monitoringData";
import { TransportDashboard } from "./TransportDashboard";
import { TripAnomalyList } from "./TripAnomalyList";
import { LiveMonitoringMap } from "./LiveMonitoringMap";

export function TransportMonitoringPage() {
  const trips = getMockInternalTrips();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Radio className="w-6 h-6 text-indigo-400" />
          Internal Transport Monitoring
        </h1>
        <p className="text-slate-400 mt-2">
          Monitor all intra-state mineral transport, verify digital trip sheets, and track anomalies in real-time.
        </p>
      </div>

      <TransportDashboard trips={trips} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveMonitoringMap trips={trips} />
        </div>
        <div>
          <TripAnomalyList trips={trips} />
        </div>
      </div>
    </div>
  );
}
