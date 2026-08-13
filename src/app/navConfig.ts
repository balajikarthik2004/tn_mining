import {
  Map,
  AlertTriangle,
  Truck,
  FileText,
  QrCode,
  Moon,
  Scale,
  IndianRupee,
  type LucideIcon,
} from "lucide-react";

/** Sidebar groupings, rendered in this order. */
export const NAV_SECTIONS = ["Overview", "Enforcement", "Revenue & Legal"] as const;
export type NavSection = (typeof NAV_SECTIONS)[number];

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  enabled: boolean;
  section: NavSection;
}

/** All planned features — grouped so the sidebar reads as a workflow, not a flat list. */
export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Quarry Map Dashboard", path: "/", icon: Map, enabled: true, section: "Overview" },
  {
    id: "anomaly-detection",
    label: "AI Anomaly Detection",
    path: "/anomaly-detection",
    icon: AlertTriangle,
    enabled: true,
    section: "Overview",
  },
  {
    id: "licensing",
    label: "Licensing",
    path: "/licensing",
    icon: FileText,
    enabled: true,
    section: "Enforcement",
  },
  {
    id: "transport-hub",
    label: "Transport Command Center",
    path: "/transport-hub",
    icon: Truck,
    enabled: true,
    section: "Enforcement",
  },
  {
    id: "permit-qr",
    label: "QR Permit Validation",
    path: "/permit-qr",
    icon: QrCode,
    enabled: true,
    section: "Enforcement",
  },
  {
    id: "night-mining",
    label: "Night Mining Detection",
    path: "/night-mining",
    icon: Moon,
    enabled: true,
    section: "Enforcement",
  },
  {
    id: "court-cases",
    label: "Court Cases",
    path: "/court-cases",
    icon: Scale,
    enabled: true,
    section: "Revenue & Legal",
  },
  {
    id: "royalty-intelligence",
    label: "Royalty AI",
    path: "/royalty-intelligence",
    icon: IndianRupee,
    enabled: true,
    section: "Revenue & Legal",
  },
  // { id: "reports-analytics", label: "Reports & Analytics", path: "/reports-analytics", icon: BarChart3, enabled: false, section: "Revenue & Legal" },
];
