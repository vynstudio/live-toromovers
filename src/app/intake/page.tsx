import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { IntakeForm } from "@/components/intake-form";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Move-day intake form",
  description:
    "Tell us everything we need to plan your move — addresses, access, inventory, special items, and day-of contacts.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/intake" },
};

export default function IntakePage() {
  return (
    <main className="intake-page">
      <header className="intake-header">
        <Link href="/" className="brand" aria-label={`${BUSINESS_NAME} — Home`}>
          <span className="brand-mark" aria-hidden>
            <img src="/bull.svg" alt="" />
          </span>
          <span className="brand-name">
            TORO<span className="accent">·</span>MOVERS
          </span>
        </Link>
        <a href={PHONE_TEL} className="nav-phone">
          <span className="nav-phone-dot" aria-hidden />
          {PHONE_DISPLAY}
        </a>
      </header>

      <div className="intake-wrap">
        <div className="intake-hero">
          <p className="intake-eyebrow">Move-day intake</p>
          <h1 className="intake-h1">Tell us everything we need to plan your move.</h1>
          <p className="intake-lede">
            This is the detail sheet our crew will use the day of the move. The more
            specific you are about access, special items, and quirks of the spaces,
            the smoother the day goes. Takes about 5 minutes. We auto-save as you
            type — come back any time.
          </p>
        </div>

        <Suspense fallback={null}>
          <IntakeForm />
        </Suspense>
      </div>
    </main>
  );
}
