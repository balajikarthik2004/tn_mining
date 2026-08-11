import { useState } from "react";
import { Link } from "react-router-dom";
import type { CourtCase } from "../../types/courtCases";
import { formatDate, formatINR } from "../../utils/formatters";
import { Search, Filter, ChevronRight } from "lucide-react";

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
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          Case Registry
        </h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID or Quarry..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-900/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
          <button className="p-1.5 rounded-lg border border-slate-700/50 bg-slate-900/50 text-slate-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-slate-300 min-w-[800px]">
          <thead className="text-xs uppercase bg-slate-900/50 text-slate-400 sticky top-0 z-10 shadow-sm backdrop-blur">
            <tr>
              <th className="px-4 py-3 font-medium">Case ID</th>
              <th className="px-4 py-3 font-medium">Quarry</th>
              <th className="px-4 py-3 font-medium">Violation</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Penalty</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredCases.slice(0, 50).map(c => (
              <tr key={c.id} className="hover:bg-slate-750/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-200">{c.id}</span>
                  <span className="block text-xs text-slate-500">{formatDate(c.violationDate)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-slate-200 block truncate max-w-[150px]">{c.quarryName}</span>
                  <span className="text-xs text-slate-500">{c.district}</span>
                </td>
                <td className="px-4 py-3 text-slate-400">{c.violationType}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    c.status === "Collected" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    c.status === "Written Off" ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
                    c.status === "Violation Detected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-orange-500/10 text-orange-400 border-orange-500/20"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-medium text-slate-200">{formatINR(c.penaltyAmount)}</span>
                  {c.status !== "Collected" && c.status !== "Written Off" && c.penaltyAmount > 0 && (
                     <span className="block text-[10px] text-orange-400">Bal: {formatINR(c.penaltyAmount - c.amountPaid)}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/court-cases/${c.id}`} className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
