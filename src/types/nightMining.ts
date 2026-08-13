import type { District, MineralType } from "./common";

export type DetectionType = "Thermal Signature" | "Vehicle Movement" | "Artificial Lighting";
export type EscalationLevel = "Field Inspector" | "District Collector" | "Department Secretary";
export type NightAlertStatus = "Active" | "Under Investigation" | "Escalated" | "Resolved";

export interface EscalationLog {
  id: string;
  level: EscalationLevel;
  timestamp: string; // ISO
  acknowledged: boolean;
  acknowledgedAt?: string; // ISO
  acknowledgedBy?: string;
}

export interface Evidence {
  id: string;
  imageUrl: string;
  timestamp: string; // ISO
  location: {
    lat: number;
    lng: number;
  };
  /** SHA-256 style digest, unique per capture — chain-of-custody for court admissibility. */
  hash: string;
}

export interface NightAlert {
  id: string;
  /** Links to the real quarry record — name, district, mineral and operator must agree with it. */
  quarryId: string;
  quarryName: string;
  district: District;
  mineralType: MineralType;
  operatorName: string;

  detectionTime: string; // ISO
  detectionType: DetectionType;
  /** Instrument the detection came from, e.g. "VIIRS Day/Night Band". */
  sensor: string;
  confidenceScore: number; // 0-100

  evidence: Evidence;
  escalationLog: EscalationLog[];
  status: NightAlertStatus;
}
