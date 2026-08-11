import type { RoyaltyRecord } from "../../types/royalty";
import { createSeededRandom, pick, randomInt, randomFloat } from "./seededRandom";

const SEED = 23998;

let cachedRoyalty: RoyaltyRecord[] | null = null;

export function getMockRoyaltyData(): RoyaltyRecord[] {
  if (cachedRoyalty) return cachedRoyalty;

  const random = createSeededRandom(SEED);
  const records: RoyaltyRecord[] = [];

  const DISTRICTS = ["Kanchipuram", "Salem", "Madurai", "Tiruchirappalli", "Tirunelveli"];
  const MINERALS = [
    { name: "Rough Stone", rate: 120 },
    { name: "Sand", rate: 250 },
    { name: "Granite", rate: 1500 }
  ];

  const now = new Date();
  
  for (let q = 1; q <= 100; q++) {
    const quarryId = `Q-${String(q).padStart(3, "0")}`;
    const quarryName = `Quarry ${q}`;
    const operatorName = `Operator ${randomInt(random, 1, 50)}`;
    const district = pick(random, DISTRICTS);
    const mineral = pick(random, MINERALS);
    
    const baseExtraction = randomInt(random, 1000, 10000);

    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
      
      const aiEstimated = baseExtraction + randomInt(random, -500, 2000);
      const declared = Math.round(aiEstimated * randomFloat(random, 0.7, 0.95));
      
      const expectedRoyalty = aiEstimated * mineral.rate;
      const declaredRoyalty = declared * mineral.rate;
      
      const payRatio = randomFloat(random, 0, 100);
      let paidRoyalty = 0;
      let status: "Paid" | "Outstanding" | "Overdue" = "Paid";
      
      if (payRatio < 10) {
        paidRoyalty = 0;
        status = m < 2 ? "Overdue" : "Outstanding";
      } else if (payRatio < 25) {
        paidRoyalty = Math.round(declaredRoyalty * 0.5);
        status = "Outstanding";
      } else {
        paidRoyalty = declaredRoyalty;
        status = "Paid";
      }

      const payments = [];
      if (paidRoyalty > 0) {
        payments.push({
          id: `TXN-${q}-${m}`,
          date: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, randomInt(random, 1, 15)).toISOString(),
          amount: paidRoyalty,
          method: pick(random, ["Bank Transfer", "Portal Gateway"] as const)
        });
      }

      records.push({
        id: `RR-${quarryId}-${monthStr}`,
        quarryId,
        quarryName,
        operatorName,
        district,
        mineralType: mineral.name,
        month: monthStr,
        aiEstimatedExtractionTonnes: aiEstimated,
        declaredExtractionTonnes: declared,
        royaltyRatePerTonne: mineral.rate,
        expectedRoyalty,
        declaredRoyalty,
        paidRoyalty,
        payments,
        remindersSent: status !== "Paid" ? randomInt(random, 1, 4) : 0,
        status
      });
    }
  }

  cachedRoyalty = records;
  return records;
}

export function mutateRoyaltyData(): RoyaltyRecord[] {
  if (!cachedRoyalty) return getMockRoyaltyData();
  
  // Randomly update 1-5 records to simulate live royalty payments
  const numToUpdate = Math.floor(Math.random() * 5) + 1;
  const now = new Date();
  for (let i = 0; i < numToUpdate; i++) {
    const idx = Math.floor(Math.random() * cachedRoyalty.length);
    const r = cachedRoyalty[idx];
    if (r.status !== "Paid" && r.paidRoyalty < r.expectedRoyalty) {
      const remaining = r.expectedRoyalty - r.paidRoyalty;
      const paymentAmount = Math.min(remaining, Math.floor(Math.random() * 200000) + 50000);
      r.paidRoyalty += paymentAmount;
      r.payments.push({
        id: `TXN-LIVE-${Date.now()}-${i}`,
        date: now.toISOString(),
        amount: paymentAmount,
        method: "Portal Gateway"
      });
      if (r.paidRoyalty >= r.expectedRoyalty) {
        r.status = "Paid";
        r.paidRoyalty = r.expectedRoyalty;
      }
    }
  }
  
  return cachedRoyalty;
}
