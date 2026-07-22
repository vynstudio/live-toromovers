import { Suspense } from "react";
import type { Metadata } from "next";
import { IntakeWizard } from "@/components/intake-wizard";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

export const metadata: Metadata = {
  // No brand in title — root template adds " | Toro Movers" (≤60 total).
  title: "Get your moving quote",
  // 118 chars
  description:
    "Tell us where you're moving from and to — get an up-front full-service quote from Toro Movers in Central Florida.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
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
          <IntakeWizard entry="home" />
        </Suspense>
      </div>
    </main>
  );
}
