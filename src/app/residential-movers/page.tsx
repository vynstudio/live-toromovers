import type { Metadata } from "next";
import { ServicePage } from "@/components/service-page";
import { RESIDENTIAL_MOVERS as S } from "@/lib/services";

export const metadata: Metadata = {
  // Absolute so the layout's "%s · Toro Movers" template doesn't double the
  // brand suffix (the base title already carries "| Toro Movers").
  title: { absolute: `${S.metadata.title} | Toro Movers` },
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
