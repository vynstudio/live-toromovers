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
  title: "Book your move — pick your time",
  description:
    "Tell us the move, then pick a time from live Toro Movers availability. The deposit is taken at booking and applies to your final invoice.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/bookings" },
  // This link gets pasted into SMS and WhatsApp far more than it gets crawled,
  // so the share card matters more than the search snippet. noindex above does
  // not suppress OG — messaging apps still unfurl it.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toromovers.com/bookings",
    siteName: BUSINESS_NAME,
    title: "Book your move — Toro Movers",
    description:
      "Pick a slot from live availability. The $75 deposit is taken at booking and comes off your final invoice.",
    images: [
      {
        url: "https://toromovers.com/og/bookings.jpg",
        width: 1200,
        height: 630,
        alt: "Toro Movers — hold your move date, book online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book your move — Toro Movers",
    description:
      "Pick a slot from live availability. $75 deposit comes off your final invoice.",
    images: ["https://toromovers.com/og/bookings.jpg"],
  },
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
            Tell us what you&apos;re moving, then pick a slot from our live
            calendar. The {DEPOSIT_AMOUNT_DISPLAY} deposit is taken at booking
            and comes straight off your final invoice.
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
          Already booked?{" "}
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
