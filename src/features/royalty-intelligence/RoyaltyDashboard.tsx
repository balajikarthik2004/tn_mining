import { useMemo } from "react";
import { IndianRupee, TrendingUp, AlertTriangle, Target } from "lucide-react";
import type { RoyaltyRecord } from "../../types/royalty";
import { formatINR, formatINRCompact } from "../../utils/formatters";
import { StatCard } from "../../components/ui/StatCard";

export function RoyaltyDashboard({ records }: { records: RoyaltyRecord[] }) {
  const stats = useMemo(() => {
    const currentMonth = records[0]?.month;
    const thisMonthRecords = records.filter((r) => r.month === currentMonth);

    let expected = 0;
    let collected = 0;
    let outstanding = 0;

    let ytdExpected = 0;
    let ytdCollected = 0;

    thisMonthRecords.forEach((r) => {
      expected += r.expectedRoyalty;
      collected += r.paidRoyalty;
      if (r.status !== "Paid") outstanding += r.expectedRoyalty - r.paidRoyalty;
    });

    records.forEach((r) => {
      ytdExpected += r.expectedRoyalty;
      ytdCollected += r.paidRoyalty;
    });

    const recoveryRate = expected ? (collected / expected) * 100 : 0;
    const ytdAgainstTarget = ytdExpected ? (ytdCollected / ytdExpected) * 100 : 0;
    return { expected, collected, outstanding, ytdExpected, ytdCollected, recoveryRate, ytdAgainstTarget };
  }, [records]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Expected this month"
        value={formatINRCompact(stats.expected)}
        valueTitle={formatINR(stats.expected)}
        icon={TrendingUp}
        accent="brand"
        hint="Based on AI volume estimates"
      />
      <StatCard
        label="Collected this month"
        value={formatINRCompact(stats.collected)}
        valueTitle={formatINR(stats.collected)}
        icon={IndianRupee}
        accent="compliant"
        hint={`${stats.recoveryRate.toFixed(1)}% recovery rate`}
      />
      <StatCard
        label="Gap outstanding"
        value={formatINRCompact(stats.outstanding)}
        valueTitle={formatINR(stats.outstanding)}
        icon={AlertTriangle}
        accent="violation"
        hint="Deficit against AI estimate"
        emphasis
      />
      <StatCard
        label="Collection year to date"
        value={formatINRCompact(stats.ytdCollected)}
        valueTitle={formatINR(stats.ytdCollected)}
        icon={Target}
        accent="gold"
        hint={`${stats.ytdAgainstTarget.toFixed(0)}% of ${formatINRCompact(stats.ytdExpected)} target`}
      />
    </div>
  );
}
