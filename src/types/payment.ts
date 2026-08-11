export interface Payment {
  id: string;
  quarryId: string;
  amountINR: number;
  paidOn: string; // ISO date
  purpose: "Royalty" | "Penalty" | "License Fee";
}
