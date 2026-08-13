import { useState, useEffect } from "react";
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
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
        <PenaltyCollectionDashboard cases={cases} />

        <div className="grid h-[600px] grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="flex h-full min-h-0 flex-col lg:col-span-2">
            <CaseRegistry cases={cases} />
          </div>
          <div className="flex h-full min-h-0 flex-col lg:col-span-1">
            <HearingCalendar cases={cases} />
          </div>
        </div>
      </div>
    </div>
  );
}
