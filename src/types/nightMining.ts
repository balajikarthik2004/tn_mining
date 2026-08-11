import type { MineralType } from "./common";

export type DetectionType = "Thermal Signature" | "Vehicle Movement" | "Artificial Lighting";
export type EscalationLevel = "Field Inspector" | "District Collector" | "Department Secretary";

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
  hash: string; // SHA-256 for court admissibility
}

export interface NightAlert {
  id: string;
  quarryId: string;
  quarryName: string;
  district: string;
  mineralType: MineralType;
  operatorName: string;
  
  detectionTime: string; // ISO
  detectionType: DetectionType;
  confidenceScore: number; // 0-100
  
  evidence: Evidence;
  escalationLog: EscalationLog[];
  status: "Active" | "Resolved" | "Escalated" | "Under Investigation";
}
