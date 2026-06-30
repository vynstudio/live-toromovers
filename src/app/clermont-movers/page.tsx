import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { CLERMONT } from "@/lib/cities";

export const metadata: Metadata = {
  title: CLERMONT.metadata.title,
  description: CLERMONT.metadata.description,
  alternates: { canonical: CLERMONT.href },
  openGraph: {
    title: CLERMONT.metadata.title,
    description: CLERMONT.metadata.description,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function MoversClermontPage() {
  return <CityPage city={CLERMONT} />;
}
