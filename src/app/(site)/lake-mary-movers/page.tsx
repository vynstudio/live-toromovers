import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { LAKE_MARY } from "@/lib/cities";

export const metadata: Metadata = {
  title: LAKE_MARY.metadata.title,
  description: LAKE_MARY.metadata.description,
  alternates: { canonical: LAKE_MARY.href },
  openGraph: {
    title: LAKE_MARY.metadata.title,
    description: LAKE_MARY.metadata.description,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function MoversLakeMaryPage() {
  return <CityPage city={LAKE_MARY} />;
}
