// Stand-in for MLS® photos while running on sample data. When the live feed is
// connected, swap the body for <Image> pointed at the feed's photo CDN.

const HUES = [205, 160, 25, 265, 340, 45, 190];

export function ListingPhoto({
  seed,
  index = 0,
  label,
  className = "",
  badge = true,
}: {
  seed: string;
  index?: number;
  label?: string;
  className?: string;
  badge?: boolean;
}) {
  const hash = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, index * 7919);
  const hue = HUES[hash % HUES.length];
  return (
    <div
      role="img"
      aria-label={label ?? "Listing photo placeholder"}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 45% 78%), hsl(${(hue + 40) % 360} 40% 58%))` }}
    >
      <svg viewBox="0 0 64 64" className="h-1/3 max-h-24 w-1/3 max-w-24 text-white/80" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M8 30 32 10l24 20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 26v28h36V26" strokeLinejoin="round" />
        <rect x="27" y="38" width="10" height="16" />
      </svg>
      {badge && (
        <span className="absolute bottom-2 right-2 rounded bg-black/30 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
          Sample photo
        </span>
      )}
    </div>
  );
}
