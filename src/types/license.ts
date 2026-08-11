export type LicenseStatus = "Active" | "Expiring Soon" | "Expired" | "Suspended" | "Cancelled";

export interface LicenseDocument {
  id: string;
  title: string;
  type: "Original License" | "Environmental Clearance" | "Land Document";
  url: string;
  uploadedAt: string;
}

export interface PaymentRecord {
  id: string;
  amountINR: number;
  date: string;
  type: "Application Fee" | "Renewal Fee" | "Penalty";
  status: "Success" | "Pending" | "Failed";
}

export interface LinkedVehicle {
  id: string;
  registrationNumber: string;
  type: "Tipper Truck" | "Tractor" | "Excavator";
}

export interface LicenseRenewal {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: "Approved" | "Rejected";
}

export interface License {
  id: string;
  licenseNumber: string;
  quarryId: string;
  validFrom: string; // ISO date
  validUntil: string; // ISO date
  status: LicenseStatus;
  daysToExpiry: number;
  documents: LicenseDocument[];
  payments: PaymentRecord[];
  vehicles: LinkedVehicle[];
  renewals: LicenseRenewal[];
}
