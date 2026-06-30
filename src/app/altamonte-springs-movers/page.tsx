import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { ALTAMONTE_SPRINGS } from "@/lib/cities";

export const metadata: Metadata = {
  title: ALTAMONTE_SPRINGS.metadata.title,
  description: ALTAMONTE_SPRINGS.metadata.description,
  alternates: { canonical: ALTAMONTE_SPRINGS.href },
  openGraph: {
    title: ALTAMONTE_SPRINGS.metadata.title,
    description: ALTAMONTE_SPRINGS.metadata.description,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function MoversAltamonteSpringsPage() {
  return <CityPage city={ALTAMONTE_SPRINGS} />;
}
