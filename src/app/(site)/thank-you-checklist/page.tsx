import type { Metadata } from "next";
import Link from "next/link";
import {
  ChecklistThankYouTracking,
  PdfDownloadButton,
} from "@/components/checklist-tracking";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Your checklist is on its way",
  description:
    "Your Central Florida Moving Checklist is ready — check your email. Need a price? Request an up-front hourly quote from Toro Movers.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you-checklist" },
};

export default function ThankYouChecklistPage() {
  return (
    <main className="thanks-page">
      <ChecklistThankYouTracking />
      <div className="thanks-card">
        <div className="thanks-check" aria-hidden>
          ✓
        </div>
        <p className="thanks-eyebrow">Your checklist is ready</p>
        <h1 className="thanks-h1">Check your email — we’re sending it now.</h1>
        <p className="thanks-lede">
          Your Central Florida Moving Checklist is on its way to your inbox. If
          you asked for a text, that’s coming too. Can’t wait? Grab the PDF right
          here:
        </p>

        <div className="thanks-cta-row">
          <PdfDownloadButton variant="primary" label="Download the PDF now" />
        </div>

        <div className="thanks-divider" aria-hidden />

        <p className="thanks-lede">
          When you’re ready, we’ll give you an up-front hourly price — no
          surprises.
        </p>
        <div className="thanks-cta-row">
          <a href="/get-my-price" data-open-quote data-source="page-cta" className="btn btn-primary">
            Request a Quote
            <span className="arrow" aria-hidden />
          </a>
          <a href={PHONE_TEL} className="btn btn-outline">
            Call us now — {PHONE_DISPLAY}
          </a>
        </div>

        <p className="thanks-fine">
          Hablamos español. Family-owned. Up-front hourly pricing.
        </p>
      </div>
    </main>
  );
}
