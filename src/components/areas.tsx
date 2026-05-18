"use client";

import { useLang } from "./lang-provider";
import { AREAS_BY_COUNTY } from "@/lib/content";

export function Areas() {
  const { t, lang } = useLang();
  return (
    <section className="block areas" id="areas">
      <div className="block-inner">
        <div className="block-eyebrow">{t.areas.eyebrow}</div>
        <h2 className="block-h2">
          {t.areas.head} <em>{t.areas.headItalic}</em>
        </h2>
        <p className="block-sub">{t.areas.intro}</p>

        <div className="areas-grid">
          {AREAS_BY_COUNTY.map((c) => (
            <div key={c.county} className="county-card">
              <h3>{lang === "es" ? c.countyEs : c.county}</h3>
              <div className="county-meta">
                {c.cities.length} {lang === "es" ? "ciudades" : "cities"}
              </div>
              <ul>
                {c.cities.map((city) => (
                  <li key={city}>{city}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="areas-fallback">{t.areas.fallback}</p>
      </div>
    </section>
  );
}
