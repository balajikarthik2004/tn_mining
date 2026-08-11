import { format, differenceInCalendarDays, parseISO, formatDistanceToNow } from "date-fns";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
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
