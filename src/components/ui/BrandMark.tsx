interface BrandMarkProps {
  className?: string;
}

/** Simple gopuram (temple tower) silhouette — echoes the favicon, reads as an official TN mark. */
export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <path d="M24 6 L31 17 H17 Z" fill="currentColor" />
      <rect x="15" y="17" width="18" height="17" fill="currentColor" />
      <rect x="20" y="23" width="8" height="11" fill="var(--brand-mark-cutout, #5C0A1E)" />
      <rect x="12" y="34" width="24" height="4" rx="0.5" fill="currentColor" />
    </svg>
  );
}
