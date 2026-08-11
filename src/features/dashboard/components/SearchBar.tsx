import { Search, X } from "lucide-react";
import { useDashboardStore } from "../../../store/dashboardStore";

export function SearchBar() {
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-ink/40"
        aria-hidden="true"
      />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search quarry, operator, or license no."
        aria-label="Search quarries"
        className="w-full rounded-md border border-neutral-border bg-neutral-surface py-2 pl-9 pr-8 text-sm outline-none transition-colors focus:border-brand-700 focus:ring-2 focus:ring-gold-500/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-ink/40 hover:bg-brand-50 hover:text-brand-900"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
