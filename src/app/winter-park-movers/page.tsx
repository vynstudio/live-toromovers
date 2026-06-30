import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { WINTER_PARK } from "@/lib/cities";

export const metadata: Metadata = {
  title: WINTER_PARK.metadata.title,
  description: WINTER_PARK.metadata.description,
  alternates: { canonical: WINTER_PARK.href },
  openGraph: {
    title: WINTER_PARK.metadata.title,
    description: WINTER_PARK.metadata.description,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function MoversWinterParkPage() {
  return <CityPage city={WINTER_PARK} />;
}
