import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { WINDERMERE } from "@/lib/cities";

export const metadata: Metadata = {
  title: WINDERMERE.metadata.title,
  description: WINDERMERE.metadata.description,
  alternates: { canonical: WINDERMERE.href },
  openGraph: {
    title: WINDERMERE.metadata.title,
    description: WINDERMERE.metadata.description,
    type: "website",
    locale: "en_US",
  },
};

export default function MoversWindermerePage() {
  return <CityPage city={WINDERMERE} />;
}
