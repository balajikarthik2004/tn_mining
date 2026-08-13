interface BrandMarkProps {
  className?: string;
}

/**
 * Gopuram (temple tower) silhouette — echoes the favicon, reads as an official TN mark.
 * Drawn as one path with a doorway notch so it needs no background-matched cutout
 * colour and works on any surface (light card or dark navy chrome).
 */
export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" aria-hidden="true">
      {/* crowning tier */}
      <path d="M24 4 L32.5 16 H15.5 Z" />
      {/* tower body with doorway notch */}
      <path d="M14.5 18 H33.5 V34 H28 V24.5 H20 V34 H14.5 Z" />
      {/* plinth */}
      <rect x="11" y="35.5" width="26" height="4" rx="1.2" />
    </svg>
  );
}
