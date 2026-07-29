import type { Metadata } from "next";
import Link from "next/link";
import { IntakeForm } from "@/components/intake-form";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Moving day checklist",
  description:
    "Share the details our crew needs for moving day — schedule, contacts, addresses, access, inventory, and special instructions.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/movingday-checklist" },
};

export default function MovingDayChecklistPage() {
  return (
    <main className="intake-page">
      <header className="intake-header">
        <Link href="/" className="brand" aria-label={`${BUSINESS_NAME} — Home`}>
          <span className="brand-mark" aria-hidden>
            <img src="/bull.svg" alt="" />
          </span>
          <span className="brand-name">
            TORO<span className="accent">·</span>MOVERS
          </span>
        </Link>
        <a href={PHONE_TEL} className="nav-phone">
          <span className="nav-phone-dot" aria-hidden />
          {PHONE_DISPLAY}
        </a>
      </header>

      <div className="intake-wrap">
        <div className="intake-hero">
          <p className="intake-eyebrow">Moving day checklist</p>
          <h1 className="intake-h1">Moving day details.</h1>
          <p className="intake-lede">
            Schedule, access, inventory, and who to call — so moving day runs smoothly.
          </p>
        </div>

        <IntakeForm />
      </div>
    </main>
  );
}
