import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-neutral-border bg-neutral-surface shadow-sm ${className}`}
      {...props}
    />
  );
}
