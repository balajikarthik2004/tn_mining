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
    ? filteredQuarries.find((q) => q.id === selectedQuarryId) ?? quarries.find((q) => q.id === selectedQuarryId)
    : undefined;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 min-w-40 flex-1" />
          ))}
        </div>
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6 overflow-y-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-brand-900">Quarry Map Dashboard</h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-ink/50">
            {lastRefreshedAt && <span>Last updated {formatDateTime(lastRefreshedAt.toISOString())}</span>}
            <span aria-hidden="true">·</span>
            <DataSourcesNote />
          </div>
        </div>
        <SearchBar />
      </div>

      <div className="shrink-0">
        <StatCards quarries={filteredQuarries} />
      </div>

      {/* District Structure Section */}
      {/* <div className="shrink-0">
        <DistrictStructureSection 
          quarries={filteredQuarries} 
        />
      </div> */}

      {/* Operations Map Section */}
      <div className="w-full rounded-2xl bg-white p-4 md:p-6 border border-slate-200 shadow-sm flex flex-col gap-4 mt-2 shrink-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-brand-900">
              Interactive Operations Map
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Detailed view of mining leases, active violations, and real-time telemetry
            </p>
          </div>
          <div className="flex-shrink-0">
            <FilterBar />
          </div>
        </div>

        <div className="relative h-[450px] w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-inner">
          <QuarryMap 
            quarries={filteredQuarries} 
            selectedDistrict={filters.districts.length === 1 ? filters.districts[0] : null}
            onDistrictSelect={(district) => {
              if (district) {
                const toggleArrayFilter = useDashboardStore.getState().toggleArrayFilter;
                toggleArrayFilter("districts", district as any);
              }
            }}
          />
          <QuarrySidePanel
            quarry={selectedQuarry}
            operator={selectedQuarry ? operatorsById.get(selectedQuarry.operatorId) : undefined}
            license={selectedQuarry ? licensesById.get(selectedQuarry.id) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
