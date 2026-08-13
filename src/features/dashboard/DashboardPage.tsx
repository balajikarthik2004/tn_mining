import { useMemo } from "react";
import { useDashboardData } from "./useDashboardData";
import { filterQuarries } from "./filterQuarries";
import { useDashboardStore } from "../../store/dashboardStore";
import { StatCards } from "./components/StatCards";
import { FilterBar } from "./components/FilterBar";
import { SearchBar } from "./components/SearchBar";
import { QuarryMap } from "./components/QuarryMap";
import { QuarrySidePanel } from "./components/QuarrySidePanel";
import { DataSourcesNote } from "./components/DataSourcesNote";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDateTime } from "../../utils/formatters";

export function DashboardPage() {
  const { quarries, operatorsById, licensesById, isLoading, lastRefreshedAt } = useDashboardData();
  const filters = useDashboardStore((s) => s.filters);
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const selectedQuarryId = useDashboardStore((s) => s.selectedQuarryId);

  const filteredQuarries = useMemo(
    () => filterQuarries(quarries, filters, searchQuery, { operatorsById, licensesById }),
    [quarries, filters, searchQuery, operatorsById, licensesById]
  );

  const selectedQuarry = selectedQuarryId
    ? filteredQuarries.find((q) => q.id === selectedQuarryId) ??
    quarries.find((q) => q.id === selectedQuarryId)
    : undefined;

  if (isLoading) {
    return (
      <div className="space-y-5 p-4 md:p-6">
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 min-w-[10.5rem] flex-1" />
          ))}
        </div>
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      {/* Toolbar: search + data provenance, no page title (the topbar breadcrumb names the page) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-ink/45">
          {lastRefreshedAt && (
            <span>Last updated {formatDateTime(lastRefreshedAt.toISOString())}</span>
          )}
          <span aria-hidden="true">·</span>
          <span>auto-refresh every 5 min</span>
          <span aria-hidden="true">·</span>
          <DataSourcesNote />
        </div>
        <SearchBar />
      </div>

      <StatCards quarries={filteredQuarries} />

      {/* Operations map */}
      <section className="surface-card flex flex-col gap-4 p-4 md:p-5">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-line pb-4 md:flex-row md:items-center">
          <h2 className="font-heading text-lg font-bold text-brand-900">
            Interactive Operations Map
          </h2>
          <div className="shrink-0">
            <FilterBar />
          </div>
        </div>

        <div className="relative h-[480px] w-full overflow-hidden rounded-xl ring-1 ring-inset ring-neutral-border">
          <QuarryMap
            quarries={filteredQuarries}
            selectedDistrict={filters.districts.length === 1 ? filters.districts[0] : null}
            onDistrictSelect={(district) => {
              const store = useDashboardStore.getState();
              // `null` comes from the map's "Reset view" control — drop the district filter.
              if (district === null) store.setFilters({ districts: [] });
              else store.toggleArrayFilter("districts", district as any);
            }}
          />
          <QuarrySidePanel
            quarry={selectedQuarry}
            operator={selectedQuarry ? operatorsById.get(selectedQuarry.operatorId) : undefined}
            license={selectedQuarry ? licensesById.get(selectedQuarry.id) : undefined}
          />
        </div>
      </section>
    </div>
  );
}
