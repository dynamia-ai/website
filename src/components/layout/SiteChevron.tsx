interface SiteChevronProps {
  /** Visual size in pixels. FAQ uses 18. */
  size?: number;
}

/** Decorative disclosure chevron used by homepage FAQ summaries. */
export default function SiteChevron({size = 18}: SiteChevronProps) {
  return (
    <svg
      className="site-chevron"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden={true}
      focusable="false"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
