import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a hover lift — use for cards that are clickable/linked. */
  interactive?: boolean;
}

export function Card({ className = "", interactive = false, ...props }: CardProps) {
  return (
    <div
      className={`surface-card ${interactive
        ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
        : ""
        } ${className}`}
      {...props}
    />
  );
}

/** Optional header strip for a Card — title + subtitle on the left, actions on the right. */
export function CardHeader({
  title,
  subtitle,
  actions,
  className = "",
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-b border-neutral-line px-5 py-4 ${className}`}
    >
      <div className="min-w-0">
        <h3 className="font-heading text-[15px] font-bold text-brand-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-neutral-ink/55">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
