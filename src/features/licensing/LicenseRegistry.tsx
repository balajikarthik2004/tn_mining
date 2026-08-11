import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { License } from "../../types/license";
import { Download, Filter, Search, ChevronRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { Quarry } from "../../types/quarry";
import type { Operator } from "../../types/operator";

interface Props {
  licenses: License[];
  quarries: Quarry[];
  operators: Operator[];
}

export function LicenseRegistry({ licenses, quarries, operators }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredLicenses = useMemo(() => {
    return licenses.filter(l => {
      const quarry = quarries.find(q => q.id === l.quarryId);
      const operator = operators.find(o => o.id === quarry?.operatorId);
      
      const searchMatch = 
        l.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quarry?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator?.name.toLowerCase().includes(searchTerm.toLowerCase());
        
      const statusMatch = statusFilter === "All" || l.status === statusFilter;
      
      return searchMatch && statusMatch;
    }).sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [licenses, quarries, operators, searchTerm, statusFilter]);

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search licenses, quarries..."
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              className="pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors cursor-not-allowed opacity-70">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700/50">
            <tr>
              <th className="px-6 py-4 font-medium">License No.</th>
              <th className="px-6 py-4 font-medium">Quarry / Operator</th>
              <th className="px-6 py-4 font-medium">Mineral / District</th>
              <th className="px-6 py-4 font-medium">Expiry Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredLicenses.map(license => {
              const quarry = quarries.find(q => q.id === license.quarryId);
              const operator = operators.find(o => o.id === quarry?.operatorId);
              
              return (
                <tr key={license.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap">
                    {license.licenseNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-200 whitespace-nowrap">{quarry?.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{operator?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-slate-300">{quarry?.mineralType}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{quarry?.district}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-slate-300">{new Date(license.validUntil).toLocaleDateString("en-IN")}</div>
                    {license.daysToExpiry > 0 && license.daysToExpiry <= 90 && (
                      <div className="text-xs text-orange-400 mt-0.5 font-medium">{license.daysToExpiry} days left</div>
                    )}
                    {license.daysToExpiry < 0 && (
                      <div className="text-xs text-red-400 mt-0.5 font-medium">{Math.abs(license.daysToExpiry)} days ago</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      license.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      license.status === "Expiring Soon" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                      license.status === "Expired" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}>
                      {license.status === "Active" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {license.status === "Expiring Soon" && <Clock className="w-3.5 h-3.5" />}
                      {(license.status === "Expired" || license.status === "Suspended") && <AlertCircle className="w-3.5 h-3.5" />}
                      {license.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/licensing/${license.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-indigo-500 hover:text-white transition-all group-hover:scale-110"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            
            {filteredLicenses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No licenses found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
