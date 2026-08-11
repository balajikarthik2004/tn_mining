import type { District, MineralType, QuarryStatus } from "./common";

export interface Quarry {
  id: string;
  name: string;
  district: District;
  lat: number;
  lng: number;
  mineralType: MineralType;
  status: QuarryStatus;
  operatorId: string;
  licenseId: string;
  /**
   * Extraction volume in cubic metres — the unit Tamil Nadu's real seigniorage fee schedule is
   * quoted in (see data/mock/officialRates.ts), used so royalty math applies the real published
   * rates directly rather than guessing a tonnes<->m³ density conversion.
   */
  declaredExtractionVolumeM3Monthly: number;
  /** Used fully in Feature 2 (AI anomaly detection); needed for stat cards now. */
  aiEstimatedExtractionVolumeM3Monthly: number;
  royaltyPaidINR: number;
  royaltyOutstandingINR: number;
  lastInspectionDate: string; // ISO date
  inspectorName: string;
  activeViolationsCount: number;
  /** ISO datetime, set for a subset of Violation-status quarries to drive "Violations Today". */
  lastViolationLoggedAt?: string;
}
