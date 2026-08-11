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
    <div className="flex flex-wrap gap-3">
      <StatCard label="Total Quarries" value={stats.total} icon={Pickaxe} accent="brand" />
      <StatCard label="Active" value={stats.active} icon={CheckCircle2} accent="compliant" />
      <StatCard label="Violations Today" value={stats.violationsToday} icon={Siren} accent="violation" />
      <StatCard label="Expired Licenses" value={stats.expiredLicenses} icon={Ban} accent="expired" />
      <StatCard label="Revenue This Month" value={formatINR(stats.revenueThisMonth)} icon={IndianRupee} accent="gold" />
    </div>
  );
}
