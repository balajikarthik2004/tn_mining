import { X } from "lucide-react";
import { DISTRICTS, MINERAL_TYPES, QUARRY_STATUSES } from "../../../types/common";
import { useDashboardStore } from "../../../store/dashboardStore";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { Button } from "../../../components/ui/Button";

export function FilterBar() {
  const filters = useDashboardStore((s) => s.filters);
  const toggleArrayFilter = useDashboardStore((s) => s.toggleArrayFilter);
  const setFilters = useDashboardStore((s) => s.setFilters);
  const clearFilters = useDashboardStore((s) => s.clearFilters);

  const hasActiveFilters =
    filters.districts.length > 0 ||
    filters.mineralTypes.length > 0 ||
    filters.statuses.length > 0 ||
    filters.licenseExpiryRange.from !== null ||
    filters.licenseExpiryRange.to !== null ||
    filters.lastInspectionRange.from !== null ||
    filters.lastInspectionRange.to !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MultiSelectFilter
        label="District"
        options={DISTRICTS}
        selected={filters.districts}
        onToggle={(v) => toggleArrayFilter("districts", v)}
      />
      <MultiSelectFilter
        label="Mineral Type"
        options={MINERAL_TYPES}
        selected={filters.mineralTypes}
        onToggle={(v) => toggleArrayFilter("mineralTypes", v)}
      />
      <MultiSelectFilter
        label="Status"
        options={QUARRY_STATUSES}
        selected={filters.statuses}
        onToggle={(v) => toggleArrayFilter("statuses", v)}
      />
      <DateRangeFilter
        label="License Expiry"
        value={filters.licenseExpiryRange}
        onChange={(range) => setFilters({ licenseExpiryRange: range })}
      />
      <DateRangeFilter
        label="Last Inspection"
        value={filters.lastInspectionRange}
        onChange={(range) => setFilters({ lastInspectionRange: range })}
      />
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="px-2! py-1.5! text-xs">
          Clear filters
          <X className="h-3 w-3" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
