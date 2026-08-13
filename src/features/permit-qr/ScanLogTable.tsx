import { useState } from "react";
import type { ScanEvent } from "../../types/permit";
import { formatDateTime } from "../../utils/formatters";
import { Search, Filter, ShieldCheck, ShieldAlert, List } from "lucide-react";

interface Props {
  scans: ScanEvent[];
}

export function ScanLogTable({ scans }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"All" | "Valid" | "Invalid">("All");

  const filteredScans = scans.filter(s => {
    const matchesSearch = s.permitId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.scannedByOfficer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" || s.result === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white border border-neutral-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[500px]">
      <div className="p-4 sm:px-6 border-b border-neutral-border bg-neutral-surface shrink-0">
        <h3 className="font-bold text-brand-900 flex items-center gap-2 mb-4">
          <List className="w-5 h-5 text-brand-500" />
          Checkpost Scan Ledger
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-ink/40" />
            <input
              type="text"
              placeholder="Search by e-Pass ID or Officer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-neutral-border rounded-lg pl-9 pr-4 py-2 text-sm text-brand-900 placeholder-neutral-ink/40 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-border rounded-lg px-2 shrink-0 shadow-sm">
            <Filter className="w-4 h-4 text-neutral-ink/40 ml-2" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm font-bold text-brand-900 focus:outline-none py-2 pr-4 cursor-pointer"
            >
              <option value="All">All Scans</option>
              <option value="Valid">Valid Only</option>
              <option value="Invalid">Invalid/Forged Only</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="text-[10px] uppercase tracking-widest bg-white text-neutral-ink/50 sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0] font-black">
            <tr>
              <th className="px-6 py-4">e-Pass ID</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Scanning Officer</th>
              <th className="px-6 py-4">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border/60">
            {filteredScans.slice(0, 100).map(scan => (
              <tr key={scan.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-bold text-brand-900 bg-neutral-surface px-2 py-1 rounded border border-neutral-border">
                    {scan.permitId}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-neutral-ink/80">{formatDateTime(scan.timestamp)}</td>
                <td className="px-6 py-4 font-bold text-brand-900">{scan.location.name}</td>
                <td className="px-6 py-4 font-medium text-neutral-ink/70">{scan.scannedByOfficer}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                    scan.result === "Valid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {scan.result === "Valid" ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {scan.result}
                  </span>
                  {scan.invalidReason && (
                    <span className="block mt-1.5 text-[9px] font-black text-red-600/80 uppercase tracking-widest">
                      Reason: {scan.invalidReason}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredScans.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-neutral-ink/50">
            <Search className="w-8 h-8 mb-3 opacity-20" />
            <p className="font-bold text-sm">No scan events found matching criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
