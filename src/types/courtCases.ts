export type CaseStatus = "Violation Detected" | "Notice Issued" | "Response Received" | "Penalty Imposed" | "Under Appeal" | "Collected" | "Written Off";

export interface Hearing {
  id: string;
  date: string; // ISO
  court: string;
  lawyer: string;
  outcome?: string; // empty if future
}

export interface CaseDocument {
  id: string;
  type: "Show Cause Notice" | "Response" | "Penalty Order" | "Appeal" | "Warrant";
  date: string; // ISO
  url: string;
}

export interface CourtCase {
  id: string;
  quarryId: string;
  quarryName: string;
  operatorName: string;
  district: string;
  
  violationType: "Over Extraction" | "Night Mining" | "Boundary Violation" | "Illegal Transport";
  violationDate: string; // ISO
  
  status: CaseStatus;
  
  penaltyAmount: number; // in rupees
  amountPaid: number;
  
  hearings: Hearing[];
  documents: CaseDocument[];
  
  daysOpen: number;
}
