import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, FileWarning, ShieldAlert, IndianRupee } from "lucide-react";
import type { License } from "../../types/license";
import { formatINR, formatINRCompact } from "../../utils/formatters";
import { StatCard } from "../../components/ui/StatCard";

interface Props {
  licenses: License[];
}

export function ExpiryDashboard({ licenses }: Props) {
  const stats = useMemo(() => {
    let active = 0;
    let expiring30 = 0;
    let expiring90 = 0;
    let expired = 0;
    let suspended = 0;

    let revenueAtRisk = 0;

    licenses.forEach((l) => {
      if (l.status === "Active") active++;
      if (l.status === "Suspended") suspended++;
      if (l.status === "Expired") expired++;

      if (l.status === "Expiring Soon") {
        if (l.daysToExpiry <= 30) {
          expiring30++;
        } else {
          expiring90++;
        }
        revenueAtRisk += 450000;
      }
    });

    return {
      total: licenses.length,
      active,
      expiring30,
      expiring90,
      expired,
      suspended,
      revenueAtRisk,
    };
  }, [licenses]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="Active leases"
        value={stats.active}
        icon={CheckCircle2}
        accent="compliant"
        hint="Fully compliant quarries"
      />
      <StatCard
        label="Pending renewals"
        value={stats.expiring30 + stats.expiring90}
        icon={FileWarning}
        accent="warning"
        hint="Expiring within 90 days"
      />
      <StatCard
        label="Suspended ops"
        value={stats.suspended}
        icon={ShieldAlert}
        accent="violation"
        hint="Licences seized or halted"
        emphasis
      />
      <StatCard
        label="Expired leases"
        value={stats.expired}
        icon={AlertTriangle}
        accent="expired"
        hint="Inactive operations"
      />
      <StatCard
        label="Revenue forecast"
        value={formatINRCompact(stats.revenueAtRisk)}
        valueTitle={formatINR(stats.revenueAtRisk)}
        icon={IndianRupee}
        accent="gold"
        hint="From pending renewals"
      />
    </div>
  );
}
