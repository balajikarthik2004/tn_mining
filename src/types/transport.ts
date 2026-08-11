import type { MineralType } from "./common";

export type PermitStatus = "Valid" | "Expired" | "Missing" | "Forged";
export type TripStatus = "Compliant" | "Suspicious" | "Illegal";

export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface VehicleTrip {
  id: string; // The trip or alert ID
  vehicleNumber: string;
  driverName: string;
  operatorName: string;
  originQuarry: string;
  declaredDestination: string;
  mineralType: MineralType;
  declaredWeightTonnes: number;
  permitStatus: PermitStatus;
  status: TripStatus;
  
  // Real-time location
  currentLocation: { lat: number; lng: number };
  
  // Border info
  isApproachingBorder: boolean;
  hasCrossedBorder: boolean;
  borderState?: "Andhra Pradesh" | "Karnataka" | "Kerala";
  crossingTimestamp?: string;
  
  // Routes
  actualRoute: RoutePoint[];
  declaredRoute: RoutePoint[];
}

export type InternalTripStatus = "In Transit" | "Delivered" | "Overdue" | "Suspicious";

export interface TripAnomaly {
  id: string;
  type: "Route Deviation" | "Weight Mismatch" | "Time Anomaly" | "Frequent Stops";
  description: string;
  timestamp: string;
  severity: "High" | "Medium" | "Low";
}

export interface InternalTrip {
  id: string;
  tripSheetNumber: string;
  vehicleNumber: string;
  driverName: string;
  operatorName: string;
  originQuarry: string;
  destination: string;
  mineralType: MineralType;
  
  startTime: string; // ISO
  estimatedArrivalTime: string; // ISO
  actualArrivalTime?: string; // ISO

  loadingWeightTonnes: number;
  deliveryWeightTonnes?: number;

  status: InternalTripStatus;
  currentLocation: { lat: number; lng: number };
  route: RoutePoint[];
  
  anomalies: TripAnomaly[];
  checkpostsPassed: number;
}
