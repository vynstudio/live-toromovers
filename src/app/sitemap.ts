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
    { url: `${BASE}/checklist`, priority: 0.6 as const, changeFrequency: "monthly" as const },
    // Lead-magnet LP — indexable, targets local "moving checklist" intent.
    { url: `${BASE}/central-florida-moving-checklist`, priority: 0.85 as const, changeFrequency: "monthly" as const },
    // Labor-only funnel LP — indexable, high-intent "labor only movers" terms.
    { url: `${BASE}/labor-only-moving`, priority: 0.9 as const, changeFrequency: "monthly" as const },
    // Full-service funnel LP — indexable, high-intent "full service movers" terms.
    { url: `${BASE}/full-service-moving`, priority: 0.9 as const, changeFrequency: "monthly" as const },
  ];

  // Blog / guide articles.
  const guides = GUIDES.map((g) => ({
    url: `${BASE}${g.href}`,
    priority: 0.7 as const,
    changeFrequency: "monthly" as const,
  }));

  // Service SEO landing pages.
  const services = SERVICES.map((s) => ({
    url: `${BASE}${s.href}`,
    priority: 0.85 as const,
    changeFrequency: "monthly" as const,
  }));

  // City SEO landing pages — kept indexed, carried over from the prior site.
  const cities = CITIES.map((c) => ({
    url: `${BASE}${c.href}`,
    priority: 0.8 as const,
    changeFrequency: "monthly" as const,
  }));

  return [...pages, ...services, ...cities, ...guides].map((p) => ({ ...p, lastModified: now }));
}
