import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { ST_CLOUD } from "@/lib/cities";

export const metadata: Metadata = {
  title: ST_CLOUD.metadata.title,
  description: ST_CLOUD.metadata.description,
  alternates: { canonical: ST_CLOUD.href },
  openGraph: {
    title: ST_CLOUD.metadata.title,
    description: ST_CLOUD.metadata.description,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function MoversStCloudPage() {
  return <CityPage city={ST_CLOUD} />;
}
