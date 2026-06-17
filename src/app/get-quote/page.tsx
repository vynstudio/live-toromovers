import { Suspense } from "react";
import type { Metadata } from "next";
import { IntakeWizard } from "@/components/intake-wizard";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

// Paid-traffic ad funnel. Same engine as /quote, same submit path
// (/api/ad-funnel). noindex — this is an ad landing page, not an SEO page.
export const metadata: Metadata = {
  title: "Get your moving quote · Toro Movers",
  description:
    "Fast moving quote across Central Florida — labor only or labor + truck. Apartment, house, storage, U-Haul / POD load & unload.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/get-quote" },
};

export default function GetQuotePage() {
  return (
    <main className="quote-page">
      <header className="quote-header">
        <a href="/" className="brand" aria-label="Toro Movers — Home">
          <span className="brand-mark" aria-hidden>
            <img src="/bull.svg" alt="" />
          </span>
          <span className="brand-name">
            TORO<span className="accent">·</span>MOVERS
          </span>
        </a>
        <a href={PHONE_TEL} className="nav-phone">
          <span className="nav-phone-dot" aria-hidden />
          {PHONE_DISPLAY}
        </a>
      </header>
      <div className="quote-wrap">
        <Suspense fallback={null}>
          <IntakeWizard entry="ad" />
        </Suspense>
      </div>
    </main>
  );
}
