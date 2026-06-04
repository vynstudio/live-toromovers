import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/cities";

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
    { url: `${BASE}/checklist`, priority: 0.7, changeFrequency: "monthly" as const },
  ];

  // City SEO landing pages — kept indexed, carried over from the prior site.
  const cities = CITIES.map((c) => ({
    url: `${BASE}${c.href}`,
    priority: 0.9 as const,
    changeFrequency: "monthly" as const,
  }));

  return [...pages, ...cities].map((p) => ({ ...p, lastModified: now }));
}
