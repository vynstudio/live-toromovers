import type { Metadata } from "next";
import { CityPage } from "@/components/city-page";
import { KISSIMMEE } from "@/lib/cities";

export const metadata: Metadata = {
  title: KISSIMMEE.metadata.title,
  description: KISSIMMEE.metadata.description,
  alternates: { canonical: KISSIMMEE.href },
  openGraph: {
    title: KISSIMMEE.metadata.title,
    description: KISSIMMEE.metadata.description,
    type: "website",
    locale: "en_US",
  },
};

export default function MoversKissimmeePage() {
  return <CityPage city={KISSIMMEE} />;
}
