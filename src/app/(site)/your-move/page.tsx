import type { Metadata } from "next";
import Link from "next/link";
import { JobSizeForm } from "@/components/job-size-form";
import { BUSINESS_NAME, PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Your move",
  description:
    "Share your pickup and drop-off addresses and job size so Toro Movers can send the right crew.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/your-move" },
};

export default function YourMovePage() {
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
        <h1 className="jsf-title">How big is your move?</h1>
        <p className="jsf-lede">
          Addresses + a few quick questions so we send the right crew.
        </p>
        <JobSizeForm />
      </div>
    </main>
  );
}
