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
    <div className="bg-white border border-neutral-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-4 sm:px-6 py-4 border-b border-neutral-border bg-neutral-surface flex justify-between items-center shrink-0">
        <h3 className="font-bold text-brand-900 flex items-center gap-2 text-sm">
          <CalendarDays className="w-4 h-4 text-brand-500" /> Upcoming Hearings
        </h3>
        <span className="bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-brand-200 shadow-sm">
          {upcomingHearings.length} Scheduled
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-white">
        {upcomingHearings.map((h, idx) => (
          <div key={idx} className="p-4 bg-white border border-neutral-border hover:border-brand-300 hover:shadow-md rounded-xl transition-all cursor-pointer group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
            <div className="flex justify-between items-start mb-2 pl-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-500 bg-brand-50 px-2 py-1 rounded border border-brand-100">{formatDateTime(h.hearing.date)}</span>
              <span className="text-[10px] font-bold text-neutral-ink/40 uppercase tracking-widest">{h.case.id}</span>
            </div>
            <p className="text-sm font-bold text-brand-900 truncate pl-2 mt-2">{h.case.quarryName}</p>
            <div className="flex items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-widest text-neutral-ink/60 pl-2">
              <Gavel className="w-3.5 h-3.5" />
              <span className="truncate">{h.hearing.court}</span>
            </div>
            <div className="mt-3 bg-neutral-surface rounded-lg p-2.5 text-[10px] font-bold text-neutral-ink/50 border border-neutral-border flex justify-between ml-2">
              <span className="uppercase tracking-widest">Standing Counsel</span>
              <span className="text-brand-900">{h.hearing.lawyer}</span>
            </div>
          </div>
        ))}
        {upcomingHearings.length === 0 && (
          <div className="text-center text-neutral-ink/50 p-8">
            <CalendarDays className="w-8 h-8 text-neutral-ink/20 mx-auto mb-3" />
            <p className="font-bold text-sm text-brand-900">No upcoming hearings scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
}
