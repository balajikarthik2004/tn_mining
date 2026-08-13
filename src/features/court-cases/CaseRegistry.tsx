import { useState } from "react";
import { Link } from "react-router-dom";
import type { CourtCase } from "../../types/courtCases";
import { formatDate, formatINR } from "../../utils/formatters";
import { Search, Filter, ChevronRight, Scale } from "lucide-react";

interface Props {
  cases: CourtCase[];
}

export function CaseRegistry({ cases }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCases = cases.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.quarryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-neutral-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-4 sm:px-6 py-4 border-b border-neutral-border flex flex-wrap gap-4 justify-between items-center bg-neutral-surface shrink-0">
        <h3 className="font-bold text-brand-900 flex items-center gap-2 text-sm">
          <Scale className="w-4 h-4 text-brand-500" />
          Active Legal Registry
        </h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-ink/40" />
            <input
              type="text"
              placeholder="Search Case ID or Quarry..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-neutral-border rounded-lg pl-9 pr-4 py-2 text-sm text-brand-900 placeholder-neutral-ink/40 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 w-full sm:w-64 transition-all"
            />
          </div>
          <button className="px-3 py-2 rounded-lg border border-neutral-border bg-white text-brand-900 hover:bg-neutral-50 transition-colors flex items-center justify-center shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar bg-white">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="text-[10px] uppercase bg-neutral-surface text-neutral-ink/50 sticky top-0 z-10 font-black tracking-widest border-b border-neutral-border shadow-sm">
            <tr>
              <th className="px-6 py-4">Case Details</th>
              <th className="px-6 py-4">Entity / Quarry</th>
              <th className="px-6 py-4">Infraction</th>
              <th className="px-6 py-4">Current Status</th>
              <th className="px-6 py-4 text-right">Penalty Assessed</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {filteredCases.slice(0, 50).map(c => (
              <tr key={c.id} className="hover:bg-neutral-50 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <span className="font-bold text-brand-900 block">{c.id}</span>
                  <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mt-0.5">{formatDate(c.violationDate)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-brand-900 font-bold block truncate max-w-[200px]">{c.quarryName}</span>
                  <span className="text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mt-0.5">{c.district}</span>
                </td>
                <td className="px-6 py-4 text-brand-900 text-xs font-bold">{c.violationType}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                    c.status === "Collected" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    c.status === "Written Off" ? "bg-neutral-surface text-neutral-ink/50 border-neutral-border" :
                    c.status === "Violation Detected" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-brand-900 block">{formatINR(c.penaltyAmount)}</span>
                  {c.status !== "Collected" && c.status !== "Written Off" && c.penaltyAmount > 0 && (
                     <span className="block text-[10px] font-bold uppercase tracking-widest text-red-600 mt-0.5">Pend: {formatINR(c.penaltyAmount - c.amountPaid)}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/court-cases/${c.id}`} className="inline-flex p-2 rounded-lg text-neutral-ink/40 group-hover:text-brand-700 group-hover:bg-brand-50 border border-transparent group-hover:border-brand-200 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Scale className="w-8 h-8 text-neutral-ink/20 mx-auto mb-3" />
                  <p className="text-brand-900 font-bold text-sm">No cases found.</p>
                  <p className="text-neutral-ink/50 text-xs mt-1">Adjust search terms or filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
