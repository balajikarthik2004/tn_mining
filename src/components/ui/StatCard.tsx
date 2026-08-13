import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

export type StatCardAccent = "brand" | "compliant" | "warning" | "violation" | "expired" | "gold";

const ACCENT_STYLES: Record<
  StatCardAccent,
  { tile: string; glow: string; ring: string }
> = {
  brand: {
    tile: "bg-linear-to-br from-brand-500 to-brand-800 text-white",
    glow: "bg-brand-500/15",
    ring: "group-hover:ring-brand-200",
  },
  compliant: {
    tile: "bg-linear-to-br from-emerald-400 to-emerald-600 text-white",
    glow: "bg-status-compliant/15",
    ring: "group-hover:ring-emerald-200",
  },
  warning: {
    tile: "bg-linear-to-br from-amber-400 to-amber-600 text-white",
    glow: "bg-status-warning/15",
    ring: "group-hover:ring-amber-200",
  },
  violation: {
    tile: "bg-linear-to-br from-red-400 to-red-600 text-white",
    glow: "bg-status-violation/15",
    ring: "group-hover:ring-red-200",
  },
  expired: {
    tile: "bg-linear-to-br from-slate-400 to-slate-600 text-white",
    glow: "bg-status-expired/15",
    ring: "group-hover:ring-slate-300",
  },
  gold: {
    tile: "bg-linear-to-br from-gold-300 to-gold-500 text-brand-950",
    glow: "bg-gold-400/20",
    ring: "group-hover:ring-gold-300",
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: StatCardAccent;
  /** Optional secondary line under the value. */
  hint?: string;
  trend?: { direction: "up" | "down"; label: string };
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
  hint,
  trend,
}: StatCardProps) {
  const styles = ACCENT_STYLES[accent];
  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <div
      className={`group relative min-w-[10.5rem] flex-1 overflow-hidden rounded-2xl bg-neutral-surface p-5 shadow-card ring-1 ring-inset ring-neutral-border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${styles.ring}`}
    >
      {/* soft accent bloom in the corner */}
      <span
        className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-90 ${styles.glow}`}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        {/* fixed two-line box so values stay aligned across a row of cards */}
        <p className="min-h-[2.2em] text-[11px] font-bold uppercase leading-[1.1] tracking-[0.09em] text-neutral-ink/45">
          {label}
        </p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${styles.tile}`}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </div>
      </div>

      <p className="relative mt-3 font-heading text-[1.75rem] font-extrabold leading-none tracking-tight text-brand-900">
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
