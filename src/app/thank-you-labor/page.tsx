import type { Metadata } from "next";
import { ThankYouView, CallCta } from "@/components/funnel-tracking";
import { PHONE_DISPLAY, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: { absolute: "Request received — Toro Movers" },
  description:
    "Your labor-only moving request is in. A Toro Movers team member will call you shortly to check availability and confirm your up-front hourly rate.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you-labor" },
};

export default function ThankYouLaborPage() {
  return (
    <main className="fn-thanks">
      <ThankYouView />
      <div className="fn-thanks-card">
        <div className="fn-thanks-check" aria-hidden>✓</div>
        <p className="fn-thanks-eyebrow">Request received</p>
        <h1 className="fn-thanks-h1">You're set — we'll check availability and call you.</h1>
        <p className="fn-thanks-lede">
          A Toro Movers team member is reviewing your labor-only request and will
          call you shortly to confirm the details and your up-front hourly rate.
          You'll get a text from us too.
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
