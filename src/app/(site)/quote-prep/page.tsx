import type { Metadata } from "next";
import Link from "next/link";
import { StickyCta } from "@/components/sticky-cta";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Prep for your moving quote",
  description:
    "A 60-second prep before your Toro Movers quote — what we need, what affects price, and how to get ready for apartment and home moves.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/quote-prep" },
};

const NEED = [
  "Pickup and drop-off addresses (with unit/floor).",
  "Move type: apartment, house, or commercial — and rough size (studio → 4+ bedrooms).",
  "Stairs or elevator at each address.",
  "Your preferred date and arrival window.",
  "Any large or awkward items (piano, safe, gym equipment, oversized furniture).",
];

const PRICE_FACTORS = [
  ["Crew size & hours", "We price by the hour, up front. Bigger homes need more movers or more time."],
  ["Stairs vs. elevator", "Walk-ups and high floors add time; a reserved elevator keeps it fast."],
  ["Access & parking", "How close the truck can park to the door affects load/unload speed."],
  ["Special items", "Pianos, safes, and oversized pieces may need extra hands or equipment."],
  ["Ready to load", "Boxes packed and labeled before the crew arrives keeps the day moving fast."],
];

const APARTMENT = [
  "Reserve the elevator and a loading zone with your building.",
  "Ask your building office whether a Certificate of Insurance (COI) is required, and sort it out before move day.",
  "Confirm move-in/move-out time windows the complex allows.",
  "Empty and clear hallways and stairwells on moving day.",
];

const RESIDENTIAL = [
  "Disassemble what you can ahead of time (or ask the crew to do it).",
  "Clear driveways and walkways so the truck can park close.",
  "Set aside a valuables box you'll carry yourself.",
  "Secure pets in one closed room during load and unload.",
];

export default function QuotePrepPage() {
  return (
    <main className="prep-page">
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

      <div className="prep-wrap">
        <div className="prep-hero">
          <p className="intake-eyebrow">60-second prep</p>
          <h1 className="intake-h1">Get ready for a fast, accurate quote.</h1>
          <p className="intake-lede">
            Have these details handy and we can give you an up-front hourly price
            in about a minute — no back-and-forth.
          </p>
          <Link
            href="/get-my-price"
            data-open-quote
            data-source="quote-prep-top"
            className="btn btn-primary prep-cta-top"
          >
            Get My Price
            <span className="arrow" aria-hidden />
          </Link>
        </div>

        <section className="prep-section">
          <h2 className="magnet-h2">What we need from you</h2>
          <ul className="magnet-preview">
            {NEED.map((n) => (
              <li key={n}>
                <span className="magnet-tick" aria-hidden>
                  ✓
                </span>
                {n}
              </li>
            ))}
          </ul>
        </section>

        <section className="prep-section">
          <h2 className="magnet-h2">What affects the price</h2>
          <div className="magnet-trust">
            {PRICE_FACTORS.map(([h, p]) => (
              <div key={h} className="magnet-trust-item">
                <strong>{h}</strong>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="prep-section prep-two-col">
          <div>
            <h2 className="magnet-h2">Apartment moves</h2>
            <ul className="magnet-preview">
              {APARTMENT.map((a) => (
                <li key={a}>
                  <span className="magnet-tick" aria-hidden>
                    ✓
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="magnet-h2">Residential moves</h2>
            <ul className="magnet-preview">
              {RESIDENTIAL.map((r) => (
                <li key={r}>
                  <span className="magnet-tick" aria-hidden>
                    ✓
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="magnet-cta-band">
          <h2 className="magnet-h2">Ready?</h2>
          <p>You’ve got what you need — let’s price your move.</p>
          <div className="magnet-cta-row">
            <a href="/get-my-price" data-open-quote data-source="page-cta" className="btn btn-primary">
              Get My Price
              <span className="arrow" aria-hidden />
            </a>
            <a href={PHONE_TEL} className="btn btn-outline">
              Or call {PHONE_DISPLAY}
            </a>
          </div>
        </section>
      </div>

      <StickyCta />
    </main>
  );
}
