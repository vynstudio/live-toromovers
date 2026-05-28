import type { Metadata } from "next";
import Link from "next/link";
import { ThankYouTracking } from "@/components/thank-you-tracking";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: `Thanks — we'll call you shortly · ${BUSINESS_NAME}`,
  description:
    "Your moving quote request is in. A Toro Movers team member will call you within minutes to confirm details and lock in your slot.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

export default function ThankYouPage() {
  return (
    <main className="thanks-page">
      <ThankYouTracking />
      <div className="thanks-card">
        <div className="thanks-check" aria-hidden>✓</div>
        <p className="thanks-eyebrow">Your request is in</p>
        <h1 className="thanks-h1">Thanks — we'll call you shortly.</h1>
        <p className="thanks-lede">
          A Toro Movers team member is reviewing your move and will call you
          within a few minutes to confirm the details and book your slot.
        </p>
        <p className="thanks-lede">
          You'll also get a confirmation email and a text from us.
        </p>

        <div className="thanks-cta-row">
          <a href={PHONE_TEL} className="btn btn-primary">
            Call us now — {PHONE_DISPLAY}
            <span className="arrow" aria-hidden />
          </a>
          <Link href="/" className="btn btn-outline">
            Back to home
          </Link>
        </div>

        <p className="thanks-fine">
          Hablamos español. Family-owned. Fully insured. $75 per mover / hour.
        </p>
      </div>
    </main>
  );
}
