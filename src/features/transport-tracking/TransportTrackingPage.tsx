import { useState, useEffect } from "react";
import { Truck } from "lucide-react";
import { getMockTransportTrips } from "../../data/mock/transportData";
import type { VehicleTrip } from "../../types/transport";
import { InterStateReportDashboard } from "./InterStateReportDashboard";
import { LiveTransportMap } from "./LiveTransportMap";
import { AlertBannerList } from "./AlertBannerList";

export function TransportTrackingPage() {
  const [trips, setTrips] = useState<VehicleTrip[]>([]);

  useEffect(() => {
    setTrips(getMockTransportTrips());
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Truck className="w-6 h-6 text-indigo-400" />
          Inter-State Transport Tracking
        </h1>
        <p className="text-slate-400 mt-2">
          Real-time monitoring of mineral transport across state borders to detect illegal movement.
        </p>
      </div>

      <InterStateReportDashboard trips={trips} />
      <AlertBannerList trips={trips} />
      <LiveTransportMap trips={trips} />
    </div>
  );
}
