import type { Metadata } from "next";
import Link from "next/link";
import {
  BUSINESS_NAME,
  PHONE_DISPLAY,
  PHONE_TEL,
  SQUARE_BOOKING_URL,
  MOVE_DAY_CHECKLIST_URL,
} from "@/lib/contact";

export const metadata: Metadata = {
  title: "Book your move online",
  description:
    "Book your Toro Movers date online, pay the deposit, then complete the moving day checklist so we send the right crew.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/book" },
};

const STEPS = [
  {
    n: "1",
    title: "Book online",
    body: "Pick your service and date in Square. You’ll get a confirmation with your appointment details.",
  },
  {
    n: "2",
    title: "Pay deposit",
    body: "A small deposit holds your slot and applies to the final invoice. Pay securely in Square when you book.",
  },
  {
    n: "3",
    title: "Moving day checklist",
    body: "After you’re booked, send addresses, start time, and what you’re moving so the crew shows up ready.",
  },
] as const;

export default function BookPage() {
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
        <p className="book-eyebrow">Online booking</p>
        <h1 className="book-title">Book your move</h1>
        <p className="book-lede">
          Three simple steps: reserve the date, pay the deposit, then finish the
          moving day checklist.
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
            href={SQUARE_BOOKING_URL}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book online now
            <span className="arrow" aria-hidden />
          </a>
          <a href={PHONE_TEL} className="btn btn-outline">
            Call {PHONE_DISPLAY}
          </a>
        </div>

        <p className="book-fine">
          Already booked and paid?{" "}
          <Link href={MOVE_DAY_CHECKLIST_URL} className="book-link">
            Open the moving day checklist
          </Link>
          .
        </p>

        <p className="book-fine muted">
          Opens secure Square booking in a new tab. Hablamos español.
        </p>
      </div>
    </main>
  );
}
