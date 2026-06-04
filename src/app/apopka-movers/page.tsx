import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { APOPKA } from "@/lib/cities";

export const metadata: Metadata = {
  title: APOPKA.metadata.title,
  description: APOPKA.metadata.description,
  alternates: { canonical: APOPKA.href },
  openGraph: {
    title: APOPKA.metadata.title,
    description: APOPKA.metadata.description,
    type: "website",
    locale: "en_US",
  },
};

export default function MoversApopkaPage() {
  return <CityPage city={APOPKA} />;
}
