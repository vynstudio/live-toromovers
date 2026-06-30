import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { FERN_PARK as C } from "@/lib/cities";

export const metadata: Metadata = {
  title: C.metadata.title,
  description: C.metadata.description,
  alternates: { canonical: C.href },
  openGraph: {
    title: C.metadata.title,
    description: C.metadata.description,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <CityPage city={C} />;
}
