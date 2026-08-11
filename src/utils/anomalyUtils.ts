import type { MineralType } from "../types/common";
import { SEIGNIORAGE_FEE_PER_M3_INR } from "../data/mock/officialRates";

// Approximate density in tonnes per cubic meter (t/m³)
const DENSITY_MAP: Record<MineralType, number> = {
  Granite: 2.7,
  "Black Granite": 3.0,
  Sand: 1.6,
  Gravel: 1.5,
  Limestone: 2.5,
  "Rough Stone": 2.4,
};

export function m3ToTonnes(m3: number, mineralType: MineralType): number {
  return m3 * DENSITY_MAP[mineralType];
}

export function calculateSeverity(declaredM3: number, aiM3: number): "High" | "Medium" | "Low" | "None" {
  if (aiM3 <= declaredM3) return "None";
  const gapM3 = aiM3 - declaredM3;
  // If declared is 0 and aiM3 is > 0, it's a High anomaly
  if (declaredM3 === 0) return "High";
  
  const gapPercentage = (gapM3 / declaredM3) * 100;

  if (gapPercentage > 20) return "High";
  if (gapPercentage > 10) return "Medium";
  return "Low";
}

export function calculateRevenueLoss(gapM3: number, mineralType: MineralType): number {
  if (gapM3 <= 0) return 0;
  return gapM3 * SEIGNIORAGE_FEE_PER_M3_INR[mineralType];
}
