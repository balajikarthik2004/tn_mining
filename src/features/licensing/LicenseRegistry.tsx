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
    <div className="flex flex-col h-full bg-white relative">
      {/* Toolbar */}
      <div className="p-4 sm:px-6 border-b border-neutral-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-surface shrink-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-ink/40" />
            <input
              type="text"
              placeholder="Search licenses, quarries, operators..."
              className="pl-9 pr-4 py-2 bg-white border border-neutral-border rounded-lg text-sm text-brand-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 w-full transition-all shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-ink/40" />
            <select
              className="pl-9 pr-8 py-2 bg-white border border-neutral-border rounded-lg text-sm text-brand-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none shadow-sm cursor-pointer w-full sm:w-auto font-medium"
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
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-border rounded-lg text-sm text-brand-900 font-bold shadow-sm transition-colors cursor-not-allowed opacity-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-neutral-ink/50 uppercase tracking-widest bg-white sticky top-0 z-10 font-black shadow-[0_1px_0_0_#e2e8f0]">
            <tr>
              <th className="px-6 py-4">License No.</th>
              <th className="px-6 py-4">Quarry & Operator</th>
              <th className="px-6 py-4">Mineral Area</th>
              <th className="px-6 py-4">Expiry Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border/60">
            {filteredLicenses.map(license => {
              const quarry = quarries.find(q => q.id === license.quarryId);
              const operator = operators.find(o => o.id === quarry?.operatorId);
              
              return (
                <tr key={license.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-brand-900 bg-neutral-surface px-2 py-1 rounded border border-neutral-border">
                      {license.licenseNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-900 whitespace-nowrap">{quarry?.name}</div>
                    <div className="text-xs font-medium text-neutral-ink/60 mt-0.5">{operator?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-neutral-ink/80">{quarry?.mineralType}</div>
                    <div className="text-xs font-medium text-neutral-ink/60 mt-0.5">{quarry?.district}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-brand-900">{new Date(license.validUntil).toLocaleDateString("en-IN")}</div>
                    {license.daysToExpiry > 0 && license.daysToExpiry <= 90 && (
                      <div className="text-xs text-amber-600 mt-0.5 font-bold uppercase tracking-wider">{license.daysToExpiry} days left</div>
                    )}
                    {license.daysToExpiry < 0 && (
                      <div className="text-xs text-red-600 mt-0.5 font-bold uppercase tracking-wider">Expired {Math.abs(license.daysToExpiry)}d ago</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                      license.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      license.status === "Expiring Soon" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      license.status === "Expired" ? "bg-neutral-100 text-neutral-ink/60 border-neutral-border" :
                      "bg-red-50 text-red-700 border-red-200"
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
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-surface border border-neutral-border text-neutral-ink/40 hover:bg-brand-900 hover:text-white hover:border-brand-900 transition-all group-hover:shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            
            {filteredLicenses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-neutral-ink/50">
                    <Search className="w-8 h-8 mb-3 opacity-20" />
                    <p className="font-bold text-sm">No licenses found matching your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
