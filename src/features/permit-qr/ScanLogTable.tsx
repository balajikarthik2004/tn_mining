import { useState } from "react";
import type { ScanEvent } from "../../types/permit";
import { formatDateTime } from "../../utils/formatters";
import { Search, Filter, ShieldCheck, ShieldAlert } from "lucide-react";

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
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-700/50 bg-slate-900/30 shrink-0">
        <h3 className="font-bold text-slate-100 flex items-center gap-2 mb-4">
          Scan Event Audit Log
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Permit ID or Officer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-lg px-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm text-slate-200 focus:outline-none py-2 pr-4 cursor-pointer"
            >
              <option value="All">All Scans</option>
              <option value="Valid">Valid Only</option>
              <option value="Invalid">Invalid Only</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-slate-300 min-w-[700px]">
          <thead className="text-xs uppercase bg-slate-900/50 text-slate-400 sticky top-0 z-10 shadow-sm border-b border-slate-700/50 backdrop-blur">
            <tr>
              <th className="px-4 py-3 font-medium">Permit ID</th>
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Officer</th>
              <th className="px-4 py-3 font-medium">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredScans.slice(0, 100).map(scan => (
              <tr key={scan.id} className="hover:bg-slate-750/30 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-200">{scan.permitId}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(scan.timestamp)}</td>
                <td className="px-4 py-3">{scan.location.name}</td>
                <td className="px-4 py-3">{scan.scannedByOfficer}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    scan.result === "Valid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {scan.result === "Valid" ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {scan.result}
                  </span>
                  {scan.invalidReason && (
                    <span className="block mt-1 text-[10px] text-red-400/80 font-medium uppercase tracking-wider">
                      {scan.invalidReason}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredScans.length === 0 && (
          <div className="p-8 text-center text-slate-500">No scan events found matching criteria.</div>
        )}
      </div>
    </div>
  );
}
