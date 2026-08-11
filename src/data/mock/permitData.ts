import type { EPermit, ScanEvent, EPermitStatus } from "../../types/permit";
import { createSeededRandom, pick, randomFloat, randomInt } from "./seededRandom";

const SEED = 12055;

let cachedPermits: EPermit[] | null = null;
let cachedScans: ScanEvent[] | null = null;

export function getMockPermitData() {
  if (cachedPermits && cachedScans) {
    return { permits: cachedPermits, scans: cachedScans };
  }

  const random = createSeededRandom(SEED);
  const permits: EPermit[] = [];
  const scans: ScanEvent[] = [];

  for (let i = 1; i <= 50; i++) {
    const isExpired = i <= 5;
    const isExhausted = i > 5 && i <= 10;
    
    let status: EPermitStatus = "Active";
    if (isExpired) status = "Expired";
    if (isExhausted) status = "Exhausted";
    
    const authorizedQuantityTonnes = randomInt(random, 100, 1000) * 10;
    let utilizedQuantityTonnes = 0;
    
    if (status === "Exhausted") utilizedQuantityTonnes = authorizedQuantityTonnes;
    else if (status === "Active") utilizedQuantityTonnes = Math.round(authorizedQuantityTonnes * randomFloat(random, 0.1, 0.8));
    else utilizedQuantityTonnes = Math.round(authorizedQuantityTonnes * randomFloat(random, 0.5, 0.9));

    const validFromDate = new Date();
    validFromDate.setDate(validFromDate.getDate() - randomInt(random, 1, 30));
    
    const validUntilDate = new Date(validFromDate);
    validUntilDate.setDate(validUntilDate.getDate() + 90);
    if (status === "Expired") {
      validUntilDate.setDate(new Date().getDate() - randomInt(random, 1, 10));
    }

    permits.push({
      id: `PER-2026-${String(10000 + i)}`,
      quarryId: `Q-${String(i).padStart(3, "0")}`,
      quarryName: `Quarry ${i}`,
      operatorName: `Operator ${randomInt(random, 1, 20)}`,
      mineralType: pick(random, ["Sand", "Granite", "Rough Stone"]),
      validFrom: validFromDate.toISOString(),
      validUntil: validUntilDate.toISOString(),
      authorizedQuantityTonnes,
      utilizedQuantityTonnes,
      status,
      issueTimestamp: validFromDate.toISOString(),
    });
  }

  const CHECKPOSTS = [
    { name: "Attibele Border Checkpost", lat: 12.7766, lng: 77.7770 },
    { name: "Walayar Checkpost", lat: 10.8407, lng: 76.8488 },
    { name: "Tada Border Checkpost", lat: 13.5855, lng: 80.0245 },
    { name: "Hosur Checkpost", lat: 12.7409, lng: 77.8253 },
    { name: "Kaliyakkavilai Checkpost", lat: 8.3379, lng: 77.1610 }
  ];

  const OFFICERS = ["Inspector Rajan", "Officer Karthik", "Officer Priya", "Inspector Suresh"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 200; i++) {
    const isInvalid = i <= 35;
    
    const checkpost = pick(random, CHECKPOSTS);
    const lat = checkpost.lat + randomFloat(random, -0.05, 0.05);
    const lng = checkpost.lng + randomFloat(random, -0.05, 0.05);

    const timestamp = new Date(today.getTime() + randomInt(random, 1000 * 60 * 60 * 8, 1000 * 60 * 60 * 20));

    if (isInvalid) {
      const invalidReason = pick(random, ["Forged", "Expired", "Quantity Exceeded", "Revoked"] as const) as "Forged" | "Expired" | "Quantity Exceeded" | "Revoked";
      let permitId = "";
      
      if (invalidReason === "Forged") {
        permitId = `PER-2026-${randomInt(random, 90000, 99999)}`;
      } else if (invalidReason === "Expired") {
        permitId = pick(random, permits.filter(p => p.status === "Expired")).id;
      } else if (invalidReason === "Quantity Exceeded") {
        permitId = pick(random, permits.filter(p => p.status === "Exhausted")).id;
      } else {
        permitId = pick(random, permits).id;
      }

      scans.push({
        id: `SCN-${String(1000 + i)}`,
        permitId,
        timestamp: timestamp.toISOString(),
        scannedByOfficer: pick(random, OFFICERS),
        location: { lat, lng, name: checkpost.name },
        result: "Invalid",
        invalidReason
      });
    } else {
      const activePermits = permits.filter(p => p.status === "Active");
      const permitId = pick(random, activePermits).id;
      
      scans.push({
        id: `SCN-${String(1000 + i)}`,
        permitId,
        timestamp: timestamp.toISOString(),
        scannedByOfficer: pick(random, OFFICERS),
        location: { lat, lng, name: checkpost.name },
        result: "Valid"
      });
    }
  }

  scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  cachedPermits = permits;
  cachedScans = scans;

  return { permits, scans };
}
