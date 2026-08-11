import type { License } from "../types/license";
import type { Operator } from "../types/operator";
import { licenses } from "../data/mock/licenses";
import { operators } from "../data/mock/operators";

const LATENCY_MS = 300;

export async function getLicenseByQuarryId(quarryId: string): Promise<License | undefined> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  return licenses.find((l) => l.quarryId === quarryId);
}

export async function getOperatorById(operatorId: string): Promise<Operator | undefined> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  return operators.find((o) => o.id === operatorId);
}

/** Bulk fetchers — used by the dashboard to build search/lookup maps without N+1 calls. */
export async function getLicenses(): Promise<License[]> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  return licenses;
}

export async function getOperators(): Promise<Operator[]> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  return operators;
}
