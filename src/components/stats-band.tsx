"use client";

import { CountUp } from "./count-up";
import { useLang } from "./lang-provider";
import { GOOGLE_RATING } from "@/lib/contact";

export function StatsBand() {
  const { lang } = useLang();
  const labels = lang === "es"
    ? {
        rating: "Reseña en Google",
        moves: "Mudanzas completadas",
        cities: "Ciudades servidas",
        bilingual: "Cuadrilla bilingüe",
      }
    : {
        rating: "Rating on Google",
        moves: "Moves completed",
        cities: "Cities served",
        bilingual: "Bilingual crew",
      };

  return (
    <section className="stats-band" aria-label="Quick stats">
      <div className="stats-band-inner">
        <div className="stat reveal">
          <span className="stat-value">
            {/* Rating is static (not counted up) so it never flashes "0.0★",
                which reads as a placeholder / hurts credibility. */}
            {GOOGLE_RATING}★
          </span>
          <span className="stat-label">{labels.rating}</span>
        </div>
        <div className="stat reveal reveal-d1">
          <span className="stat-value">
            <CountUp end={100} suffix="+" />
          </span>
          <span className="stat-label">{labels.moves}</span>
        </div>
        <div className="stat reveal reveal-d2">
          <span className="stat-value">
            <CountUp end={35} suffix="+" />
          </span>
          <span className="stat-label">{labels.cities}</span>
        </div>
        <div className="stat reveal reveal-d3">
          <span className="stat-value">EN · ES</span>
          <span className="stat-label">{labels.bilingual}</span>
        </div>
      </div>
    </section>
  );
}
