import { useState, useEffect } from "react";
import { Truck } from "lucide-react";
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
    <div className="flex flex-col h-full overflow-hidden p-4 md:p-6 gap-4">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-neutral-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-brand-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-brand-500" />
            Border Enforcement & Tracking
          </h1>
          <p className="text-sm font-medium text-neutral-ink/60 mt-1">
            Real-time inter-state transport monitoring. Detect forged e-passes and illegal border crossings.
          </p>
        </div>
      </div>

      {/* Split Pane Layout */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        <TransportEnforcementSidebar trips={trips} />
        
        <div className="flex-1 bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden relative min-h-[500px]">
          <LiveTransportMap trips={trips} />
        </div>
      </div>
    </div>
  );
}
