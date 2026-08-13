import type { District, MineralType } from "./common";

export type EPermitStatus = "Active" | "Exhausted" | "Expired" | "Revoked";
export type ScanResultType = "Valid" | "Invalid";
export type InvalidReason = "Forged" | "Expired" | "Quantity Exceeded" | "Revoked";

export interface EPermit {
  id: string;
  /** Links to the real quarry record in generateMockData — names/minerals must agree with it. */
  quarryId: string;
  quarryName: string;
  district: District;
  operatorName: string;
  mineralType: MineralType;
  validFrom: string; // ISO
  validUntil: string; // ISO
  authorizedQuantityTonnes: number;
  utilizedQuantityTonnes: number;
  status: EPermitStatus;
}

export interface ScanEvent {
  id: string;
  permitId: string;
  timestamp: string; // ISO
  scannedByOfficer: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  result: ScanResultType;
  invalidReason?: InvalidReason;
  /** Quarry the scanned pass belongs to; absent for forged passes with no matching record. */
  quarryName?: string;
}
