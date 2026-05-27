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
import { SERVICE_CITIES } from "@/lib/content";

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
            <a href="#areas">{t.nav.areas}</a>
            <a href="#reviews">{t.nav.reviews}</a>
            <a href="#faq">{t.nav.faq}</a>
          </div>
        </div>

        <div>
          <h4 style={{
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--muted)", marginBottom: 12,
          }}>
            {t.footer.serviceArea}
          </h4>
          <p className="footer-cities">
            {SERVICE_CITIES.map((c) => `${c}, FL`).join(" · ")}
          </p>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {LEGAL_NAME}. {t.footer.legal}.</span>
          <span>{lang === "es" ? "Hablamos español" : "Bilingual · Hablamos español"}</span>
        </div>
      </div>
    </footer>
  );
}
