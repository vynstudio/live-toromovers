import type { Metadata } from "next";
import { ServicePage } from "@/components/service-page";
import { COMMERCIAL_MOVERS as S } from "@/lib/services";

export const metadata: Metadata = {
  title: S.metadata.title,
  description: S.metadata.description,
  alternates: { canonical: S.href },
  openGraph: {
    title: S.metadata.title,
    description: S.metadata.description,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <ServicePage service={S} />;
}
