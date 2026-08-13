import type { Quarry } from "../../types/quarry";
import type { Operator } from "../../types/operator";
import type { License, LicenseStatus, LicenseDocument, PaymentRecord, LinkedVehicle, LicenseRenewal } from "../../types/license";
import { type MineralType, type QuarryStatus } from "../../types/common";
import { QUARRY_SITES } from "./quarrySites";
import { SEIGNIORAGE_FEE_PER_M3_INR } from "./officialRates";
import { createSeededRandom, pick, pickWeighted, randomFloat, randomInt } from "./seededRandom";

const SEED = 78412; // fixed seed -> stable demo dataset across refreshes/screenshots
/** One demo quarry per real mapped pit — see quarrySites.ts. */
const QUARRY_COUNT = QUARRY_SITES.length;

const MINERAL_WEIGHTS: { value: MineralType; weight: number }[] = [
  { value: "Sand", weight: 34 },
  { value: "Granite", weight: 30 },
  { value: "Limestone", weight: 12 },
  { value: "Gravel", weight: 10 },
  { value: "Black Granite", weight: 8 },
  { value: "Rough Stone", weight: 6 },
];

/**
 * Realistic monthly extraction-volume ranges (m³) by mineral type. Bulk low-value materials
 * (sand, gravel, rough stone) are worked at much higher volumes than high-value dimension
 * stone (granite, black granite), which is quarried in comparatively small block quantities —
 * this keeps royalty figures plausible once real per-m³ seigniorage rates are applied, since
 * granite's rate is ~20-30x sand's.
 */
const EXTRACTION_VOLUME_M3_RANGE: Record<MineralType, [number, number]> = {
  Sand: [1500, 8000],
  Gravel: [1200, 6000],
  "Rough Stone": [1000, 5000],
  Limestone: [800, 4000],
  Granite: [80, 500],
  "Black Granite": [40, 300],
};

const STATUS_WEIGHTS: { value: QuarryStatus; weight: number }[] = [
  { value: "Compliant", weight: 65 },
  { value: "Warning", weight: 15 },
  { value: "Violation", weight: 12 },
  { value: "LicenseExpired", weight: 8 },
];

const OPERATOR_FIRST = [
  "Sri",
  "Amman",
  "Bharath",
  "Kaveri",
  "Vishnu",
  "Murugan",
  "Lakshmi",
  "Anna",
  "Sun",
  "Tamil Nadu",
  "Cauvery",
  "Vinayaga",
  "Sakthi",
  "Meenakshi",
  "Palani",
];
const OPERATOR_SUFFIX = ["Minerals", "Quarries", "Mining Co.", "Granites", "Aggregates", "Enterprises", "Industries", "Stone Works"];

const INSPECTOR_NAMES = [
  "R. Karthikeyan",
  "S. Meena",
  "P. Suresh Kumar",
  "M. Lakshmi Priya",
  "V. Anbarasan",
  "K. Devi",
  "T. Rajendran",
  "N. Saravanan",
  "A. Kavitha",
  "J. Muthu Kumar",
];

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

interface GeneratedData {
  quarries: Quarry[];
  operators: Operator[];
  licenses: License[];
}

/**
 * Generates the full mock dataset (quarries + linked operators + licenses) from a fixed
 * seed, so ids stay consistent across the app and stable across reloads.
 */
