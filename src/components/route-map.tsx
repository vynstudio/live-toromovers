"use client";

// Route panel for the /quote wizard. Embeds a live Google Map via the
// Maps Embed API (free — no per-load billing): directions mode when both
// addresses are set, place mode for a single address. Gated on
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — falls back to a clean placeholder while
// addresses are empty or the key is missing, so the layout holds either way.

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Props = { from: string; to: string };

function embedUrl(from: string, to: string): string | null {
  if (!KEY) return null;
  if (from && to) {
    return (
      `https://www.google.com/maps/embed/v1/directions?key=${KEY}` +
      `&origin=${encodeURIComponent(from)}` +
      `&destination=${encodeURIComponent(to)}` +
      `&mode=driving`
    );
  }
  const q = from || to;
  if (q) {
    return `https://www.google.com/maps/embed/v1/place?key=${KEY}&q=${encodeURIComponent(q)}`;
  }
  return null;
}

export function RouteMap({ from, to }: Props) {
  const url = embedUrl(from, to);

  if (url) {
    return (
      <div className="route-map route-map--live">
        <iframe
          title="Route map"
          className="route-map-frame"
          src={url}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="route-map">
      <div className="route-map-inner">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <p>{from && to ? `${from}  →  ${to}` : from || to || ""}</p>
        <span className="route-map-hint">
          {KEY
            ? "Your route map appears here as you enter addresses."
            : "Live route map activates once the Google Maps key is added."}
        </span>
      </div>
    </div>
  );
}
