import type { CourtCase, CaseStatus } from "../../types/courtCases";
import { createSeededRandom, pick, randomInt, randomFloat } from "./seededRandom";

const SEED = 45991;

let cachedCases: CourtCase[] | null = null;

export function getMockCourtCases(): CourtCase[] {
  if (cachedCases) return cachedCases;

  const random = createSeededRandom(SEED);
  const cases: CourtCase[] = [];

  const DISTRICTS = ["Kanchipuram", "Salem", "Madurai", "Tiruchirappalli", "Tirunelveli", "Coimbatore", "Villupuram", "Vellore"];
  const VIOLATIONS = ["Over Extraction", "Night Mining", "Boundary Violation", "Illegal Transport"] as const;
  const LAWYERS = ["Adv. S. Raman", "Adv. K. Karthikeyan", "Adv. P. Swaminathan", "Adv. V. Natarajan"];
  const COURTS = ["High Court - Madurai Bench", "District Court - Salem", "Green Tribunal - SZ", "District Court - Coimbatore"];

  const now = new Date();

  for (let i = 1; i <= 155; i++) {
    const daysOpen = randomInt(random, 5, 800);
    const violationDate = new Date(now.getTime() - daysOpen * 24 * 60 * 60 * 1000);
    
    let status: CaseStatus;
    const r = randomFloat(random, 0, 100);
    if (r < 10) status = "Violation Detected";
    else if (r < 25) status = "Notice Issued";
    else if (r < 40) status = "Response Received";
    else if (r < 70) status = "Penalty Imposed";
    else if (r < 90) status = "Under Appeal";
    else if (r < 98) status = "Collected";
    else status = "Written Off";

    const penaltyAmount = randomInt(random, 5, 250) * 100000;
    let amountPaid = 0;
    
    if (status === "Collected") amountPaid = penaltyAmount;
    else if (status === "Under Appeal") amountPaid = penaltyAmount * 0.25;

    const hearings = [];
    if (status === "Under Appeal" || status === "Penalty Imposed" || status === "Collected") {
      const numHearings = randomInt(random, 1, 4);
      for (let h = 0; h < numHearings; h++) {
        const isFuture = h === numHearings - 1 && status !== "Collected";
        const hDate = new Date(violationDate.getTime() + (daysOpen / numHearings) * (h + 1) * 24 * 60 * 60 * 1000);
        
        if (isFuture) {
          hDate.setDate(now.getDate() + randomInt(random, 2, 45));
        } else if (hDate > now) {
           hDate.setDate(now.getDate() - randomInt(random, 2, 30));
        }

        hearings.push({
          id: `HR-${i}-${h}`,
          date: hDate.toISOString(),
          court: pick(random, COURTS),
          lawyer: pick(random, LAWYERS),
          outcome: isFuture ? undefined : pick(random, ["Adjourned", "Stay Granted", "Penalty Upheld", "Notice Ordered"])
        });
      }
    }

    const documents = [];
    if (status !== "Violation Detected") {
      documents.push({
        id: `DOC-${i}-1`,
        type: "Show Cause Notice" as const,
        date: new Date(violationDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        url: "#"
      });
    }
    if (status === "Penalty Imposed" || status === "Under Appeal" || status === "Collected") {
      documents.push({
        id: `DOC-${i}-2`,
        type: "Penalty Order" as const,
        date: new Date(violationDate.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        url: "#"
      });
    }

    cases.push({
      id: `CC-202${randomInt(random, 3, 6)}-${String(i).padStart(4, "0")}`,
      quarryId: `Q-${String(randomInt(random, 1, 200)).padStart(3, "0")}`,
      quarryName: `Quarry ${randomInt(random, 1, 200)}`,
      operatorName: `Operator ${randomInt(random, 1, 100)}`,
      district: pick(random, DISTRICTS),
      violationType: pick(random, VIOLATIONS),
      violationDate: violationDate.toISOString(),
      status,
      penaltyAmount,
      amountPaid,
      hearings,
      documents,
      daysOpen
    });
  }

  cases.sort((a, b) => new Date(b.violationDate).getTime() - new Date(a.violationDate).getTime());

  cachedCases = cases;
  return cases;
}

export function mutateCourtCases(): CourtCase[] {
  if (!cachedCases) return getMockCourtCases();
  
  // Randomly update 1-3 cases by increasing their amountPaid to simulate live collection
  const numToUpdate = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numToUpdate; i++) {
    const idx = Math.floor(Math.random() * cachedCases.length);
    const c = cachedCases[idx];
    if (c.status !== "Collected" && c.status !== "Written Off" && c.amountPaid < c.penaltyAmount) {
      const remaining = c.penaltyAmount - c.amountPaid;
      const payment = Math.min(remaining, Math.floor(Math.random() * 50000) + 10000);
      c.amountPaid += payment;
      if (c.amountPaid >= c.penaltyAmount) {
        c.status = "Collected";
        c.amountPaid = c.penaltyAmount;
      }
    }
  }
  
  return cachedCases;
}
