import type { NextConfig } from "next";

// Legacy Meta/PPC landing slugs from the old site, now rebuilt as the dedicated
// paid LP at /ads/meta-orlando-movers (split hero + inline step-1 quote form).
// Previously these 307'd to "/" as a 404 stopgap; now they point at the real ad
// LP so paid traffic keeps message-match and the above-fold form. Still 307
// (temporary) on purpose until Ads Manager Final URLs are updated to the new
// path — then flip to permanent:true (301). Query strings (UTMs/fbclid) are
// preserved. "/orlando-movers" stays out — it is a real indexed SEO city page.
const AD_LP = "/ads/meta-orlando-movers";
const AD_LANDING_PATHS = [
  "/movers-orlando-lp",
  "/loading-help",
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

// Oldest URL pattern from the original static site: /pages/cities/{slug} and
// /pages/cities/{slug}.html (e.g. /pages/cities/orlando-movers.html). They 404
// today and Google reports them as "Crawled - currently not indexed". Each
// {slug} maps 1:1 to the canonical /{slug} city page (200), so 301 to
// consolidate link equity and clear the GSC issue. Literal sources (no
// path-to-regexp regex params) for forward-compat with this Next version.
const CITY_SLUGS = [
  "orlando-movers", "lake-mary-movers", "winter-park-movers", "kissimmee-movers",
  "sanford-movers", "clermont-movers", "oviedo-movers", "winter-garden-movers",
  "altamonte-springs-movers", "apopka-movers", "st-cloud-movers", "windermere-movers",
  "maitland-movers", "davenport-movers",
];
const PAGES_CITIES_REDIRECTS = CITY_SLUGS.flatMap((slug) => [
  { source: `/pages/cities/${slug}`, destination: `/${slug}`, permanent: true },
  { source: `/pages/cities/${slug}.html`, destination: `/${slug}`, permanent: true },
]);

// Service-area cities listed in the LocalBusiness schema / county area lists
// (see SERVICE_CITIES / AREAS_BY_COUNTY in src/lib/content.ts) that do NOT have
// a dedicated /{city}-movers page. Google builds /{city}-movers from the URL
// pattern and they 404 — GSC "Not found (404)" (confirmed: /casselberry-movers).
// 301 to the regional hub (the closest relevant live page). permanent:true
// clears the 404; deleting an entry later lets a real city page take over.
// None of these slugs collide with the 14 real city pages, so no page is shadowed.
const NO_PAGE_CITY_SLUGS = [
  "casselberry-movers", "longwood-movers", "celebration-movers", "poinciana-movers",
  "ocoee-movers", "mount-dora-movers", "leesburg-movers", "tavares-movers",
  "minneola-movers",
];
const NO_PAGE_CITY_REDIRECTS = NO_PAGE_CITY_SLUGS.map((slug) => ({
  source: `/${slug}`, destination: "/central-florida-movers", permanent: true,
}));

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
        destination: AD_LP,
        permanent: false,
      })),
      { source: "/quote-lp/:path*", destination: AD_LP, permanent: false },
      // Quote-intent slug → full wizard (not the ad LP) since intent is explicit.
      { source: "/get-quote", destination: "/quote", permanent: false },
      // Old destinations still live in paused Meta ads (winner "Quote LP"
      // campaign). Without these they 404 on reactivation. Query strings
      // (UTMs/fbclid) are preserved automatically. "/mudanza" is a Spanish ad.
      { source: "/moving", destination: AD_LP, permanent: false },
      { source: "/mudanza", destination: "/es/ads/meta-orlando-movers", permanent: false },
      ...LEGACY_CONTENT.map((r) => ({ ...r, permanent: false })),
      ...CITY_LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true })),
      ...PAGES_CITIES_REDIRECTS,
      ...NO_PAGE_CITY_REDIRECTS,
    ];
  },
};

export default nextConfig;