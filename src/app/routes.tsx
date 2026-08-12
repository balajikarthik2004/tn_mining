import type { RouteObject } from "react-router-dom";
import { Layout } from "./Layout";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { AnomalyDetectionPage } from "../features/anomaly-detection/AnomalyDetectionPage";
import { AnomalyDetailPage } from "../features/anomaly-detection/AnomalyDetailPage";
import { TransportHubPage } from "../features/transport/TransportHubPage";
import { TransportAlertDetailPage } from "../features/transport-tracking/TransportAlertDetailPage";
import { LicensingPage } from "../features/licensing/LicensingPage";
import { LicenseDetailPage } from "../features/licensing/LicenseDetailPage";
import { TripSheetPage } from "../features/transport-monitoring/TripSheetPage";
import { PermitQrPage } from "../features/permit-qr/PermitQrPage";
import { NightMiningPage } from "../features/night-mining/NightMiningPage";
import { NightAlertDetailPage } from "../features/night-mining/NightAlertDetailPage";
import { CourtCasesPage } from "../features/court-cases/CourtCasesPage";
import { CourtCaseDetailPage } from "../features/court-cases/CourtCaseDetailPage";
import { RoyaltyIntelligencePage } from "../features/royalty-intelligence/RoyaltyIntelligencePage";
import { QuarryRoyaltyDetailPage } from "../features/royalty-intelligence/QuarryRoyaltyDetailPage";
import { ReportsAnalyticsPage } from "../features/reports-analytics/ReportsAnalyticsPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "anomaly-detection", element: <AnomalyDetectionPage /> },
      { path: "anomaly-detection/:id", element: <AnomalyDetailPage /> },
      { path: "transport-hub", element: <TransportHubPage /> },
      { path: "transport-tracking/:id", element: <TransportAlertDetailPage /> },
      { path: "licensing", element: <LicensingPage /> },
      { path: "licensing/:id", element: <LicenseDetailPage /> },
      { path: "transport-monitoring/:id", element: <TripSheetPage /> },
      { path: "permit-qr", element: <PermitQrPage /> },
      { path: "night-mining", element: <NightMiningPage /> },
      { path: "night-mining/:id", element: <NightAlertDetailPage /> },
      { path: "court-cases", element: <CourtCasesPage /> },
      { path: "court-cases/:id", element: <CourtCaseDetailPage /> },
      { path: "royalty-intelligence", element: <RoyaltyIntelligencePage /> },
      { path: "royalty-intelligence/:id", element: <QuarryRoyaltyDetailPage /> },
      { path: "reports-analytics", element: <ReportsAnalyticsPage /> },
    ],
  },
];