function generateAll(): GeneratedData {
  const random = createSeededRandom(SEED);
  const quarries: Quarry[] = [];
  const operators: Operator[] = [];
  const licenses: License[] = [];

  // Every quarry sits on a real, mapped pit (OpenStreetMap landuse=quarry). The catalogue is
  // pre-sorted and dealt round-robin across districts at build time, so this is a straight walk.
  let violationsToday = 0;

  for (let i = 0; i < QUARRY_COUNT; i++) {
    const idNum = i + 1;
    const quarryId = `Q-${String(idNum).padStart(3, "0")}`;
    const operatorId = `OP-${String(idNum).padStart(3, "0")}`;
    const licenseId = `LIC-${String(idNum).padStart(3, "0")}`;

    const site = QUARRY_SITES[i];
    const district = site.district;
    const { lat, lng } = site; // real pit centroid — no jitter, this is an actual location

    const mineralType = pickWeighted(random, MINERAL_WEIGHTS);
    const status = pickWeighted(random, STATUS_WEIGHTS);

    const operatorName = `${pick(random, OPERATOR_FIRST)} ${pick(random, OPERATOR_SUFFIX)}`;
    operators.push({
      id: operatorId,
      name: operatorName,
      contactPhone: `+91 ${randomInt(random, 70000, 99999)}${randomInt(random, 10000, 99999)}`,
      contactEmail: `${operatorName.toLowerCase().replace(/[^a-z]+/g, ".")}${idNum}@tnquarrymail.example.in`,
    });

    // License validity: some expired, some expiring within 30/60/90 days, most comfortably valid.
    let validUntil: Date;
    if (status === "LicenseExpired") {
      validUntil = daysFromNow(-randomInt(random, 5, 200));
    } else {
      const bucket = random();
      if (bucket < 0.15) validUntil = daysFromNow(randomInt(random, 1, 30));
      else if (bucket < 0.3) validUntil = daysFromNow(randomInt(random, 31, 60));
      else if (bucket < 0.45) validUntil = daysFromNow(randomInt(random, 61, 90));
      else validUntil = daysFromNow(randomInt(random, 91, 900));
    }
    const validFrom = new Date(validUntil);
    validFrom.setFullYear(validFrom.getFullYear() - randomInt(random, 1, 3));

    const today = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysToExpiry = Math.floor((validUntil.getTime() - today.getTime()) / msPerDay);
    
    let licenseStatus: LicenseStatus = "Active";
    if (daysToExpiry < 0) {
      licenseStatus = "Expired";
    } else if (daysToExpiry <= 90) {
      licenseStatus = "Expiring Soon";
    }
    
    if (status === "Violation" && random() < 0.2) {
      licenseStatus = "Suspended";
    }

    const documents: LicenseDocument[] = [
      {
        id: `DOC-${idNum}-1`,
        title: "Original License",
        type: "Original License",
        url: "#",
        uploadedAt: toISODate(validFrom)
      },
      {
        id: `DOC-${idNum}-2`,
        title: "Environmental Clearance",
        type: "Environmental Clearance",
        url: "#",
        uploadedAt: toISODate(daysFromNow(-randomInt(random, 10, 100)))
      }
    ];

    const payments: PaymentRecord[] = [
      {
        id: `PAY-${idNum}-1`,
        amountINR: randomInt(random, 50000, 200000),
        date: toISODate(validFrom),
        type: "Application Fee",
        status: "Success"
      }
    ];

    const vehicles: LinkedVehicle[] = Array.from({ length: randomInt(random, 2, 8) }).map((_, vi) => ({
      id: `VEH-${idNum}-${vi}`,
      registrationNumber: `TN ${randomInt(random, 10, 99)} ${pick(random, ["AA", "AB", "XY", "ZZ"])} ${randomInt(random, 1000, 9999)}`,
      type: pick(random, ["Tipper Truck", "Tractor", "Excavator"])
    }));

    const renewals: LicenseRenewal[] = [];
    // If it's old enough, add a previous renewal
    if (new Date(validFrom).getFullYear() < new Date().getFullYear() - 2) {
      const prevStart = new Date(validFrom);
      prevStart.setFullYear(prevStart.getFullYear() - 3);
      renewals.push({
        id: `REN-${idNum}-1`,
        periodStart: toISODate(prevStart),
        periodEnd: toISODate(validFrom),
        status: "Approved"
      });
    }

    licenses.push({
      id: licenseId,
      licenseNumber: `TN/${district.slice(0, 3).toUpperCase()}/${new Date(validFrom).getFullYear()}/${randomInt(random, 1000, 9999)}`,
      quarryId,
      validFrom: toISODate(validFrom),
      validUntil: toISODate(validUntil),
      status: licenseStatus,
      daysToExpiry,
      documents,
      payments,
      vehicles,
      renewals
    });

    // Scale the declared volume with the pit's real mapped footprint (median ~11 ha), so a
    // visibly huge site doesn't report the same monthly output as a two-hectare one.
    const [volMin, volMax] = EXTRACTION_VOLUME_M3_RANGE[mineralType];
    const sizeFactor = Math.min(5, Math.max(0.45, Math.sqrt(site.areaSqM / 110_000)));
    const declaredExtractionVolumeM3Monthly = Math.round(
      randomInt(random, volMin, volMax) * sizeFactor
    );
    const isOverExtracting = status === "Warning" || status === "Violation";
    const aiEstimatedExtractionVolumeM3Monthly = isOverExtracting
      ? Math.round(declaredExtractionVolumeM3Monthly * randomFloat(random, 1.15, 1.6))
      : declaredExtractionVolumeM3Monthly;

    // Real government-published rate (₹/m³) — see officialRates.ts for the source citation.
    const rate = SEIGNIORAGE_FEE_PER_M3_INR[mineralType];
    const royaltyDueINR = Math.round(declaredExtractionVolumeM3Monthly * rate);
    const paidFraction =
      status === "LicenseExpired" ? randomFloat(random, 0.2, 0.6) : randomFloat(random, 0.55, 1);
    const royaltyPaidINR = Math.round(royaltyDueINR * paidFraction);
    const royaltyOutstandingINR = Math.max(royaltyDueINR - royaltyPaidINR, 0);

    const lastInspectionDate = toISODate(daysFromNow(-randomInt(random, 0, 90)));

    const activeViolationsCount =
      status === "Violation" ? randomInt(random, 1, 4) : status === "Warning" ? randomInt(random, 0, 1) : 0;

    // Seed a handful of Violation-status quarries with a violation logged *today* so
    // the "Violations Today" stat card has a real, non-zero number to compute.
    let lastViolationLoggedAt: string | undefined;
    if (status === "Violation" && violationsToday < 5 && random() < 0.5) {
      const today = new Date();
      today.setHours(randomInt(random, 6, 20), randomInt(random, 0, 59), 0, 0);
      lastViolationLoggedAt = today.toISOString();
      violationsToday++;
    }

    quarries.push({
      id: quarryId,
      name: `${district} ${mineralType} Quarry ${idNum}`,
      district,
      lat,
      lng,
      siteId: site.siteId,
      siteAreaSqM: site.areaSqM,
      mineralType,
      status,
      operatorId,
      licenseId,
      declaredExtractionVolumeM3Monthly,
      aiEstimatedExtractionVolumeM3Monthly,
      royaltyPaidINR,
      royaltyOutstandingINR,
      lastInspectionDate,
      inspectorName: pick(random, INSPECTOR_NAMES),
      activeViolationsCount,
      lastViolationLoggedAt,
    });
  }

  return { quarries, operators, licenses };
}

let cached: GeneratedData | null = null;

/** Lazily generates (once) and caches the full mock dataset for the session. */
export function getMockData(): GeneratedData {
  if (!cached) cached = generateAll();
  return cached;
}

/**
 * Applies a small randomized status jitter to simulate the periodic "live" refresh
 * described in the spec — mutates a handful of quarries' status without touching ids.
 * Only for the prototype's 5-minute simulated refresh; real data will replace this.
 */
export function jitterStatuses(quarries: Quarry[], random: () => number = Math.random): Quarry[] {
  return quarries.map((q) => {
    if (random() > 0.06) return q;
    const roll = random();
    let status: QuarryStatus = q.status;
    if (roll < 0.4) status = "Warning";
    else if (roll < 0.7) status = "Compliant";
    else status = "Violation";
    return { ...q, status };
  });
}
