import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { ORLANDO } from "@/lib/cities";

const TITLE = ORLANDO.metadata.title;
const DESCRIPTION = ORLANDO.metadata.description;

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
  robots: { index: true, follow: true },
};

/**
 * Flagship polished city landing — uses CityPageLayout visual system
 * (CityHero, ServiceGrid, NeighborhoodStrip, testimonials, steps, FAQ, quote card).
 */
export default function MoversOrlandoPage() {
  return <CityPage city={ORLANDO} />;
}
