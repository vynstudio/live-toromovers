import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { OVIEDO } from "@/lib/cities";

export const metadata: Metadata = {
  title: OVIEDO.metadata.title,
  description: OVIEDO.metadata.description,
  alternates: { canonical: OVIEDO.href },
  openGraph: {
    title: OVIEDO.metadata.title,
    description: OVIEDO.metadata.description,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function MoversOviedoPage() {
  return <CityPage city={OVIEDO} />;
}
