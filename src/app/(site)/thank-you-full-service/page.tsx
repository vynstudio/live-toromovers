import type { Metadata } from "next";
import Link from "next/link";
import { ThankYouView, CallCta } from "@/components/funnel-tracking";
import { PHONE_DISPLAY, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: { absolute: "Full-service request received | Toro Movers" },
  description:
    "Your full-service moving request is in. A team member will contact you in a couple minutes with availability and up-front pricing.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you-full-service" },
};

export default function ThankYouFullServicePage() {
  return (
    <main className="fn-thanks">
      <ThankYouView />
      <div className="fn-thanks-card">
        <div className="fn-thanks-check" aria-hidden>✓</div>
        <p className="fn-thanks-eyebrow">Full-service request received</p>
        <h1 className="fn-thanks-h1">A team member will contact you in a couple minutes with pricing.</h1>
        <p className="fn-thanks-lede">
          We are reviewing your full-service request now. Expect a call or text
          today with availability and up-front hourly pricing. You will get a
          text confirmation too.
        </p>
        <div className="fn-thanks-cta">
          <CallCta className="fn-btn fn-btn-primary fn-btn-lg">Call Now — {PHONE_DISPLAY}</CallCta>
          <Link href="/get-my-price" data-open-quote data-source="thank-you-fs" className="fn-btn fn-btn-ghost-light">
            Get My Quote
          </Link>
        </div>
        <p className="fn-thanks-fine">
          Hablamos español · Family-owned · Up-front hourly pricing
        </p>
      </div>
    </main>
  );
}
