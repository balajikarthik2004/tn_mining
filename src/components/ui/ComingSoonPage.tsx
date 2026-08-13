import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  icon: LucideIcon;
  description: string;
}

/** Shared placeholder shown for the not-yet-built features. */
export function ComingSoonPage({ title, icon: Icon, description }: ComingSoonPageProps) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="relative w-full max-w-lg animate-fade-up overflow-hidden rounded-3xl bg-neutral-surface p-10 text-center shadow-card ring-1 ring-inset ring-neutral-border">
        <span
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-brand-800 text-white shadow-card">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>

        <h1 className="relative mt-5 font-heading text-2xl font-extrabold text-brand-900">{title}</h1>

        <span className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-600 ring-1 ring-inset ring-gold-300/60">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Coming soon
        </span>

        <p className="relative mx-auto mt-4 max-w-sm text-sm leading-relaxed text-neutral-ink/60">
          {description}
        </p>
      </div>
    </div>
  );
}
