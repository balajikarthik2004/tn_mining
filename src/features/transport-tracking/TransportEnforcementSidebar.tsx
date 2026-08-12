import { Link } from "react-router-dom";
import { AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight, FileX, Truck } from "lucide-react";
import type { VehicleTrip } from "../../types/transport";
import { formatTimeAgo } from "../../utils/formatters";

export function TransportEnforcementSidebar({ trips }: { trips: VehicleTrip[] }) {
  const illegalTrips = trips.filter(t => t.status === "Illegal" || t.permitStatus !== "Valid");
  const compliantCount = trips.filter(t => t.status === "Compliant").length;

  return (
    <div className="w-full md:w-96 shrink-0 flex flex-col gap-4 max-h-[800px] overflow-y-auto pr-2">
      
      {/* High Level Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-bold text-red-800 uppercase tracking-wide">Critical Alerts</h3>
          </div>
          <p className="text-3xl font-black text-red-700">{illegalTrips.length}</p>
        </div>
        <div className="bg-white border border-neutral-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h3 className="text-xs font-bold text-neutral-ink/60 uppercase tracking-wide">Compliant</h3>
          </div>
          <p className="text-3xl font-black text-brand-900">{compliantCount}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <h2 className="font-bold text-brand-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Active Enforcement Feed
        </h2>
        <span className="text-xs font-semibold text-neutral-ink/50 bg-neutral-surface px-2 py-1 rounded-md border border-neutral-border">Live</span>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        {illegalTrips.map(trip => (
          <Link 
            key={trip.id} 
            to={`/transport-tracking/${trip.id}`}
            className="block bg-white border border-red-200 hover:border-red-400 rounded-xl p-4 shadow-sm transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-brand-900 bg-neutral-surface px-2 py-0.5 rounded border border-neutral-border">
                  {trip.vehicleNumber}
                </span>
                {trip.permitStatus === "Forged" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded uppercase border border-red-100">
                    <FileX className="w-3 h-3" /> Forged e-Pass
                  </span>
                )}
                {trip.permitStatus === "Missing" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded uppercase border border-orange-100">
                    <FileX className="w-3 h-3" /> No e-Pass
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-ink/30 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform" />
            </div>
            
            <p className="text-sm text-neutral-ink/70 leading-snug mb-2 font-medium">
              Vehicle carrying <span className="font-bold text-neutral-ink">{trip.declaredWeightTonnes}t</span> of {trip.mineralType} detected {trip.hasCrossedBorder ? "crossing" : "approaching"} <span className="font-bold text-red-600">{trip.borderState} border</span>.
            </p>

            <div className="flex items-center justify-between text-xs font-semibold text-neutral-ink/50 border-t border-neutral-border/50 pt-2 mt-1">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                Origin: {trip.originQuarry}
              </span>
              <span>{trip.crossingTimestamp ? formatTimeAgo(trip.crossingTimestamp) : "Just now"}</span>
            </div>
          </Link>
        ))}
        {illegalTrips.length === 0 && (
          <div className="text-center p-8 border-2 border-dashed border-neutral-border rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-neutral-ink/50">No critical alerts detected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
