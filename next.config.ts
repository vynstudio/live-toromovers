import type { NextConfig } from "next";

// Stopgap: the Meta ads point at landing-page routes that existed on the old
// site but not on this rebuild, so paid traffic was hitting 404s. Send those
// paths to the homepage (which has the quote form) until dedicated LPs are
// rebuilt. Temporary (307) on purpose — so swapping in real LPs later isn't
// blocked by cached permanent redirects. Query strings (UTMs) are preserved.
const AD_LANDING_PATHS = [
  "/movers-orlando-lp",
  "/orlando-movers",
  "/loading-help",
  "/quote",
  "/get-quote",
  "/lp",
  "/funnel",
  "/move-details",
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
      { source: "/ads/:path*", destination: "/", permanent: false },
      { source: "/es/:path*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
