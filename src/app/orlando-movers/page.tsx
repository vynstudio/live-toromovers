import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { ORLANDO } from "@/lib/cities";

export const metadata: Metadata = {
  title: ORLANDO.metadata.title,
  description: ORLANDO.metadata.description,
  alternates: { canonical: ORLANDO.href },
  openGraph: {
    title: ORLANDO.metadata.title,
    description: ORLANDO.metadata.description,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function MoversOrlandoPage() {
  return <CityPage city={ORLANDO} />;
}
