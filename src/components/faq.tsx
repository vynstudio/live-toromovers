"use client";

import { useState } from "react";
import { useLang } from "./lang-provider";

export function Faq() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="block faq" id="faq">
      <div className="block-inner">
        <div className="block-eyebrow">{t.faq.eyebrow}</div>
        <h2 className="block-h2" style={{ marginBottom: 40 }}>
          {t.faq.head} <em>{t.faq.headItalic}</em>
        </h2>

        <div className="faq-list">
          {t.faq.items.map((item, i) => (
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
