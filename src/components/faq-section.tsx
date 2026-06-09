"use client";

import { useState } from "react";

// Reusable accordion FAQ that reuses the homepage .faq CSS. Pair it with a
// FAQPage JSON-LD block built from the same items so the two never drift.
export function FaqSection({
  items,
  heading,
  eyebrow = "common questions",
}: {
  items: { q: string; a: string }[];
  heading: string;
  eyebrow?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  if (!items.length) return null;

  return (
    <section className="block faq">
      <div className="block-inner">
        <div className="block-eyebrow">{eyebrow}</div>
        <h2 className="block-h2" style={{ marginBottom: 40 }}>
          {heading}
        </h2>
        <div className="faq-list">
          {items.map((item, i) => (
            <div
              key={i}
              className={`faq-item${open === i ? " open" : ""}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="faq-q">
                <span className="question">{item.q}</span>
                <span className="plus" aria-hidden />
              </div>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
