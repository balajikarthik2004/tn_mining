import { useState, useEffect } from "react";
import { getMockTransportTrips } from "../../data/mock/transportData";
import type { VehicleTrip } from "../../types/transport";
import { TransportEnforcementSidebar } from "./TransportEnforcementSidebar";
import { LiveTransportMap } from "./LiveTransportMap";

export function TransportTrackingPage() {
  const [trips, setTrips] = useState<VehicleTrip[]>([]);

  useEffect(() => {
    setTrips(getMockTransportTrips());
  }, []);

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden p-4 md:p-6">
      {/* Split pane: enforcement queue + live map */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 md:flex-row">
        <TransportEnforcementSidebar trips={trips} />

        <div className="surface-card relative min-h-[500px] flex-1 overflow-hidden">
          <LiveTransportMap trips={trips} />
        </div>
      </div>
    </div>
  );
}
