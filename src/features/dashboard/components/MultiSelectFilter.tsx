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
        className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
          selected.length
            ? "border-brand-700 bg-brand-50 text-brand-900"
            : "border-neutral-border bg-neutral-surface text-neutral-ink/80 hover:border-brand-700/40"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="rounded-full bg-brand-900 px-1.5 py-0.5 text-[10px] font-bold text-white">{selected.length}</span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="absolute left-0 z-20 mt-1 max-h-64 w-56 overflow-y-auto rounded-md border border-neutral-border bg-neutral-surface p-2 shadow-lg">
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gold-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
                className="h-3.5 w-3.5 accent-brand-900"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
