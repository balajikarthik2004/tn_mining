import { useMemo } from "react";
import { QrCode, CheckCircle2, ShieldAlert, Ban } from "lucide-react";
import type { ScanEvent } from "../../types/permit";
import { StatCard } from "../../components/ui/StatCard";

interface Props {
  scans: ScanEvent[];
}

export function ValidationDashboard({ scans }: Props) {
  const stats = useMemo(() => {
    let valid = 0;
    let rejected = 0;
    let forged = 0;
    let quotaExceeded = 0;
    let expired = 0;
    let revoked = 0;

    scans.forEach((s) => {
      if (s.result === "Valid") {
        valid++;
        return;
      }
      rejected++;
      if (s.invalidReason === "Forged") forged++;
      if (s.invalidReason === "Quantity Exceeded") quotaExceeded++;
      if (s.invalidReason === "Expired") expired++;
      if (s.invalidReason === "Revoked") revoked++;
    });

    const rejectionRate = scans.length ? (rejected / scans.length) * 100 : 0;
    return { total: scans.length, valid, rejected, forged, quotaExceeded, expired, revoked, rejectionRate };
  }, [scans]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Scans today"
        value={stats.total}
        icon={QrCode}
        accent="brand"
        hint="Across all checkposts"
      />
      <StatCard
        label="Cleared"
        value={stats.valid}
        icon={CheckCircle2}
        accent="compliant"
        hint="Valid pass, load released"
      />
      <StatCard
        label="Rejected"
        value={stats.rejected}
        icon={Ban}
        accent="warning"
        hint={`${stats.rejectionRate.toFixed(1)}% of scans · ${stats.expired} expired, ${stats.quotaExceeded} over quota, ${stats.revoked} revoked`}
      />
      <StatCard
        label="Forged passes"
        value={stats.forged}
        icon={ShieldAlert}
        accent="violation"
        hint="Vehicle detained, alert raised"
        emphasis
      />
    </div>
  );
}
