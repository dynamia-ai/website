interface SiteArrowProps {
  /**
   * `button`: short right arrow for primary CTAs.
   * `text`: same glyph for internal `.textlink` rows.
   * `link`: northeast arrow for external / leave-site links.
   * `down`: in-page jump (e.g. scroll to a section).
   * `back`: left arrow for return / back links (place before the label).
   */
  variant?: 'button' | 'text' | 'link' | 'down' | 'back';
}

const PATHS = {
  button: 'M3 8h9M8.5 4.5 12 8l-3.5 3.5',
  text: 'M3 8h9M8.5 4.5 12 8l-3.5 3.5',
  link: 'M4.5 11.5L11.5 4.5M7 4.5h4.5V9',
  down: 'M8 3v9M4.5 8.5 8 12l3.5-3.5',
  back: 'M13 8H4M7.5 4.5 4 8l3.5 3.5',
} as const;

export default function SiteArrow({variant = 'button'}: SiteArrowProps) {
  return (
    <span className={`site-arrow site-arrow--${variant}`} aria-hidden={true}>
      <svg viewBox="0 0 16 16" focusable="false">
        <path
          d={PATHS[variant]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
