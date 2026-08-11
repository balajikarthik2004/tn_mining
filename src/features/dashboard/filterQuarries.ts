import type { Quarry } from "../../types/quarry";
import type { Operator } from "../../types/operator";
import type { License } from "../../types/license";
import type { DashboardFilters } from "../../store/dashboardStore";
import { daysUntil } from "../../utils/formatters";

interface FilterContext {
  operatorsById: Map<string, Operator>;
  licensesById: Map<string, License>;
}

function inDateRange(iso: string, range: { from: string | null; to: string | null }, useDaysUntil = false): boolean {
  if (!range.from && !range.to) return true;
  const value = useDaysUntil ? daysUntil(iso) : new Date(iso).getTime();
  if (range.from) {
    const from = useDaysUntil ? daysUntil(range.from) : new Date(range.from).getTime();
    if (value < from) return false;
  }
  if (range.to) {
    const to = useDaysUntil ? daysUntil(range.to) : new Date(range.to).getTime();
    if (value > to) return false;
  }
  return true;
}

export function filterQuarries(
  quarries: Quarry[],
  filters: DashboardFilters,
  searchQuery: string,
  { operatorsById, licensesById }: FilterContext
): Quarry[] {
  const query = searchQuery.trim().toLowerCase();

  return quarries.filter((q) => {
    if (filters.districts.length && !filters.districts.includes(q.district)) return false;
    if (filters.mineralTypes.length && !filters.mineralTypes.includes(q.mineralType)) return false;
    if (filters.statuses.length && !filters.statuses.includes(q.status)) return false;

    const license = licensesById.get(q.id);
    if (license && !inDateRange(license.validUntil, filters.licenseExpiryRange)) return false;
    if (!inDateRange(q.lastInspectionDate, filters.lastInspectionRange)) return false;

    if (query) {
      const operator = operatorsById.get(q.operatorId);
      const haystack = [q.name, operator?.name ?? "", license?.licenseNumber ?? ""].join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}
