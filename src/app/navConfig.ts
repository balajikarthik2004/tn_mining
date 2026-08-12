import {
  Map,
  AlertTriangle,
  Truck,
  FileText,
  Radio,
  QrCode,
  Moon,
  Scale,
  IndianRupee,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  enabled: boolean;
}

/** All 10 planned features — only the dashboard is functional in this build. */
export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Quarry Map Dashboard", path: "/", icon: Map, enabled: true },
  { id: "anomaly-detection", label: "AI Anomaly Detection", path: "/anomaly-detection", icon: AlertTriangle, enabled: true },
  { id: "licensing", label: "Licensing", path: "/licensing", icon: FileText, enabled: true },
  { id: "transport-hub", label: "Transport Command Center", path: "/transport-hub", icon: Truck, enabled: true },
  { id: "permit-qr", label: "QR Permit Validation", path: "/permit-qr", icon: QrCode, enabled: true },
  { id: "night-mining", label: "Night Mining Detection", path: "/night-mining", icon: Moon, enabled: true },
  {
    id: "court-cases",
    label: "Court Cases",
    icon: Scale,
    path: "/court-cases",
    enabled: true
  },
  {
    id: "royalty-intelligence",
    label: "Royalty AI",
    icon: IndianRupee,
    path: "/royalty-intelligence",
    enabled: true
  },
  // { id: "reports-analytics", label: "Reports & Analytics", path: "/reports-analytics", icon: BarChart3, enabled: false },
];
