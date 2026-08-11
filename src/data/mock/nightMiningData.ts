import type { NightAlert } from "../../types/nightMining";
import { createSeededRandom, pick, randomInt } from "./seededRandom";

const SEED = 88200;

let cachedNightAlerts: NightAlert[] | null = null;

export function getMockNightAlerts(): NightAlert[] {
  if (cachedNightAlerts) return cachedNightAlerts;

  const random = createSeededRandom(SEED);
  const alerts: NightAlert[] = [];

  const QUARRIES = [
    { id: "Q-012", name: "Sri Murugan Rough Stone", dist: "Kanchipuram", lat: 12.836, lng: 79.704 },
    { id: "Q-045", name: "Salem Blue Metals", dist: "Salem", lat: 11.664, lng: 78.146 },
    { id: "Q-088", name: "Madurai Granite Exports", dist: "Madurai", lat: 9.925, lng: 78.119 },
    { id: "Q-104", name: "Trichy Sand Quarry", dist: "Tiruchirappalli", lat: 10.790, lng: 78.704 },
    { id: "Q-112", name: "Tirunelveli Lime", dist: "Tirunelveli", lat: 8.713, lng: 77.756 }
  ];

  const now = new Date();
  
  for (let i = 1; i <= 15; i++) {
    const quarry = pick(random, QUARRIES);
    
    const detectionTime = new Date(now);
    detectionTime.setHours(randomInt(random, 19, 29), randomInt(random, 0, 59), 0, 0); 
    
    const timeSinceDetectionMs = now.getTime() - detectionTime.getTime();
    
    const detectionType = pick(random, ["Thermal Signature", "Vehicle Movement", "Artificial Lighting"] as const);
    const confidenceScore = randomInt(random, 85, 99);
    
    const escalationLog = [];
    const min15 = 15 * 60 * 1000;
    const min30 = 30 * 60 * 1000;
    
    escalationLog.push({
      id: `ESC-${i}-1`,
      level: "Field Inspector",
      timestamp: detectionTime.toISOString(),
      acknowledged: timeSinceDetectionMs > min15 ? true : pick(random, [true, false]),
      acknowledgedAt: timeSinceDetectionMs > min15 ? new Date(detectionTime.getTime() + randomInt(random, 5, 14) * 60000).toISOString() : undefined,
      acknowledgedBy: "Inspector Rajan"
    });

    if (timeSinceDetectionMs > min15) {
      escalationLog.push({
        id: `ESC-${i}-2`,
        level: "District Collector",
        timestamp: new Date(detectionTime.getTime() + min15).toISOString(),
        acknowledged: timeSinceDetectionMs > min30 ? true : pick(random, [true, false]),
      });
    }

    if (timeSinceDetectionMs > min30) {
      escalationLog.push({
        id: `ESC-${i}-3`,
        level: "Department Secretary",
        timestamp: new Date(detectionTime.getTime() + min30).toISOString(),
        acknowledged: false
      });
    }

    alerts.push({
      id: `NMA-${now.getFullYear()}-${String(i).padStart(4, "0")}`,
      quarryId: quarry.id,
      quarryName: quarry.name,
      district: quarry.dist,
      mineralType: pick(random, ["Sand", "Granite", "Rough Stone"]),
      operatorName: `Operator ${randomInt(random, 1, 50)}`,
      
      detectionTime: detectionTime.toISOString(),
      detectionType,
      confidenceScore,
      
      evidence: {
        id: `EV-${i}`,
        imageUrl: "/thermal-quarry.png",
        timestamp: detectionTime.toISOString(),
        location: { lat: quarry.lat, lng: quarry.lng },
        hash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
      },
      escalationLog: escalationLog as any,
      status: timeSinceDetectionMs > min30 ? "Escalated" : "Active"
    });
  }

  alerts.sort((a, b) => new Date(b.detectionTime).getTime() - new Date(a.detectionTime).getTime());

  cachedNightAlerts = alerts;
  return alerts;
}
