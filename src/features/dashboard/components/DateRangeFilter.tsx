import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DateRange } from "../../../store/dashboardStore";

interface DateRangeFilterProps {
  label: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ label, value, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = Boolean(value.from || value.to);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "border-brand-700 bg-brand-50 text-brand-900"
            : "border-neutral-border bg-neutral-surface text-neutral-ink/80 hover:border-brand-700/40"
        }`}
      >
        {label}
        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-brand-900" aria-hidden="true" />}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="absolute left-0 z-20 mt-1 w-64 space-y-2 rounded-md border border-neutral-border bg-neutral-surface p-3 shadow-lg">
          <label className="block text-xs font-medium text-neutral-ink/60">
            From
            <input
              type="date"
              value={value.from ?? ""}
              onChange={(e) => onChange({ ...value, from: e.target.value || null })}
              className="mt-1 w-full rounded border border-neutral-border px-2 py-1 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-neutral-ink/60">
            To
            <input
              type="date"
              value={value.to ?? ""}
              onChange={(e) => onChange({ ...value, to: e.target.value || null })}
              className="mt-1 w-full rounded border border-neutral-border px-2 py-1 text-sm"
            />
          </label>
          {isActive && (
            <button
              type="button"
              onClick={() => onChange({ from: null, to: null })}
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
