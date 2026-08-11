import type { LucideIcon } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  icon: LucideIcon;
  description: string;
}

/** Shared placeholder shown for the 9 not-yet-built features. */
export function ComingSoonPage({ title, icon: Icon, description }: ComingSoonPageProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-bold text-brand-900">{title}</h1>
      <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-500 ring-1 ring-inset ring-gold-300">
        Coming soon
      </span>
      <p className="max-w-md text-sm text-neutral-ink/70">{description}</p>
    </div>
  );
}
