import type { Metadata } from "next";
import Link from "next/link";
import {
  BUSINESS_NAME,
  PHONE_DISPLAY,
  PHONE_TEL,
  SQUARE_DEPOSIT_URL,
  DEPOSIT_AMOUNT_DISPLAY,
  MOVE_DAY_CHECKLIST_URL,
} from "@/lib/contact";

// Transactional utility URL — a short link to hand to customers who already
// have a quote. noindex so it can't cannibalize /book in search.
export const metadata: Metadata = {
  title: "Pay your move deposit",
  description:
    "Pay your Toro Movers deposit to lock in your move date. The deposit applies to your final invoice.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/bookings" },
};

const STEPS = [
  {
    n: "1",
    title: "Pay the deposit",
    body: `A ${DEPOSIT_AMOUNT_DISPLAY} deposit holds your date on the schedule. It applies to your final invoice — it is not an extra fee.`,
  },
  {
    n: "2",
    title: "We confirm your date",
    body: "Once payment lands, we lock the slot and text you a confirmation with your arrival window.",
  },
  {
    n: "3",
    title: "Moving day checklist",
    body: "Send addresses, start time, and what you're moving so we send the right crew and truck.",
  },
] as const;

export default function BookingsPage() {
  return (
    <main className="book-page">
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

      <div className="book-wrap">
        <p className="book-eyebrow">Secure your date</p>
        <h1 className="book-title">Pay your move deposit</h1>
        <p className="book-lede">
          Your date is held once the {DEPOSIT_AMOUNT_DISPLAY} deposit is paid.
          It comes straight off your final invoice.
        </p>

        <ol className="book-steps">
          {STEPS.map((s) => (
            <li key={s.n} className="book-step">
              <span className="book-step-n" aria-hidden>
                {s.n}
              </span>
              <div>
                <h2 className="book-step-title">{s.title}</h2>
                <p className="book-step-body">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="book-cta-row">
          <a
            href={SQUARE_DEPOSIT_URL}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pay {DEPOSIT_AMOUNT_DISPLAY} deposit
            <span className="arrow" aria-hidden />
          </a>
          <a href={PHONE_TEL} className="btn btn-outline">
            Call {PHONE_DISPLAY}
          </a>
        </div>

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

        <p className="book-fine muted">
          Payment is processed by Square in a new tab — we never see your card
          details. Hablamos español.
        </p>
      </div>
    </main>
  );
}
