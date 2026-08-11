import type { MineralType } from "./common";

export type EPermitStatus = "Active" | "Exhausted" | "Expired" | "Revoked";
export type ScanResultType = "Valid" | "Invalid";
export type InvalidReason = "Forged" | "Expired" | "Quantity Exceeded" | "Revoked";

export interface EPermit {
  id: string;
  quarryId: string;
  quarryName: string;
  operatorName: string;
  mineralType: MineralType;
  validFrom: string; // ISO
  validUntil: string; // ISO
  authorizedQuantityTonnes: number;
  utilizedQuantityTonnes: number;
  status: EPermitStatus;
  issueTimestamp: string; // ISO
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
}
