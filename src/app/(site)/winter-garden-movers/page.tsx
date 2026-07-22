import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { WINTER_GARDEN } from "@/lib/cities";

export const metadata: Metadata = {
  title: WINTER_GARDEN.metadata.title,
  description: WINTER_GARDEN.metadata.description,
  alternates: { canonical: WINTER_GARDEN.href },
  openGraph: {
    title: WINTER_GARDEN.metadata.title,
    description: WINTER_GARDEN.metadata.description,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function MoversWinterGardenPage() {
  return <CityPage city={WINTER_GARDEN} />;
}
