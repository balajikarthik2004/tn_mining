/**
 * All 38 present-day districts of Tamil Nadu. Spellings match `public/geo/tn-districts.geojson`
 * (datta07/INDIAN-SHAPEFILES) exactly, so clicking a district on the map filters correctly —
 * change them together or map clicks silently match nothing.
 */
export type District =
  | "Ariyalur"
  | "Chengalpattu"
  | "Chennai"
  | "Coimbatore"
  | "Cuddalore"
  | "Dharmapuri"
  | "Dindigul"
  | "Erode"
  | "Kallakurichi"
  | "Kanchipuram"
  | "Kanniyakumari"
  | "Karur"
  | "Krishnagiri"
  | "Madurai"
  | "Mayiladuthurai"
  | "Nagapattinam"
  | "Namakkal"
  | "Perambalur"
  | "Pudukkottai"
  | "Ramanathapuram"
  | "Ranipet"
  | "Salem"
  | "Sivaganga"
  | "Tenkasi"
  | "Thanjavur"
  | "The Nilgiris"
  | "Theni"
  | "Thiruvallur"
  | "Thiruvarur"
  | "Tiruchirappalli"
  | "Tirunelveli"
  | "Tirupathur"
  | "Tiruppur"
  | "Tiruvannamalai"
  | "Tuticorin"
  | "Vellore"
  | "Villupuram"
  | "Virudhunagar";

export const DISTRICTS: District[] = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kanchipuram",
  "Kanniyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "The Nilgiris",
  "Theni",
  "Thiruvallur",
  "Thiruvarur",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvannamalai",
  "Tuticorin",
  "Vellore",
  "Villupuram",
  "Virudhunagar",
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

/**
 * Status → color + label mapping used consistently across every feature.
 * `color` is the solid semantic color (map markers, legend dots, badge dots);
 * `soft`/`ink` are the tinted-pill pair used by <StatusBadge>. These mirror the
 * `--color-status-*` tokens in index.css — keep the two in sync.
 */
export const STATUS_META: Record<
  QuarryStatus,
  { label: string; color: string; soft: string; ink: string }
> = {
  Compliant: { label: "Compliant", color: "#10b981", soft: "#ecfdf5", ink: "#047857" },
  Warning: { label: "Warning", color: "#f59e0b", soft: "#fffbeb", ink: "#b45309" },
  Violation: { label: "Violation", color: "#ef4444", soft: "#fef2f2", ink: "#b91c1c" },
  LicenseExpired: { label: "License Expired", color: "#64748b", soft: "#f1f5f9", ink: "#475569" },
};
