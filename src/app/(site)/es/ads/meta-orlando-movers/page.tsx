import type { Metadata } from "next";
import { AdLanding } from "@/components/ad-landing";

// Spanish paid-traffic LP (same component; language resolves via LangProvider).
// noindex so it doesn't compete with the homepage in search.
export const metadata: Metadata = {
  title: "Mudanzas en Orlando — Precios Claros por Hora · Toro Movers",
  description:
    "Mudanceros familiares en Orlando. Mano de obra, mudanzas locales con camión y mudanzas completas en Florida Central. Precios claros por hora — cotización gratis en 60 segundos.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/es/ads/meta-orlando-movers" },
};

export default function Page() {
  return <AdLanding />;
}
