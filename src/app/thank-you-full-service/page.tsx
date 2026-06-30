import type { Metadata } from "next";
import Link from "next/link";
import { ThankYouView, CallCta } from "@/components/funnel-tracking";
import { PHONE_DISPLAY, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: { absolute: "Request received — Toro Movers" },
  description:
    "Your full-service moving request is in. A Toro Movers team member will call you shortly to check availability and put together your up-front pricing.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you-full-service" },
};

export default function ThankYouFullServicePage() {
  return (
    <main className="fn-thanks">
      <ThankYouView />
      <div className="fn-thanks-card">
        <div className="fn-thanks-check" aria-hidden>✓</div>
        <p className="fn-thanks-eyebrow">Request received</p>
        <h1 className="fn-thanks-h1">You're set — we'll build your pricing and call you.</h1>
        <p className="fn-thanks-lede">
          A Toro Movers team member is reviewing your full-service request and
          will call you shortly to check availability and put together your
          up-front pricing. You'll get a text from us too.
        </p>
        <div className="fn-thanks-cta">
          <CallCta className="fn-btn fn-btn-primary fn-btn-lg">Call Now — {PHONE_DISPLAY}</CallCta>
          <Link href="/quote" className="fn-btn fn-btn-ghost-light">Get My Quote</Link>
        </div>
        <p className="fn-thanks-fine">
          Hablamos español · Family-owned · Up-front hourly pricing
        </p>
      </div>
    </main>
  );
}
