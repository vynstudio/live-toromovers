import type { Metadata } from "next";
import Link from "next/link";
import { JobSizeForm } from "@/components/job-size-form";
import { BUSINESS_NAME, PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Moving day checklist",
  description:
    "Moving day checklist for Toro Movers — date, start time, addresses, and what you’re moving so we send the right crew.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/move-day-checklist" },
};

export default function MoveDayChecklistPage() {
  return (
    <main className="jsf-page">
      <header className="jsf-bar">
        <div className="jsf-bar-inner">
          <Link href="/" className="jsf-brand" aria-label={`${BUSINESS_NAME} home`}>
            Toro Movers
          </Link>
          <a href={PHONE_TEL} className="jsf-phone">
            {PHONE_DISPLAY}
          </a>
        </div>
      </header>

      <div className="jsf-wrap">
        <h1 className="jsf-title">Moving day checklist</h1>
        <p className="jsf-lede">
          When, where, and what you’re moving — so your Toro crew shows up
          ready. About 2 minutes.
        </p>
        <JobSizeForm />
      </div>
    </main>
  );
}
