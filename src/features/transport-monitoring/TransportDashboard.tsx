import { useMemo } from "react";
import { Truck, CheckCircle2, AlertTriangle, FileDigit, ScanLine } from "lucide-react";
import type { InternalTrip } from "../../types/transport";
import { StatCard } from "../../components/ui/StatCard";

interface Props {
  trips: InternalTrip[];
}

export function TransportDashboard({ trips }: Props) {
  const stats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let anomaliesCount = 0;
    let totalTonnes = 0;

    trips.forEach((t) => {
      if (t.status === "Delivered") completed++;
      else inProgress++;

      if (t.anomalies.length > 0) anomaliesCount++;
      totalTonnes += t.loadingWeightTonnes;
    });

    const checkpostScans = trips.reduce((acc, t) => acc + t.checkpostsPassed, 0);

    return { total: trips.length, completed, inProgress, anomaliesCount, totalTonnes, checkpostScans };
  }, [trips]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="Active e-passes"
        value={stats.total}
        icon={FileDigit}
        accent="brand"
        hint="Generated today"
      />
      <StatCard
        label="In transit"
        value={stats.inProgress}
        icon={Truck}
        accent="brand"
        hint="Currently on route"
      />
      <StatCard
        label="Delivered"
        value={stats.completed}
        icon={CheckCircle2}
        accent="compliant"
        hint="Verified unloading"
      />
      <StatCard
        label="Route deviations"
        value={stats.anomaliesCount}
        icon={AlertTriangle}
        accent="violation"
        hint="Suspicious trips flagged"
        emphasis
      />
      <StatCard
        label="Checkpost scans"
        value={stats.checkpostScans}
        icon={ScanLine}
        accent="gold"
        hint="Automatic verification"
      />
    </div>
  );
}
