import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { SANFORD } from "@/lib/cities";

export const metadata: Metadata = {
  title: SANFORD.metadata.title,
  description: SANFORD.metadata.description,
  alternates: { canonical: SANFORD.href },
  openGraph: {
    title: SANFORD.metadata.title,
    description: SANFORD.metadata.description,
    type: "website",
    locale: "en_US",
  },
};

export default function MoversSanfordPage() {
  return <CityPage city={SANFORD} />;
}
