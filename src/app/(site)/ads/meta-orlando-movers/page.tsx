import type { Metadata } from "next";
import { AdLanding } from "@/components/ad-landing";

// Paid-traffic LP — noindex so it doesn't compete with the homepage in search.
export const metadata: Metadata = {
  title: "Orlando Movers — Up-front Hourly Pricing · Toro Movers",
  description:
    "Family-owned Orlando movers. Loading help, in-town moves with truck, and full-service moves across Central Florida. Up-front hourly pricing — free quote in 60 seconds.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/ads/meta-orlando-movers" },
};

export default function Page() {
  return <AdLanding />;
}
