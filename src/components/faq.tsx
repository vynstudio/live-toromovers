"use client";

import { useState } from "react";
import { Reveal } from "./reveal";

const items = [
  {
    q: "How do you onboard new clients?",
    a: "Every relationship begins with a deep clean — the foundation that defines our standard for your home. From there, you choose a maintenance cadence that suits your life. We respond to every request within one business day.",
  },
  {
    q: "Will the same team always come?",
    a: "Yes. Once we know your home, the same team returns every visit. They learn your preferences, your pets, what matters to you. That continuity is the entire reason this works.",
  },
  {
    q: "Are you insured and bonded?",
    a: "Fully bonded and insured. Every team member is background-checked, trained in-house, and paid above market — because how we treat our team is exactly how they treat your home.",
  },
  {
    q: "What if I'm not home during a visit?",
    a: "Most of our recurring clients are not. We coordinate access through your preferred method — lockbox, smart lock, gated entry, doorman. You receive a quiet confirmation when we finish.",
  },
  {
    q: "Are you currently accepting new clients?",
    a: "We accept a limited number of new homes each season to preserve service quality. Submit a request and we will respond within one business day with availability for your area.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="faq-section" id="faq">
      <div className="faq-grid">
        <Reveal className="faq-intro">
          <div className="section-eyebrow">
            <span className="roman">V</span> Questions
          </div>
          <h2>
            The practical
            <br />
            <em className="gradient-text">matters.</em>
          </h2>
        </Reveal>
        <div className="faq-list">
          {items.map((item, i) => (
            <div
              key={i}
              className={`faq-item${open === i ? " open" : ""}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="faq-q">
                <span className="question">{item.q}</span>
                <span className="plus" />
              </div>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
