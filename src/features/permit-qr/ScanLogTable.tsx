import { useMemo, useState } from "react";
import { Search, ShieldCheck, ShieldAlert, List } from "lucide-react";
import type { ScanEvent } from "../../types/permit";
import { formatDateTime } from "../../utils/formatters";

interface Props {
  scans: ScanEvent[];
}

const FILTERS = ["All", "Valid", "Invalid"] as const;
/** Rows rendered at once — the count is disclosed under the table rather than truncating silently. */
const ROW_LIMIT = 100;

export function ScanLogTable({ scans }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filteredScans = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return scans.filter((s) => {
      const matchesSearch =
        !needle ||
        s.permitId.toLowerCase().includes(needle) ||
        s.scannedByOfficer.toLowerCase().includes(needle) ||
        s.location.name.toLowerCase().includes(needle) ||
        (s.quarryName?.toLowerCase().includes(needle) ?? false);
      const matchesFilter = filter === "All" || s.result === filter;
      return matchesSearch && matchesFilter;
    });
  }, [scans, searchTerm, filter]);

  const visibleScans = filteredScans.slice(0, ROW_LIMIT);

  return (
    <div className="surface-card flex h-[520px] flex-col overflow-hidden">
      <div className="shrink-0 border-b border-neutral-line px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-heading text-[15px] font-bold text-brand-900">
              <List className="h-4 w-4 text-brand-500" />
              Checkpost scan ledger
            </h3>
            <p className="mt-0.5 text-xs text-neutral-ink/50">
              Every e-Pass scan recorded today, newest first
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest ring-1 ring-inset transition-all ${filter === level
                  ? "bg-brand-900 text-white ring-brand-900"
                  : "bg-neutral-surface text-neutral-ink/55 ring-neutral-border hover:text-brand-900"
                  }`}
              >
                {level === "Invalid" ? "Rejected" : level === "Valid" ? "Cleared" : "All"}
              </button>
            ))}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-ink/35" />
              <input
                type="text"
                placeholder="e-Pass, quarry, officer or post…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-neutral-border bg-neutral-surface py-2 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-neutral-ink/40 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 sm:w-72"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-neutral-subtle/95 text-[11px] uppercase tracking-[0.08em] text-neutral-ink/50 backdrop-blur-sm">
              <th className="border-b border-neutral-border px-5 py-3 font-bold">e-Pass</th>
              <th className="border-b border-neutral-border px-5 py-3 font-bold">Time</th>
              <th className="border-b border-neutral-border px-5 py-3 font-bold">Checkpost</th>
              <th className="border-b border-neutral-border px-5 py-3 font-bold">Officer</th>
              <th className="border-b border-neutral-border px-5 py-3 font-bold">Result</th>
            </tr>
          </thead>
          <tbody>
            {visibleScans.map((scan) => (
              <tr
                key={scan.id}
                className="border-b border-neutral-line transition-colors last:border-0 hover:bg-brand-50/40"
              >
                <td className="px-5 py-3">
                  <span className="rounded-md border border-neutral-border bg-neutral-subtle px-2 py-1 font-mono text-xs font-semibold text-brand-900">
                    {scan.permitId}
                  </span>
                  <span className="mt-1 block truncate text-[11px] font-semibold text-neutral-ink/45">
                    {scan.quarryName ?? "No matching quarry record"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 tabular-nums text-neutral-ink/70">
                  {formatDateTime(scan.timestamp)}
                </td>
                <td className="px-5 py-3 font-semibold text-brand-900">{scan.location.name}</td>
                <td className="px-5 py-3 text-neutral-ink/70">{scan.scannedByOfficer}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset ${scan.result === "Valid"
                      ? "bg-status-compliant/10 text-emerald-700 ring-status-compliant/25"
                      : "bg-status-violation/10 text-red-700 ring-status-violation/25"
                      }`}
                  >
                    {scan.result === "Valid" ? (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    ) : (
                      <ShieldAlert className="h-3.5 w-3.5" />
                    )}
                    {scan.result === "Valid" ? "Cleared" : "Rejected"}
                  </span>
                  {scan.invalidReason && (
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-red-600/80">
                      {scan.invalidReason}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredScans.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-neutral-ink/50">
            <Search className="mb-3 h-8 w-8 opacity-20" />
            <p className="text-sm font-semibold">No scans match those criteria.</p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-neutral-line bg-neutral-subtle/50 px-5 py-2.5 text-[11px] font-semibold text-neutral-ink/50">
        Showing {visibleScans.length.toLocaleString("en-IN")} of{" "}
        {filteredScans.length.toLocaleString("en-IN")} scans
        {filteredScans.length > ROW_LIMIT && " — refine the search to see the rest"}
      </div>
    </div>
  );
}
