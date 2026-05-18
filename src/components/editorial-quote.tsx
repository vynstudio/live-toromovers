"use client";

import { useLang } from "./lang-provider";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

export function EditorialQuote() {
  const { t } = useLang();
  return (
    <section className="block about" id="about">
      <div className="block-inner">
        <div className="block-eyebrow">{t.about.eyebrow}</div>
        <h2 className="block-h2">
          {t.about.head} <em>{t.about.headItalic}</em>
        </h2>

        <div className="about-grid">
          <div className="about-body">
            {t.about.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p>
              <a
                href={PHONE_TEL}
                className="serif"
                style={{ color: "var(--red)", fontWeight: 600, textDecoration: "none" }}
              >
                {PHONE_DISPLAY}
              </a>
            </p>
          </div>
          <ul className="about-bullets">
            {t.about.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
