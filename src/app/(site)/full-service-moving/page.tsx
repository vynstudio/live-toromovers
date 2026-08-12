import type { Metadata } from "next";
import { ServicePage } from "@/components/service-page";
import { FunnelView } from "@/components/funnel-tracking";
import { FULL_SERVICE_MOVING as S } from "@/lib/services";

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
 * Full-service landing — uses the shared ServicePage design system
 * (Nav, city-hero, TrustBand, FAQ, ClosingCta, Footer) so it matches
 * residential / apartment / commercial pages.
 */
export default function FullServiceMovingPage() {
  return (
    <>
      <FunnelView funnel="full-service" />
      <ServicePage service={S} />
    </>
  );
}
