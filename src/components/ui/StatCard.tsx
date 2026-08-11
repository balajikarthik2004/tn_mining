import type { LucideIcon } from "lucide-react";

export type StatCardAccent = "brand" | "compliant" | "violation" | "expired" | "gold";

const ACCENT_STYLES: Record<StatCardAccent, { bar: string; tile: string; icon: string }> = {
  brand: { bar: "bg-brand-900", tile: "bg-brand-50", icon: "text-brand-900" },
  compliant: { bar: "bg-status-compliant", tile: "bg-status-compliant/10", icon: "text-status-compliant" },
  violation: { bar: "bg-status-violation", tile: "bg-status-violation/10", icon: "text-status-violation" },
  expired: { bar: "bg-status-expired", tile: "bg-status-expired/10", icon: "text-status-expired" },
  gold: { bar: "bg-gold-500", tile: "bg-gold-50", icon: "text-gold-500" },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: StatCardAccent;
  trend?: { direction: "up" | "down"; label: string };
}

export function StatCard({ label, value, icon: Icon, accent = "brand", trend }: StatCardProps) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div className="group relative flex min-w-40 flex-1 items-start gap-3 overflow-hidden rounded-lg border border-neutral-border bg-neutral-surface p-4 shadow-sm transition-shadow hover:shadow-md">
      <span className={`absolute inset-x-0 top-0 h-1 ${styles.bar}`} aria-hidden="true" />
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${styles.tile} ${styles.icon}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-neutral-ink/55">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-brand-900">{value}</p>
        {trend && (
          <p className={`mt-0.5 text-xs font-medium ${trend.direction === "up" ? "text-status-violation" : "text-status-compliant"}`}>
            {trend.direction === "up" ? "▲" : "▼"} {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
