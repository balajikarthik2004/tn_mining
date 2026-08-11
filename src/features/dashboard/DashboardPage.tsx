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
import { DistrictStructureSection } from "./components/DistrictStructureSection";

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

      <div className="shrink-0">
        <FilterBar />
      </div>

      <div className="relative min-h-[420px] shrink-0 overflow-hidden rounded-lg border border-neutral-border">
        <QuarryMap quarries={filteredQuarries} />
        <QuarrySidePanel
          quarry={selectedQuarry}
          operator={selectedQuarry ? operatorsById.get(selectedQuarry.operatorId) : undefined}
          license={selectedQuarry ? licensesById.get(selectedQuarry.id) : undefined}
        />
      </div>

      {/* New District Structure Section at the bottom */}
      <div className="mt-8 shrink-0">
        <DistrictStructureSection 
          quarries={quarries} 
        />
      </div>
    </div>
  );
}
