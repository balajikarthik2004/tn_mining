import { useMemo } from "react";
import { Pickaxe, CheckCircle2, Siren, Ban, IndianRupee } from "lucide-react";
import type { Quarry } from "../../../types/quarry";
import { StatCard } from "../../../components/ui/StatCard";
import { formatINR } from "../../../utils/formatters";

interface StatCardsProps {
  quarries: Quarry[];
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function StatCards({ quarries }: StatCardsProps) {
  const stats = useMemo(() => {
    const total = quarries.length;
    const active = quarries.filter((q) => q.status !== "LicenseExpired").length;
    const violationsToday = quarries.filter((q) => q.lastViolationLoggedAt && isToday(q.lastViolationLoggedAt)).length;
    const expiredLicenses = quarries.filter((q) => q.status === "LicenseExpired").length;
    const revenueThisMonth = quarries.reduce((sum, q) => sum + q.royaltyPaidINR, 0);
    return { total, active, violationsToday, expiredLicenses, revenueThisMonth };
  }, [quarries]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="Total Quarries"
        value={stats.total}
        icon={Pickaxe}
        accent="brand"
        hint="Matching current filters"
      />
      <StatCard
        label="Active"
        value={stats.active}
        icon={CheckCircle2}
        accent="compliant"
        hint="Licence in force"
      />
      <StatCard
        label="Violations Today"
        value={stats.violationsToday}
        icon={Siren}
        accent="violation"
        hint="Logged in last 24 h"
      />
      <StatCard
        label="Expired Licenses"
        value={stats.expiredLicenses}
        icon={Ban}
        accent="expired"
        hint="Operating without cover"
      />
      <StatCard
        label="Royalty Collected"
        value={formatINR(stats.revenueThisMonth)}
        icon={IndianRupee}
        accent="gold"
        hint="This month, seigniorage fee"
      />
    </div>
  );
}
