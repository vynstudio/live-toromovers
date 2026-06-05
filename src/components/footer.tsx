"use client";

import { useLang } from "./lang-provider";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  EMAIL,
  EMAIL_HREF,
  HOURS_LABEL,
  HOURS_LABEL_ES,
  HOURS_NOTE,
  HOURS_NOTE_ES,
  LEGAL_NAME,
} from "@/lib/contact";

// Central Florida counties we cover — The Villages (Sumter/Lake/Marion)
// down to Davenport (Polk), plus the Orlando-metro core.
const COUNTIES = [
  "Orange",
  "Seminole",
  "Osceola",
  "Lake",
  "Polk",
  "Sumter",
  "Marion",
  "Volusia",
];

export function Footer() {
  const { t, lang } = useLang();
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="brand">
              <span className="brand-mark" aria-hidden>
                <img src="/bull.svg" alt="" />
              </span>
              <span className="brand-name">TORO<span className="accent">·</span>MOVERS</span>
            </a>
            <p>{t.footer.tagline}</p>
          </div>

          <div className="footer-col">
            <h4>{lang === "es" ? "Contacto" : "Contact"}</h4>
            <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
            <a href={EMAIL_HREF}>{EMAIL}</a>
            <p style={{ marginTop: 12 }}>{lang === "es" ? HOURS_LABEL_ES : HOURS_LABEL}</p>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              {lang === "es" ? HOURS_NOTE_ES : HOURS_NOTE}
            </p>
          </div>

          <div className="footer-col">
            <h4>{lang === "es" ? "Navegación" : "Menu"}</h4>
            <a href="#services">{t.nav.services}</a>
            <a href="#process">{t.nav.process}</a>
            <a href="#reviews">{t.nav.reviews}</a>
            <a href="#faq">{t.nav.faq}</a>
          </div>
        </div>

        <nav className="footer-cities" aria-label={lang === "es" ? "Condados" : "Counties we serve"}>
          <h4 className="footer-cities-label">
            {lang === "es" ? "Condados que cubrimos" : "Counties we serve"}
          </h4>
          <div className="footer-cities-links">
            {COUNTIES.map((c) => (
              <span key={c}>{c} County</span>
            ))}
          </div>
        </nav>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {LEGAL_NAME}. {t.footer.legal}.</span>
          <span>{lang === "es" ? "Hablamos español" : "Bilingual · Hablamos español"}</span>
        </div>
      </div>
    </footer>
  );
}
