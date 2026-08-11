export interface RoyaltyPayment {
  id: string;
  date: string; // ISO
  amount: number;
  method: "Bank Transfer" | "Portal Gateway";
}

export interface RoyaltyRecord {
  id: string;
  quarryId: string;
  quarryName: string;
  operatorName: string;
  district: string;
  mineralType: string;
  
  month: string; // e.g., "2026-07"
  
  // 3-way gap analysis
  aiEstimatedExtractionTonnes: number;
  declaredExtractionTonnes: number;
  
  royaltyRatePerTonne: number;
  
  expectedRoyalty: number; // AI * Rate
  declaredRoyalty: number; // Declared * Rate
  paidRoyalty: number;
  
  payments: RoyaltyPayment[];
  remindersSent: number;
  
  status: "Paid" | "Outstanding" | "Overdue";
}

export interface Defaulter {
  quarryId: string;
  quarryName: string;
  operatorName: string;
  district: string;
  totalOutstanding: number;
  daysOverdue: number;
}
