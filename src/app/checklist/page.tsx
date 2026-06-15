import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChecklistPrintButton } from "@/components/checklist-print";
import { ChecklistIntakeBanner } from "@/components/checklist-banner";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME } from "@/lib/contact";

export const metadata: Metadata = {
  title: `Pre-move checklist · ${BUSINESS_NAME}`,
  description:
    "Everything to do before moving day so the crew lands at a ready house. Use this in the week leading up to your move.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checklist" },
};

const SECTIONS = [
  {
    when: "1 week before",
    items: [
      "Give written notice to your HOA / building (especially for elevator reservations).",
      "Confirm utility transfer dates (electric, water, internet) at both addresses.",
      "Forward mail with USPS (usps.com/move) — takes ~7 business days to start.",
      "Tell your bank you're moving so they don't freeze the card for the unfamiliar charge.",
      "If you have kids/pets, line up a sitter for moving day.",
    ],
  },
  {
    when: "3 days before",
    items: [
      "Start packing non-essentials. Label every box: room + 2-word contents.",
      "Use up perishables in the fridge; defrost the freezer 24h before move day.",
      "Withdraw cash for tips and small expenses.",
      "Confirm the crew arrival window with Toro Movers.",
      "Take photos of how electronics are wired so reassembly is fast.",
      "Set aside a clearly-labeled box of valuables you'll carry yourself — documents, jewelry, cash, medications, hard drives, passports.",
    ],
  },
  {
    when: "Day before",
    items: [
      "Pack a 'first night' bag per person: 2 changes of clothes, toiletries, charger, phone, meds, snacks.",
      "Pack a 'first morning' kit: coffee, mugs, basic dishes, toilet paper, soap, towels.",
      "Empty all drawers of breakables / liquids (the dresser itself can stay packed).",
      "Disassemble what you can: bed frames, IKEA wardrobes, large mirrors (or ask the crew to do it).",
      "Wrap the TVs in their original boxes if you still have them.",
      "Water plants well; if a pet is staying onsite during the move, prep their crate.",
    ],
  },
  {
    when: "Morning of",
    items: [
      "Clear walkways and stairs of anything underfoot.",
      "Secure pets in one closed room with food, water, and their favorite blanket.",
      "Have water and a few snacks for the crew — small but always appreciated.",
      "Final walkthrough: check closets, attic, garage, and behind doors.",
      "Take photos of meter readings before you leave.",
      "Lock all windows and back doors before the crew loads the truck.",
    ],
  },
  {
    when: "After the crew finishes",
    items: [
      "Walk through with the crew lead: confirm nothing's left behind, confirm condition.",
      "Verify the inventory list off the truck (count, no obvious damage).",
      "Sign the bill of lading. Keep your copy.",
      "Tip if you're happy — generally $20–40 per mover for a good local move.",
      "Leave a Google review if the day went well: it helps the small family business a lot.",
    ],
  },
];

export default function ChecklistPage() {
  return (
    <main className="checklist-page">
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

      <div className="checklist-wrap">
        <Suspense fallback={null}>
          <ChecklistIntakeBanner />
        </Suspense>
        <div className="checklist-hero">
          <p className="intake-eyebrow">Pre-move checklist</p>
          <h1 className="intake-h1">Everything to do before moving day.</h1>
          <p className="intake-lede">
            Work through this in the week leading up to your move. Tick items as you
            go (it's just for you — nothing is saved or sent to us).
          </p>
          <div className="checklist-actions">
            <ChecklistPrintButton />
            <Link href="/intake" className="btn btn-outline">
              Move-day intake form →
            </Link>
          </div>
        </div>

        {SECTIONS.map((s) => (
          <section key={s.when} className="checklist-section">
            <h2 className="checklist-when">{s.when}</h2>
            <ul className="checklist-list">
              {s.items.map((it, i) => (
                <li key={i} className="checklist-item">
                  <label>
                    <input type="checkbox" />
                    <span>{it}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Quote CTA — additive. /checklist is noindex (no SEO impact); links to
            the existing /quote wizard and reuses the existing quote_click event. */}
        <section
          className="checklist-quote-cta"
          style={{
            textAlign: "center",
            marginTop: 8,
            padding: "30px 16px",
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <h2 className="checklist-when" style={{ marginBottom: 6 }}>
            Ready for a price?
          </h2>
          <p style={{ maxWidth: "46ch", margin: "0 auto 18px", opacity: 0.8 }}>
            Worked through the list? Get an up-front hourly quote in about 60
            seconds — no obligation.
          </p>
          <Link href="/quote" className="btn btn-primary">
            Get my free estimate
            <span className="arrow" aria-hidden />
          </Link>
        </section>

        <div className="checklist-footer">
          <p>
            Anything you'd add, or something on this list that doesn't apply? Text or
            call us at <a href={PHONE_TEL}>{PHONE_DISPLAY}</a> — we'll plan around it.
          </p>
        </div>
      </div>
    </main>
  );
}
