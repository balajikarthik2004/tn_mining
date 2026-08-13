import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-linear-to-b from-brand-700 to-brand-900 text-white shadow-card ring-1 ring-inset ring-white/15 hover:from-brand-600 hover:to-brand-800 hover:shadow-card-hover active:translate-y-px",
  secondary:
    "bg-neutral-surface text-brand-900 shadow-card ring-1 ring-inset ring-neutral-border hover:bg-brand-50 hover:ring-brand-200 active:translate-y-px",
  ghost: "text-brand-700 hover:bg-brand-50 hover:text-brand-900",
  danger:
    "bg-linear-to-b from-red-500 to-red-600 text-white shadow-card ring-1 ring-inset ring-white/15 hover:from-red-500 hover:to-red-700 hover:shadow-card-hover active:translate-y-px",
  gold:
    "bg-linear-to-b from-gold-400 to-gold-500 text-brand-950 shadow-card ring-1 ring-inset ring-white/25 hover:from-gold-300 hover:to-gold-400 active:translate-y-px",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "gap-1.5 rounded-lg px-3 py-1.5 text-xs",
  md: "gap-2 rounded-xl px-4 py-2.5 text-sm",
  lg: "gap-2 rounded-xl px-5 py-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
