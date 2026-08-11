import { Link } from "react-router-dom";
import type { VehicleTrip } from "../../types/transport";
import { AlertTriangle, ChevronRight, Clock } from "lucide-react";
import { formatDateTime } from "../../utils/formatters";

interface Props {
  trips: VehicleTrip[];
}

export function AlertBannerList({ trips }: Props) {
  const alerts = trips.filter((t) => t.status === "Illegal" || t.status === "Suspicious");

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Active Border Alerts</h3>
      {alerts.map((alert) => (
        <div 
          key={alert.id}
          className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur shadow-sm ${
            alert.status === "Illegal" 
              ? "bg-red-500/10 border-red-500/30" 
              : "bg-orange-500/10 border-orange-500/30"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full mt-0.5 ${
              alert.status === "Illegal" ? "bg-red-500/20 text-red-500" : "bg-orange-500/20 text-orange-500"
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`font-bold ${alert.status === "Illegal" ? "text-red-400" : "text-orange-400"}`}>
                {alert.status === "Illegal" ? "Illegal Border Crossing Detected" : "Suspicious Route Deviation"}
              </h4>
              <p className="text-sm text-slate-300 mt-1">
                Vehicle <span className="font-semibold text-slate-200">{alert.vehicleNumber}</span> is {alert.hasCrossedBorder ? "crossing" : "approaching"} the {alert.borderState} border. Permit status: <span className="font-semibold">{alert.permitStatus}</span>.
              </p>
              {alert.crossingTimestamp && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDateTime(alert.crossingTimestamp)}
                </div>
              )}
            </div>
          </div>
          <Link
            to={`/transport-tracking/${alert.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              alert.status === "Illegal" 
                ? "bg-red-500/20 text-red-300 hover:bg-red-500/30" 
                : "bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
            }`}
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ))}
    </div>
  );
}
