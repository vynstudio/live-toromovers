import type { Metadata } from "next";
import { ServicePage } from "@/components/service-page";
import { PACKING_SERVICES as S } from "@/lib/services";

export const metadata: Metadata = {
  title: S.metadata.title,
  description: S.metadata.description,
  alternates: { canonical: S.href },
  openGraph: {
    title: S.metadata.title,
    description: S.metadata.description,
    type: "website",
    locale: "en_US",
  },
};

export default function Page() {
  return <ServicePage service={S} />;
}
