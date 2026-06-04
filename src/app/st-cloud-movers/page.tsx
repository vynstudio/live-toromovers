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
  },
};

export default function MoversStCloudPage() {
  return <CityPage city={ST_CLOUD} />;
}
