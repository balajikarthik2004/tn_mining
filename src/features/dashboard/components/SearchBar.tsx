import { Search, X } from "lucide-react";
import { useDashboardStore } from "../../../store/dashboardStore";

export function SearchBar() {
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery);

  return (
    <div className="group relative w-full sm:max-w-sm">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-ink/35 transition-colors group-focus-within:text-brand-500"
        aria-hidden="true"
      />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search quarry, operator, or license no."
        aria-label="Search quarries"
        className="w-full rounded-xl border border-neutral-border bg-neutral-surface py-2.5 pl-10 pr-9 text-sm font-medium placeholder:font-normal placeholder:text-neutral-ink/40 outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12 [&::-webkit-search-cancel-button]:hidden"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-ink/40 transition-colors hover:bg-brand-50 hover:text-brand-900"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
