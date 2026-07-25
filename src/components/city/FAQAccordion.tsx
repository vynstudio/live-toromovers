"use client";

import { useState } from "react";

export type FAQItem = { q: string; a: string };

export function FAQAccordion({
  kicker = "FAQ",
  title,
  items,
}: {
  kicker?: string;
  title: string;
  items: FAQItem[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <p className="city-sec-kicker">{kicker}</p>
      <h2 className="city-sec-title">{title}</h2>
      <div className="city-faq-list">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="city-faq-item"
              data-open={isOpen ? "true" : "false"}
            >
              <button
                type="button"
                className="city-faq-btn"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className="city-faq-chevron" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 4.5 6 8l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
              {isOpen ? <div className="city-faq-panel">{item.a}</div> : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
