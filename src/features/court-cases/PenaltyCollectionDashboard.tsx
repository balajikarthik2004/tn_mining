import { useMemo } from "react";
import { IndianRupee, TrendingUp, AlertCircle, FileX } from "lucide-react";
import type { CourtCase } from "../../types/courtCases";
import { formatINR, formatINRCompact } from "../../utils/formatters";
import { StatCard } from "../../components/ui/StatCard";

interface Props {
  cases: CourtCase[];
}

export function PenaltyCollectionDashboard({ cases }: Props) {
  const stats = useMemo(() => {
    let totalImposed = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalWrittenOff = 0;

    cases.forEach((c) => {
      totalImposed += c.penaltyAmount;
      totalCollected += c.amountPaid;
      if (c.status === "Written Off") {
        totalWrittenOff += c.penaltyAmount;
      } else {
        totalOutstanding += c.penaltyAmount - c.amountPaid;
      }
    });

    const recoveryRate = totalImposed ? (totalCollected / totalImposed) * 100 : 0;
    return { totalImposed, totalCollected, totalOutstanding, totalWrittenOff, recoveryRate };
  }, [cases]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Penalties imposed"
        value={formatINRCompact(stats.totalImposed)}
        valueTitle={formatINR(stats.totalImposed)}
        icon={TrendingUp}
        accent="brand"
        hint={`Across ${cases.length} active cases`}
      />
      <StatCard
        label="Amount collected"
        value={formatINRCompact(stats.totalCollected)}
        valueTitle={formatINR(stats.totalCollected)}
        icon={IndianRupee}
        accent="compliant"
        hint={`${stats.recoveryRate.toFixed(1)}% recovery rate`}
      />
      <StatCard
        label="Outstanding arrears"
        value={formatINRCompact(stats.totalOutstanding)}
        valueTitle={formatINR(stats.totalOutstanding)}
        icon={AlertCircle}
        accent="violation"
        hint="Pending collection or under appeal"
        emphasis
      />
      <StatCard
        label="Written off"
        value={formatINRCompact(stats.totalWrittenOff)}
        valueTitle={formatINR(stats.totalWrittenOff)}
        icon={FileX}
        accent="expired"
        hint="Unrecoverable or court dismissed"
      />
    </div>
  );
}
