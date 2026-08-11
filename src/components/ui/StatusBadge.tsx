import type { QuarryStatus } from "../../types/common";
import { STATUS_META } from "../../types/common";

interface StatusBadgeProps {
  status: QuarryStatus;
  className?: string;
}

/**
 * Colored pill used consistently across the map legend, side panel, and (later)
 * the licensing table and case tracker. Uses the semantic status colors only —
 * never the brand maroon/gold — so status meaning is never ambiguous.
 */
export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white ${className}`}
      style={{ backgroundColor: meta.color }}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      {meta.label}
    </span>
  );
}
