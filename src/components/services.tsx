"use client";

import Link from "next/link";
import { useLang } from "./lang-provider";
import { RequestButton } from "./request-button";

// Homepage service cards → their dedicated service pages. Index-aligned with
// t.services.tiers: 0 Loading help, 1 In-town move, 2 Big-day move.
const TIER_LINKS = [
  "/labor-only-moving",
  "/residential-movers",
  "/full-service-moving",
];

export function Services() {
  const { t, lang } = useLang();
  return (
    <section className="block" id="services">
      <div className="block-inner">
        <div className="block-eyebrow reveal">{t.services.eyebrow}</div>
        <h2 className="block-h2 reveal reveal-d1">
          {t.services.head} <em>{t.services.headItalic}</em>
        </h2>
        <p className="block-sub reveal reveal-d2">{t.services.sub}</p>

        <div className="tiers">
          {t.services.tiers.map((tier, i) => (
            <article key={i} className={`tier reveal${i === 1 ? " featured reveal-d1" : i === 2 ? " reveal-d2" : ""}`}>
              {tier.tag && <span className="tier-tag">{tier.tag}</span>}
              <h3 className="tier-title">{tier.title}</h3>
              <p className="tier-sub">{tier.sub}</p>
              <ul className="tier-bullets">
                {tier.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
              <RequestButton label={tier.cta} variant={i === 1 ? "primary" : "secondary"} />
              <Link href={TIER_LINKS[i]} className="tier-learn-more">
                {lang === "es" ? "Ver más →" : "Learn more →"}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
