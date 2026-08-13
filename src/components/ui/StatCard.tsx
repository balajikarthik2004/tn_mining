import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

export type StatCardAccent = "brand" | "compliant" | "warning" | "violation" | "expired" | "gold";

const ACCENT_STYLES: Record<
  StatCardAccent,
  { tile: string; glow: string; ring: string; rule: string; value: string; progress: string }
> = {
  brand: {
    tile: "bg-linear-to-br from-brand-500 to-brand-800 text-white",
    glow: "bg-brand-500/15",
    ring: "group-hover:ring-brand-200",
    rule: "via-brand-400/70",
    value: "text-brand-900",
    progress: "[--progress-color:var(--color-brand-500)]",
  },
  compliant: {
    tile: "bg-linear-to-br from-emerald-400 to-emerald-600 text-white",
    glow: "bg-status-compliant/15",
    ring: "group-hover:ring-emerald-200",
    rule: "via-emerald-400/70",
    value: "text-emerald-700",
    progress: "[--progress-color:var(--color-status-compliant)]",
  },
  warning: {
    tile: "bg-linear-to-br from-amber-400 to-amber-600 text-white",
    glow: "bg-status-warning/15",
    ring: "group-hover:ring-amber-200",
    rule: "via-amber-400/70",
    value: "text-amber-700",
    progress: "[--progress-color:var(--color-status-warning)]",
  },
  violation: {
    tile: "bg-linear-to-br from-red-400 to-red-600 text-white",
    glow: "bg-status-violation/18",
    ring: "group-hover:ring-red-200",
    rule: "via-red-400/70",
    value: "text-red-700",
    progress: "[--progress-color:var(--color-status-violation)]",
  },
  expired: {
    tile: "bg-linear-to-br from-slate-400 to-slate-600 text-white",
    glow: "bg-status-expired/15",
    ring: "group-hover:ring-slate-300",
    rule: "via-slate-400/70",
    value: "text-neutral-ink/80",
    progress: "[--progress-color:var(--color-status-expired)]",
  },
  gold: {
    tile: "bg-linear-to-br from-gold-300 to-gold-500 text-brand-950",
    glow: "bg-gold-400/20",
    ring: "group-hover:ring-gold-300",
    rule: "via-gold-400/70",
    value: "text-brand-900",
    progress: "[--progress-color:var(--color-gold-500)]",
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: StatCardAccent;
  /** Secondary line under the value. */
  hint?: string;
  trend?: { direction: "up" | "down"; label: string };
  /** Draws attention to a card that needs action (tinted surface + accent rule). */
  emphasis?: boolean;
  /** Exact figure shown on hover when `value` is abbreviated (e.g. "₹1.52 cr"). */
  valueTitle?: string;
}

/**
 * The platform's single KPI tile. Every feature page's stat row uses this, so a metric looks and
 * behaves the same everywhere — accent colours come from the status/brand tokens only.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
  hint,
  trend,
  emphasis = false,
  valueTitle,
}: StatCardProps) {
  const styles = ACCENT_STYLES[accent];
  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <div
      className={`group hover-progress min-w-[10.5rem] flex-1 rounded-2xl p-5 shadow-card ring-1 ring-inset ring-neutral-border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover ${styles.ring} ${styles.progress} ${emphasis ? "bg-linear-to-b from-red-50/70 to-neutral-surface" : "bg-neutral-surface"
        }`}
    >
      {/* accent rule along the top edge */}
      <span
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent ${styles.rule}`}
        aria-hidden="true"
      />
      {/* soft accent bloom, warms up on hover */}
      <span
        className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-90 ${styles.glow}`}
        aria-hidden="true"
      />
      {/* sheen sweep on hover */}
      <span
        className="pointer-events-none absolute -inset-y-2 -left-1/3 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/45 to-transparent opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        {/* fixed two-line box so values stay aligned across a row of cards */}
        <p className="min-h-[2.2em] text-[11px] font-bold uppercase leading-[1.1] tracking-[0.09em] text-neutral-ink/45">
          {label}
        </p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-inset ring-white/25 transition-transform duration-300 group-hover:scale-105 ${styles.tile}`}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </div>
      </div>

      <p
        title={valueTitle}
        className={`relative mt-3 font-heading text-[1.75rem] font-extrabold leading-none tracking-tight tabular-nums ${styles.value}`}
      >
        {value}
      </p>

      {hint && <p className="relative mt-1.5 text-xs text-neutral-ink/50">{hint}</p>}

      {trend && (
        <p
          className={`relative mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${trend.direction === "up"
            ? "bg-status-violation/10 text-red-700"
            : "bg-status-compliant/10 text-emerald-700"
            }`}
        >
          <TrendIcon className="h-3 w-3" aria-hidden="true" />
          {trend.label}
        </p>
      )}
    </div>
  );
}
