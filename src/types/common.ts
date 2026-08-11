export type District =
  | "Salem"
  | "Namakkal"
  | "Tiruchirappalli"
  | "Madurai"
  | "Coimbatore"
  | "Krishnagiri"
  | "Dindigul"
  | "Karur"
  | "Tirunelveli"
  | "Villupuram"
  | "Vellore"
  | "Erode"
  | "Ariyalur"
  | "Cuddalore"
  | "Thanjavur";

export const DISTRICTS: District[] = [
  "Salem",
  "Namakkal",
  "Tiruchirappalli",
  "Madurai",
  "Coimbatore",
  "Krishnagiri",
  "Dindigul",
  "Karur",
  "Tirunelveli",
  "Villupuram",
  "Vellore",
  "Erode",
  "Ariyalur",
  "Cuddalore",
  "Thanjavur",
];

export type MineralType =
  | "Sand"
  | "Granite"
  | "Limestone"
  | "Gravel"
  | "Black Granite"
  | "Rough Stone";

export const MINERAL_TYPES: MineralType[] = [
  "Sand",
  "Granite",
  "Limestone",
  "Gravel",
  "Black Granite",
  "Rough Stone",
];

export type QuarryStatus = "Compliant" | "Warning" | "Violation" | "LicenseExpired";

export const QUARRY_STATUSES: QuarryStatus[] = [
  "Compliant",
  "Warning",
  "Violation",
  "LicenseExpired",
];

/** Status → color + label mapping used consistently across every feature. */
export const STATUS_META: Record<
  QuarryStatus,
  { label: string; color: string; emoji: string }
> = {
  Compliant: { label: "Compliant", color: "#22c55e", emoji: "🟢" },
  Warning: { label: "Warning", color: "#eab308", emoji: "🟡" },
  Violation: { label: "Violation", color: "#ef4444", emoji: "🔴" },
  LicenseExpired: { label: "License Expired", color: "#374151", emoji: "⚫" },
};
