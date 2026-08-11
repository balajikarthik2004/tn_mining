export interface Violation {
  id: string;
  quarryId: string;
  loggedAt: string; // ISO datetime
  description: string;
  severity: "Minor" | "Major" | "Critical";
}
