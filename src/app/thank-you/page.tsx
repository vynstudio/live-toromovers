import type { Metadata } from "next";
import Link from "next/link";
import { ThankYouTracking } from "@/components/thank-you-tracking";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Quote request received",
  description:
    "Your moving quote request is in. A team member will contact you in a couple minutes to confirm details and pricing.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

export default function ThankYouPage() {
  return (
    <main className="thanks-page">
      <ThankYouTracking />
      <div className="thanks-card">
        <div className="thanks-check" aria-hidden>✓</div>
        <p className="thanks-eyebrow">Quote request received</p>
        <h1 className="thanks-h1">A team member will contact you in a couple minutes.</h1>
        <p className="thanks-lede">
          We have your move details. Expect a call or text today with your
          quote and next steps to book the date.
        </p>
        <p className="thanks-lede">
          You will also get a confirmation email and a text from us.
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
          Hablamos español. Family-owned. Up-front hourly pricing on every move.
        </p>
      </div>
    </main>
  );
}
