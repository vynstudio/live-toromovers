import type { Metadata } from "next";
import Link from "next/link";
import { SquareAppointmentsEmbed } from "@/components/square-appointments-embed";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  BUSINESS_NAME,
} from "@/lib/contact";

export const metadata: Metadata = {
  title: { absolute: "Book Your Move | Toro Movers" },
  description:
    "Book your Central Florida move online with Toro Movers. Choose a date and pay your deposit securely with Square Appointments.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/book" },
};

/**
 * Square Appointments embed (official widget from Square Dashboard).
 * Deposit + calendar are configured in Square Appointments — not custom API.
 */
export default function BookPage() {
  return (
    <main className="lca-page sq-book-page">
      <header className="lca-top">
        <Link href="/" className="lca-brand" aria-label={BUSINESS_NAME}>
          <span className="lca-brand-mark" aria-hidden>
            <img src="/bull.svg" alt="" width={18} height={18} />
          </span>
          <span>
            TORO<span className="lca-accent">·</span>MOVERS
          </span>
        </Link>
        <div className="lca-top-meta">
          <span className="lca-top-responds">Book online · pay deposit</span>
          <a href={PHONE_TEL} className="lca-top-phone">
            {PHONE_DISPLAY}
          </a>
        </div>
      </header>

      <section className="lca-hero sq-book-hero">
        <div className="lca-card sq-book-card" id="book">
          <SquareAppointmentsEmbed lang="en" />
        </div>
        <p className="sq-book-alt">
          Prefer a call first?{" "}
          <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          {" · "}
          <Link href="/get-my-price">Get a free quote</Link>
        </p>
      </section>
    </main>
  );
}
