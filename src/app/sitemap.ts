import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/cities";
import { SERVICES } from "@/lib/services";
import { GUIDES } from "@/lib/guides";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Real, indexable pages only. Homepage anchors (#services, #faq, …) were
  // removed — they aren't pages and Google flagged them as blank. Funnel/LP
  // routes (/quote, /intake, /thank-you, /ads/*) are intentionally excluded so
  // they don't compete in organic search.
  const pages = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly" as const },
    // Regional hub — main Central Florida landing page.
    { url: `${BASE}/central-florida-movers`, priority: 0.9 as const, changeFrequency: "monthly" as const },
    { url: `${BASE}/blog`, priority: 0.6 as const, changeFrequency: "weekly" as const },
    // /checklist is intentionally noindex (conversion content) — keep it OUT of
    // the sitemap so GSC doesn't report "Submitted URL marked noindex".
    // Lead-magnet LP — indexable, targets local "moving checklist" intent.
    { url: `${BASE}/central-florida-moving-checklist`, priority: 0.85 as const, changeFrequency: "monthly" as const },
    // Labor-only funnel LP — indexable, high-intent "labor only movers" terms.
    { url: `${BASE}/labor-only-moving`, priority: 0.9 as const, changeFrequency: "monthly" as const },
    // Full-service funnel LP — indexable, high-intent "full service movers" terms.
    { url: `${BASE}/full-service-moving`, priority: 0.9 as const, changeFrequency: "monthly" as const },
    // Geo-exact apartment LP — targets the "apartment movers orlando fl" cluster
    // (480/mo, low competition). Richer than the generic /apartment-movers
    // service page; consider consolidating the two (301) to avoid overlap.
    { url: `${BASE}/apartment-movers-orlando-fl`, priority: 0.85 as const, changeFrequency: "monthly" as const },
  ];

  // Blog / guide articles.
  const guides = GUIDES.map((g) => ({
    url: `${BASE}${g.href}`,
    priority: 0.7 as const,
    changeFrequency: "monthly" as const,
  }));

  // Service SEO landing pages. /apartment-movers is excluded — it now 301s to
  // /apartment-movers-orlando-fl (see next.config.ts APARTMENT_REDIRECT), and a
  // redirecting URL must not sit in the sitemap. The dedicated apartment LP is
  // already listed in the `pages` array above.
  const services = SERVICES.filter((s) => s.slug !== "apartment-movers").map(
    (s) => ({
      url: `${BASE}${s.href}`,
      priority: 0.85 as const,
      changeFrequency: "monthly" as const,
    }),
  );

  // City SEO landing pages — kept indexed, carried over from the prior site.
  const cities = CITIES.map((c) => ({
    url: `${BASE}${c.href}`,
    priority: 0.8 as const,
    changeFrequency: "monthly" as const,
  }));

  return [...pages, ...services, ...cities, ...guides].map((p) => ({ ...p, lastModified: now }));
}
