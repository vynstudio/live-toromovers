import type { NextConfig } from "next";

// Stopgap: the Meta ads point at landing-page routes that existed on the old
// site but not on this rebuild, so paid traffic was hitting 404s. Send those
// paths to the homepage (which has the quote form) until dedicated LPs are
// rebuilt. Temporary (307) on purpose — so swapping in real LPs later isn't
// blocked by cached permanent redirects. Query strings (UTMs) are preserved.
// "/orlando-movers" deliberately removed from this list — it is now a real
// indexed SEO city page (see src/app/orlando-movers/).
const AD_LANDING_PATHS = [
  "/movers-orlando-lp",
  "/loading-help",
  "/get-quote",
  "/lp",
  "/funnel",
  "/move-details",
];

// Older URL pattern (/movers-{city}) from a still-older version of the site.
// 301-redirect to the now-canonical /{city}-movers pages so any backlinks
// pointing at the old pattern transfer link equity.
const CITY_LEGACY_REDIRECTS = [
  { source: "/movers-orlando", destination: "/orlando-movers" },
  { source: "/movers-lake-mary", destination: "/lake-mary-movers" },
  { source: "/movers-winter-park", destination: "/winter-park-movers" },
];

// Legacy content pages from the prior site, now consolidated into homepage
// sections. Redirect (temporary) so old indexed URLs don't 404 — can be
// rebuilt as full pages later (like the /movers-{city} pages) if needed.
// "/thank-you" deliberately removed — it is now a real post-submit landing page
// (see src/app/thank-you/), used as the final funnel-conversion step.
const LEGACY_CONTENT = [
  { source: "/apartment-moves", destination: "/#services" },
  { source: "/home-moves", destination: "/#services" },
  { source: "/commercial-moves", destination: "/#services" },
  { source: "/about", destination: "/#about" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      ...AD_LANDING_PATHS.map((source) => ({
        source,
        destination: "/",
        permanent: false,
      })),
      { source: "/quote-lp/:path*", destination: "/", permanent: false },
      ...LEGACY_CONTENT.map((r) => ({ ...r, permanent: false })),
      ...CITY_LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true })),
    ];
  },
};

export default nextConfig;