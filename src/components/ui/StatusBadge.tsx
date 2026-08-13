import type { CSSProperties } from "react";
import type { QuarryStatus } from "../../types/common";
import { STATUS_META } from "../../types/common";

interface StatusBadgeProps {
  status: QuarryStatus;
  /** `soft` (default) = tinted pill for dense UI; `solid` = filled, for map/dark surfaces. */
  variant?: "soft" | "solid";
  size?: "sm" | "md";
  className?: string;
}

/**
 * Colored pill used consistently across the map legend, side panel, licensing
 * table and case tracker. Uses the semantic status colors only — never the
 * brand indigo/gold — so status meaning is never ambiguous.
 */
export function StatusBadge({
  status,
  variant = "soft",
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const sizeClasses =
    size === "sm" ? "gap-1.5 px-2 py-0.5 text-[10px]" : "gap-1.5 px-2.5 py-1 text-[11px]";

  const style: CSSProperties =
    variant === "solid"
      ? { backgroundColor: meta.color, color: "#ffffff", border: `1px solid ${meta.color}` }
      : { backgroundColor: meta.soft, color: meta.ink, border: `1px solid ${meta.color}33` };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full font-bold uppercase tracking-wide ${sizeClasses} ${className}`}
      style={style}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: variant === "solid" ? "#ffffff" : meta.color }}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  );
}
