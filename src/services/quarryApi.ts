import type { Quarry } from "../types/quarry";
import { quarries } from "../data/mock/quarries";
import { jitterStatuses } from "../data/mock/generateMockData";

const LATENCY_MS = 300;

/**
 * Mock API — swap the body of these functions for real `fetch` calls later.
 * Components must always go through this service layer, never touch the mock
 * arrays directly, so that swap is the only change required.
 */

let liveQuarries: Quarry[] = quarries;

export async function getQuarries(): Promise<Quarry[]> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  return liveQuarries;
}

export async function getQuarryById(id: string): Promise<Quarry | undefined> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  return liveQuarries.find((q) => q.id === id);
}

/**
 * Simulates a "live" data refresh (see FR: map auto-refreshes every 5 minutes) by
 * applying a small randomized status jitter. No backend in this prototype, so this
 * stands in for a real poll/subscription.
 */
export async function refreshQuarries(): Promise<Quarry[]> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  liveQuarries = jitterStatuses(liveQuarries);
  return liveQuarries;
}
