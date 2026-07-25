import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { ORLANDO } from "@/lib/cities";

const TITLE = "Orlando Movers | Family-Owned, No Hidden Fees | Toro Movers";
const DESCRIPTION =
  "Family-owned Orlando movers — apartments, homes & offices with transparent hourly pricing. 4.9★ on Google, bilingual crew, no fuel or stair fees.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: ORLANDO.href },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

/**
 * Flagship polished city landing — uses CityPageLayout visual system
 * (CityHero, ServiceGrid, NeighborhoodStrip, testimonials, steps, FAQ, quote card).
 */
export default function MoversOrlandoPage() {
  return <CityPage city={ORLANDO} />;
}
