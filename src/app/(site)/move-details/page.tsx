import type { Metadata } from "next";
import Link from "next/link";
import { MoveDetailsForm } from "@/components/move-details-form";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Move details",
  description: "Share move-day details for your Toro Movers crew.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/move-details" },
};

export default function MoveDetailsPage() {
  return (
    <main className="mdf-page">
      <header className="mdf-head">
        <Link href="/" className="mdf-brand" aria-label={`${BUSINESS_NAME} home`}>
          TORO·MOVERS
        </Link>
        <a href={PHONE_TEL} className="mdf-phone">
          {PHONE_DISPLAY}
        </a>
      </header>

      <div className="mdf-wrap">
        <h1 className="mdf-title">Move details</h1>
        <p className="mdf-lede">
          One page. Tap what applies. Crew gets the full run sheet.
        </p>
        <MoveDetailsForm />
      </div>
    </main>
  );
}
