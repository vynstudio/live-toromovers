import type { Metadata } from "next";
import { ServicePage } from "@/components/service-page";
import { FunnelView } from "@/components/funnel-tracking";
import { LABOR_ONLY_MOVING as S } from "@/lib/services";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.com";

export const metadata: Metadata = {
  title: { absolute: `${S.metadata.title} | Toro Movers` },
  description: S.metadata.description,
  alternates: { canonical: S.href },
  openGraph: {
    title: `${S.metadata.title} | Toro Movers`,
    description: S.metadata.description,
    url: `${SITE_URL}${S.href}`,
    type: "website",
    locale: "en_US",
    images: [{ url: "https://toromovers.com/og/default.jpg", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

/**
 * Labor-only landing — shared ServicePage design system (matches site Nav,
 * light hero, trust band, city links, FAQ, footer). Funnel analytics kept.
 */
export default function LaborOnlyMovingPage() {
  return (
    <>
      <FunnelView funnel="labor" />
      <ServicePage service={S} />
    </>
  );
}
