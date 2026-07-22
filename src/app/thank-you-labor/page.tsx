import type { Metadata } from "next";
import { ThankYouView, CallCta } from "@/components/funnel-tracking";
import { PHONE_DISPLAY, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: { absolute: "Labor-only request received | Toro Movers" },
  description:
    "Your labor-only moving request is in. A Toro Movers owner will call or text you today with availability and your up-front hourly rate.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you-labor" },
};

export default function ThankYouLaborPage() {
  return (
    <main className="fn-thanks">
      <ThankYouView />
      <div className="fn-thanks-card">
        <div className="fn-thanks-check" aria-hidden>✓</div>
        <p className="fn-thanks-eyebrow">Labor-only request received</p>
        <h1 className="fn-thanks-h1">A Toro Movers owner will call or text you today with your rate.</h1>
        <p className="fn-thanks-lede">
          We are reviewing your labor-only request now. Expect a call or text
          today with availability and your up-front hourly rate. You will get a
          text confirmation too.
        </p>
        <div className="fn-thanks-cta">
          <CallCta className="fn-btn fn-btn-primary fn-btn-lg">Call Now — {PHONE_DISPLAY}</CallCta>
          <CallCta className="fn-btn fn-btn-ghost-light">Need help ASAP? Call now — {PHONE_DISPLAY}</CallCta>
        </div>
        <p className="fn-thanks-fine">
          Hablamos español · Family-owned · Up-front hourly pricing
        </p>
      </div>
    </main>
  );
}
