import type { Metadata } from "next";
import Link from "next/link";
import { BookingWidget } from "@/components/booking-widget";
import {
  BUSINESS_NAME,
  PHONE_DISPLAY,
  PHONE_TEL,
  DEPOSIT_AMOUNT_DISPLAY,
  MOVE_DAY_CHECKLIST_URL,
} from "@/lib/contact";

// Transactional utility URL — a short link to hand to customers who already
// have a quote. noindex so it can't cannibalize the SEO pages in search.
export const metadata: Metadata = {
  title: "Book your move — hold your date",
  description:
    "Tell us the move, then pay your Toro Movers deposit to lock in the date. The deposit applies to your final invoice.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/bookings" },
};

export default function BookingsPage() {
  return (
    <main className="bk-page">
      <header className="book-bar">
        <div className="book-bar-inner">
          <Link href="/" className="book-brand" aria-label={`${BUSINESS_NAME} home`}>
            Toro Movers
          </Link>
          <a href={PHONE_TEL} className="book-phone">
            {PHONE_DISPLAY}
          </a>
        </div>
      </header>

      <section className="bk-hero">
        <div className="bk-hero-inner">
          <p className="bk-eyebrow">Book online</p>
          <h1 className="bk-title">Hold your move date</h1>
          <p className="bk-lede">
            Tell us what you&apos;re moving and when. A{" "}
            {DEPOSIT_AMOUNT_DISPLAY} deposit locks the crew — and it comes
            straight off your final invoice.
          </p>
        </div>
      </section>

      <div className="bk-widget-wrap">
        <BookingWidget />
      </div>

      <div className="bk-foot">
        <p className="book-fine">
          Don&apos;t have a quote yet?{" "}
          <Link href="/get-my-price" className="book-link">
            Get your price first
          </Link>
          .
        </p>
        <p className="book-fine">
          Already paid?{" "}
          <Link href={MOVE_DAY_CHECKLIST_URL} className="book-link">
            Open the moving day checklist
          </Link>
          .
        </p>
        <p className="book-fine muted">Hablamos español.</p>
      </div>
    </main>
  );
}
