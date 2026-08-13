import type { EPermit, ScanEvent, EPermitStatus, InvalidReason } from "../../types/permit";
import { createSeededRandom, pick, randomInt, randomFloat } from "./seededRandom";
import { getMockData } from "./generateMockData";

const SEED = 12055;

let cachedPermits: EPermit[] | null = null;
let cachedScans: ScanEvent[] | null = null;

/**
 * Border and intra-state checkposts where transport e-Passes are scanned. Coordinates are the real
 * locations of those checkposts; scans are recorded *at* the post rather than scattered around it,
 * because that is what a checkpost scan means.
 */
const CHECKPOSTS = [
  { name: "Attibele Border Checkpost", lat: 12.7766, lng: 77.777 },
  { name: "Hosur Checkpost", lat: 12.7409, lng: 77.8253 },
  { name: "Walayar Checkpost", lat: 10.8407, lng: 76.8488 },
  { name: "Tada Border Checkpost", lat: 13.5855, lng: 80.0245 },
  { name: "Kaliyakkavilai Checkpost", lat: 8.3379, lng: 77.161 },
  { name: "Oddanchatram Checkpost", lat: 10.4869, lng: 77.7477 },
] as const;

const OFFICERS = [
  "Inspector R. Rajan",
  "Officer S. Karthik",
  "Officer M. Priya",
  "Inspector K. Suresh",
] as const;

const SCAN_COUNT = 200;
/** Share of scans that fail validation — the rest clear the checkpost. */
const INVALID_SCAN_COUNT = 35;

export function getMockPermitData() {
  if (cachedPermits && cachedScans) {
    return { permits: cachedPermits, scans: cachedScans };
  }

  const random = createSeededRandom(SEED);
  const { quarries, operators } = getMockData();
  const operatorsById = new Map(operators.map((o) => [o.id, o]));

  const now = new Date();
  const permits: EPermit[] = [];

  // One transport e-Pass per quarry, carrying that quarry's real name, district and mineral so the
  // page agrees with the dashboard and licensing views.
  quarries.forEach((quarry, index) => {
    const sequence = index + 1;
    let status: EPermitStatus = "Active";
    if (sequence <= 5) status = "Expired";
    else if (sequence <= 10) status = "Exhausted";
    else if (sequence <= 13) status = "Revoked";

    const authorizedQuantityTonnes = randomInt(random, 100, 1000) * 10;
    let utilizedQuantityTonnes: number;
    if (status === "Exhausted") {
      utilizedQuantityTonnes = authorizedQuantityTonnes;
    } else if (status === "Active") {
      utilizedQuantityTonnes = Math.round(
        authorizedQuantityTonnes * randomFloat(random, 0.1, 0.8)
      );
    } else {
      utilizedQuantityTonnes = Math.round(
        authorizedQuantityTonnes * randomFloat(random, 0.5, 0.9)
      );
    }

    const validFrom = new Date(now);
    validFrom.setDate(validFrom.getDate() - randomInt(random, 1, 30));

    let validUntil: Date;
    if (status === "Expired") {
      // Lapsed between yesterday and ten days ago. (An earlier version used
      // `new Date().getDate()` — the day-of-month — which produced expiry dates in the future.)
      validUntil = new Date(now);
      validUntil.setDate(validUntil.getDate() - randomInt(random, 1, 10));
    } else {
      validUntil = new Date(validFrom);
      validUntil.setDate(validUntil.getDate() + 90);
    }

    permits.push({
      id: `PER-2026-${String(10000 + sequence)}`,
      quarryId: quarry.id,
      quarryName: quarry.name,
      district: quarry.district,
      operatorName: operatorsById.get(quarry.operatorId)?.name ?? "Unrecorded operator",
      mineralType: quarry.mineralType,
      validFrom: validFrom.toISOString(),
      validUntil: validUntil.toISOString(),
      authorizedQuantityTonnes,
      utilizedQuantityTonnes,
      status,
    });
  });

  const permitsById = new Map(permits.map((p) => [p.id, p]));
  const byStatus = (status: EPermitStatus) => permits.filter((p) => p.status === status);

  // Today's scans, spread over the shift so far — never stamped in the future.
  const startOfDay = new Date(now);
  startOfDay.setHours(6, 0, 0, 0);
  const shiftWindowMs = Math.max(60 * 60 * 1000, now.getTime() - startOfDay.getTime());

  const scans: ScanEvent[] = [];
  for (let i = 1; i <= SCAN_COUNT; i++) {
    const checkpost = pick(random, CHECKPOSTS);
    const timestamp = new Date(startOfDay.getTime() + Math.floor(random() * shiftWindowMs));
    const base = {
      id: `SCN-${String(1000 + i)}`,
      timestamp: timestamp.toISOString(),
      scannedByOfficer: pick(random, OFFICERS),
      location: { lat: checkpost.lat, lng: checkpost.lng, name: checkpost.name },
    };

    if (i <= INVALID_SCAN_COUNT) {
      // Each rejection reason has to be backed by a permit in the matching state — a "Revoked"
      // rejection against an Active pass would be a contradiction in the data.
      const reasonPool: InvalidReason[] = ["Forged", "Expired", "Quantity Exceeded", "Revoked"];
      const invalidReason = pick(random, reasonPool);

      let permitId: string;
      if (invalidReason === "Forged") {
        // Outside the issued range (10001+), so a forged id can never collide with a real pass.
        permitId = `PER-2026-${randomInt(random, 90000, 99999)}`;
      } else if (invalidReason === "Expired") {
        permitId = pick(random, byStatus("Expired")).id;
      } else if (invalidReason === "Quantity Exceeded") {
        permitId = pick(random, byStatus("Exhausted")).id;
      } else {
        permitId = pick(random, byStatus("Revoked")).id;
      }

      scans.push({
        ...base,
        permitId,
        result: "Invalid",
        invalidReason,
        quarryName: permitsById.get(permitId)?.quarryName,
      });
    } else {
      const permit = pick(random, byStatus("Active"));
      scans.push({
        ...base,
        permitId: permit.id,
        result: "Valid",
        quarryName: permit.quarryName,
      });
    }
  }

  scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  cachedPermits = permits;
  cachedScans = scans;

  return { permits, scans };
}
