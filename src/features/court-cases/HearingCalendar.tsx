import { useMemo } from "react";
import type { CourtCase } from "../../types/courtCases";
import { formatDateTime } from "../../utils/formatters";
import { CalendarDays, Gavel } from "lucide-react";

interface Props {
  cases: CourtCase[];
}

export function HearingCalendar({ cases }: Props) {
  const upcomingHearings = useMemo(() => {
    const hearings: { case: CourtCase, hearing: any }[] = [];
    cases.forEach(c => {
      c.hearings.forEach(h => {
        if (new Date(h.date) > new Date() && !h.outcome) {
          hearings.push({ case: c, hearing: h });
        }
      });
    });
    return hearings.sort((a, b) => new Date(a.hearing.date).getTime() - new Date(b.hearing.date).getTime()).slice(0, 10);
  }, [cases]);

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
      <div className="p-4 border-b border-slate-700/50 bg-slate-900/30">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-indigo-400" /> Upcoming Hearings
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {upcomingHearings.map((h, idx) => (
          <div key={idx} className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-indigo-400">{formatDateTime(h.hearing.date)}</span>
              <span className="text-[10px] text-slate-500">{h.case.id}</span>
            </div>
            <p className="text-sm font-medium text-slate-200 truncate">{h.case.quarryName}</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
              <Gavel className="w-3.5 h-3.5" />
              <span className="truncate">{h.hearing.court}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 border-t border-slate-700/50 pt-2 flex justify-between">
              <span>Counsel:</span>
              <span className="text-slate-300 font-medium">{h.hearing.lawyer}</span>
            </div>
          </div>
        ))}
        {upcomingHearings.length === 0 && (
          <div className="text-center text-slate-500 p-8">No upcoming hearings scheduled.</div>
        )}
      </div>
    </div>
  );
}
