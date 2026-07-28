import type { Metadata } from "next";
import Link from "next/link";
import { IntakeForm } from "@/components/intake-form";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Move-day intake form",
  description:
    "Share the details our crew needs for moving day — schedule, contacts, addresses, access, inventory, and special instructions.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/intake" },
};

export default function IntakePage() {
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
          <p className="intake-eyebrow">Move-day intake</p>
          <h1 className="intake-h1">Tell us everything we need to plan your move.</h1>
          <p className="intake-lede">
            This is the detail sheet our crew uses on moving day — your schedule,
            who to call, pickup and drop-off access, what you&apos;re moving, and
            anything special we should know so the day runs smoothly.
          </p>
        </div>

        <IntakeForm />
      </div>
    </main>
  );
}
