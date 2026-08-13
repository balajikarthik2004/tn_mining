import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface MultiSelectFilterProps<T extends string> {
  label: string;
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
}

/** Small checkbox dropdown used for District / Mineral Type / Status filters. */
export function MultiSelectFilter<T extends string>({ label, options, selected, onToggle }: MultiSelectFilterProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150 ring-1 ring-inset ${selected.length
          ? "bg-brand-50 text-brand-800 ring-brand-300"
          : "bg-neutral-surface text-neutral-ink/70 ring-neutral-border hover:text-brand-800 hover:ring-brand-200"
          }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{selected.length}</span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="absolute left-0 z-20 mt-1.5 max-h-64 w-56 animate-fade-up overflow-y-auto rounded-xl bg-neutral-surface p-2 shadow-panel ring-1 ring-inset ring-neutral-border">
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-ink/80 transition-colors hover:bg-brand-50 hover:text-brand-900"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
                className="h-3.5 w-3.5 rounded accent-brand-600"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
