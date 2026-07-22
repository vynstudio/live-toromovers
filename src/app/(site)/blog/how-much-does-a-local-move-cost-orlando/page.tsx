import type { Metadata } from "next";
import { GuidePage } from "@/components/guide-page";
import { MOVING_COST as G } from "@/lib/guides";

export const metadata: Metadata = {
  title: G.metadata.title,
  description: G.metadata.description,
  alternates: { canonical: G.href },
  openGraph: {
    title: G.metadata.title,
    description: G.metadata.description,
    type: "article",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <GuidePage guide={G} />;
}
