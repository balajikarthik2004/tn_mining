import { format, differenceInCalendarDays, parseISO, formatDistanceToNow } from "date-fns";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const CRORE = 1_00_00_000;
const LAKH = 1_00_000;

/**
 * Short rupee figure for cards and KPI tiles: ₹1,52,31,823 → "₹1.52 cr".
 * Use `formatINR` wherever the exact amount matters (tables, notices, ledgers) and pair this with a
 * `title` holding the full value so precision is never lost, only deferred.
 */
export function formatINRCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= CRORE) return `₹${trimZeros(amount / CRORE)} cr`;
  if (abs >= LAKH) return `₹${trimZeros(amount / LAKH)} L`;
  return formatINR(amount);
}

/** Short quantity for cards: 1,15,080 t → "1.15 lakh t". */
export function formatQuantityCompact(value: number, unit: string): string {
  const abs = Math.abs(value);
  if (abs >= CRORE) return `${trimZeros(value / CRORE)} cr ${unit}`;
  if (abs >= LAKH) return `${trimZeros(value / LAKH)} lakh ${unit}`;
  return `${new Intl.NumberFormat("en-IN").format(Math.round(value))} ${unit}`;
}

/** Two decimals, but drop a trailing ".00" / ".x0" so "1.50" reads as "1.5". */
function trimZeros(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

export function formatVolumeM3(volumeM3: number): string {
  return `${new Intl.NumberFormat("en-IN").format(Math.round(volumeM3))} m³`;
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "dd MMM yyyy");
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), "dd MMM yyyy, h:mm a");
}

/** Positive = days remaining, negative = days overdue/expired. */
export function daysUntil(iso: string): number {
  return differenceInCalendarDays(parseISO(iso), new Date());
}

export function daysRemainingLabel(iso: string): string {
  const days = daysUntil(iso);
  if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  if (days === 0) return "Expires today";
  return `${days} day${days === 1 ? "" : "s"} remaining`;
}

export function formatTimeAgo(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}
