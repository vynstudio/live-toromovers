import { Suspense } from "react";
import type { Metadata } from "next";
import { IntakeWizard } from "@/components/intake-wizard";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

// Paid-traffic ad funnel. Same engine as /quote, same submit path
// (/api/ad-funnel). noindex — this is an ad landing page, not an SEO page.
export const metadata: Metadata = {
  // No brand in title — root template adds " | Toro Movers".
  title: "Get your moving quote",
  // 121 chars — full-service first; labor-only secondary
  description:
    "Fast full-service moving quote across Central Florida. Truck & crew, or labor-only if you have a truck. Up-front pricing.",
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
