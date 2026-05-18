"use client";

import { useLang } from "./lang-provider";
import { RequestButton } from "./request-button";

export function Services() {
  const { t } = useLang();
  return (
    <section className="block" id="services">
      <div className="block-inner">
        <div className="block-eyebrow">{t.services.eyebrow}</div>
        <h2 className="block-h2">
          {t.services.head} <em>{t.services.headItalic}</em>
        </h2>
        <p className="block-sub">{t.services.sub}</p>

        <div className="tiers">
          {t.services.tiers.map((tier, i) => (
            <article key={i} className={`tier${i === 1 ? " featured" : ""}`}>
              {tier.tag && <span className="tier-tag">{tier.tag}</span>}
              <h3 className="tier-title">{tier.title}</h3>
              <p className="tier-sub">{tier.sub}</p>
              <ul className="tier-bullets">
                {tier.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
              <RequestButton label={tier.cta} variant={i === 1 ? "primary" : "secondary"} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
