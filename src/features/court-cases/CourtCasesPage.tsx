import { useState, useEffect } from "react";
import { Scale, Activity } from "lucide-react";
import { getMockCourtCases, mutateCourtCases } from "../../data/mock/courtCaseData";
import { PenaltyCollectionDashboard } from "./PenaltyCollectionDashboard";
import { CaseRegistry } from "./CaseRegistry";
import { HearingCalendar } from "./HearingCalendar";

export function CourtCasesPage() {
  const [cases, setCases] = useState(() => getMockCourtCases());

  useEffect(() => {
    const interval = setInterval(() => {
      setCases([...mutateCourtCases()]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-400" />
            Court Case & Penalty Tracker
          </h1>
          <p className="text-slate-400 mt-2">
            Manage the lifecycle of enforcement cases, track legal hearings, and monitor penalty collections.
          </p>
        </div>
        <div className="hidden md:flex bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Collection Feed
        </div>
      </div>

      <PenaltyCollectionDashboard cases={cases} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CaseRegistry cases={cases} />
        </div>
        <div className="lg:col-span-1">
          <HearingCalendar cases={cases} />
        </div>
      </div>
    </div>
  );
}
