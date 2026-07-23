"use client";

import { useLang } from "./lang-provider";
import { LangToggle } from "./lang-toggle";
import { TrustBand } from "./trust-band";
import { Services } from "./services";
import { FeatureQuote } from "./feature-quote";
import { Faq } from "./faq";
import { ClosingCta } from "./closing-cta";
import { Footer } from "./footer";
import { StickyCta } from "./sticky-cta";
import { AdQuoteStart } from "./ad-quote-start";
import { PHONE_DISPLAY, PHONE_TEL, GOOGLE_RATING } from "@/lib/contact";

// Paid-traffic landing page. Conversion-focused split hero: form (step-1 of
// the sales funnel) on the left above-fold, single static photo on the right.
// All CTAs ultimately reach /get-my-price (LeadCaptureAgent).
export function AdLanding() {
  const { t, lang } = useLang();
  const es = lang === "es";

  return (
    <>
      <nav className="top scrolled">
        <span className="brand" aria-label="Toro Movers">
          <span className="brand-mark" aria-hidden>
            <img src="/bull.svg" alt="" />
          </span>
          <span className="brand-name">
            TORO<span className="accent">·</span>MOVERS
          </span>
        </span>
        <div className="nav-right">
          <a href={PHONE_TEL} className="nav-phone">
            <span className="nav-phone-dot" aria-hidden />
            {PHONE_DISPLAY}
          </a>
          <LangToggle />
        </div>
      </nav>

      <section className="ad-hero">
        <div className="ad-hero-grid">
          <div className="ad-hero-left">
            <div className="ad-hero-badge">
              <span className="stars" aria-hidden>★★★★★</span>
              {GOOGLE_RATING} {es ? "en Google · 30+ reseñas" : "on Google · 30+ reviews"}
            </div>
            <h1 className="ad-hero-h1">
              {es ? "Mudanzas en Florida Central" : "Central Florida movers"}
              <em>{es ? " — precio justo, empresa familiar." : " — fair pricing, family-owned."}</em>
            </h1>
            <p className="ad-hero-lede">
              {es
                ? "Solo mano de obra o servicio completo con camión — precio por hora, sin tarifas ocultas. Cotización en 60 segundos."
                : "Labor-only or full-service with a truck — up-front hourly pricing, no hidden fees. Quote in 60 seconds."}
            </p>
            <AdQuoteStart />
          </div>
          <div className="ad-hero-right" aria-hidden>
            <img
              src="/hero/slide-02.webp"
              alt=""
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>

        <div className="ad-strip" aria-label={es ? "Datos rápidos" : "At a glance"}>
          <div className="ad-strip-cell"><b>$0</b><span>{es ? "tarifas ocultas" : "hidden fees"}</span></div>
          <div className="ad-strip-cell"><b>{GOOGLE_RATING}★</b><span>{es ? "Google · 30+ reseñas" : "Google · 30+ reviews"}</span></div>
          <div className="ad-strip-cell"><b>2h</b><span>{es ? "mínimo" : "minimum"}</span></div>
          <div className="ad-strip-cell"><b>60s</b><span>{es ? "cotización" : "quote"}</span></div>
        </div>
      </section>

      <TrustBand />
      <Services />
      <FeatureQuote />
      <Faq />
      <ClosingCta />
      <Footer />
      <StickyCta />
    </>
  );
}
