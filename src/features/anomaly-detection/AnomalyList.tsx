import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, ArrowUpDown } from "lucide-react";
import type { Quarry } from "../../types/quarry";
import { calculateSeverity, calculateRevenueLoss, m3ToTonnes } from "../../utils/anomalyUtils";
import { formatINR } from "../../utils/formatters";

interface Props {
  quarries: Quarry[];
}

type Severity = "High" | "Medium" | "Low";
type SortKey = "severity" | "gap" | "loss";

const SEVERITY_STYLES: Record<Severity, string> = {
  High: "bg-status-violation/10 text-red-700 ring-status-violation/25",
  Medium: "bg-status-warning/10 text-amber-700 ring-status-warning/30",
  Low: "bg-neutral-subtle text-neutral-ink/60 ring-neutral-border",
};

const SEVERITY_ORDER: Record<Severity, number> = { High: 0, Medium: 1, Low: 2 };

export function AnomalyList({ quarries }: Props) {
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("severity");

  const anomalies = useMemo(() => {
    return quarries
      .map((q) => {
        const gapM3 = Math.max(
          0,
          q.aiEstimatedExtractionVolumeM3Monthly - q.declaredExtractionVolumeM3Monthly
        );
        return {
          ...q,
          gapM3,
          gapTonnes: m3ToTonnes(gapM3, q.mineralType),
          severity: calculateSeverity(
            q.declaredExtractionVolumeM3Monthly,
            q.aiEstimatedExtractionVolumeM3Monthly
          ) as Severity | "None",
          revenueLoss: calculateRevenueLoss(gapM3, q.mineralType),
        };
      })
      .filter((q): q is typeof q & { severity: Severity } => q.severity !== "None");
  }, [quarries]);

  const counts = useMemo(
    () => ({
      All: anomalies.length,
      High: anomalies.filter((a) => a.severity === "High").length,
      Medium: anomalies.filter((a) => a.severity === "Medium").length,
      Low: anomalies.filter((a) => a.severity === "Low").length,
    }),
    [anomalies]
  );

  const rows = useMemo(() => {
    const filtered =
      severityFilter === "All"
        ? anomalies
        : anomalies.filter((a) => a.severity === severityFilter);

    return [...filtered].sort((a, b) => {
      if (sortKey === "gap") return b.gapTonnes - a.gapTonnes;
      if (sortKey === "loss") return b.revenueLoss - a.revenueLoss;
      return (
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.revenueLoss - a.revenueLoss
      );
    });
  }, [anomalies, severityFilter, sortKey]);

  if (anomalies.length === 0) {
    return (
      <div className="surface-card p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-neutral-ink/20" />
        <p className="font-semibold text-neutral-ink/70">No anomalies detected.</p>
        <p className="mt-1 text-sm text-neutral-ink/50">
          All monitored quarries are operating within declared limits.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-line px-5 py-4">
        <div>
          <h2 className="font-heading text-[15px] font-bold text-brand-900">Flagged quarries</h2>
          <p className="mt-0.5 text-xs text-neutral-ink/50">
            Sites where AI-estimated extraction exceeds the declared volume
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["All", "High", "Medium", "Low"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSeverityFilter(level)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all ring-1 ring-inset ${severityFilter === level
                ? "bg-brand-900 text-white ring-brand-900"
                : "bg-neutral-surface text-neutral-ink/55 ring-neutral-border hover:text-brand-900"
                }`}
            >
              {level} · {counts[level]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-border bg-neutral-subtle/80 text-[11px] uppercase tracking-[0.08em] text-neutral-ink/50">
              <th className="px-5 py-3 font-bold">Quarry</th>
              <th className="px-5 py-3 font-bold">Declared → AI estimated</th>
              <th className="px-5 py-3 font-bold">
                <SortButton active={sortKey === "gap"} onClick={() => setSortKey("gap")}>
                  Gap
                </SortButton>
              </th>
              <th className="px-5 py-3 font-bold">
                <SortButton active={sortKey === "loss"} onClick={() => setSortKey("loss")}>
                  Revenue loss
                </SortButton>
              </th>
              <th className="px-5 py-3 font-bold">
                <SortButton active={sortKey === "severity"} onClick={() => setSortKey("severity")}>
                  Severity
                </SortButton>
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((anomaly) => (
              <tr
                key={anomaly.id}
                className="group border-b border-neutral-line transition-colors last:border-0 hover:bg-brand-50/50"
              >
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-brand-900">{anomaly.name}</div>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-ink/45">
                    {anomaly.district} • {anomaly.mineralType}
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-neutral-ink/70">
                  {anomaly.declaredExtractionVolumeM3Monthly.toLocaleString("en-IN")}
                  <ArrowRight className="mx-1.5 inline h-3 w-3 text-neutral-ink/30" />
                  <span className="font-bold text-amber-600">
                    {anomaly.aiEstimatedExtractionVolumeM3Monthly.toLocaleString("en-IN")}
                  </span>
                  <span className="ml-1 text-xs text-neutral-ink/40">m³</span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 font-bold tabular-nums text-status-violation">
                  +{Math.round(anomaly.gapTonnes).toLocaleString("en-IN")} t
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 font-bold tabular-nums text-brand-900">
                  {formatINR(anomaly.revenueLoss)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset ${SEVERITY_STYLES[anomaly.severity]}`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {anomaly.severity}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    to={`/anomaly-detection/${anomaly.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-900"
                  >
                    Investigate
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 uppercase tracking-[0.08em] transition-colors ${active ? "text-brand-700" : "hover:text-brand-700"
        }`}
    >
      {children}
      <ArrowUpDown className={`h-3 w-3 ${active ? "opacity-100" : "opacity-40"}`} />
    </button>
  );
}
