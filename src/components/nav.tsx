"use client";

import { useEffect, useState } from "react";
import { useLang } from "./lang-provider";
import { LangToggle } from "./lang-toggle";
import { RequestButton } from "./request-button";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

export function Nav() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`top${scrolled ? " scrolled" : ""}`}>
      <a href="#" className="brand" aria-label="Toro Movers — Home">
        <span className="brand-mark" aria-hidden>T</span>
        <span className="brand-name">
          TORO<span className="accent">·</span>MOVERS
        </span>
      </a>

      <div className="nav-links" aria-label="Main">
        <a href="#services">{t.nav.services}</a>
        <a href="#process">{t.nav.process}</a>
        <a href="#areas">{t.nav.areas}</a>
        <a href="#reviews">{t.nav.reviews}</a>
        <a href="#faq">{t.nav.faq}</a>
      </div>

      <div className="nav-right">
        <a href={PHONE_TEL} className="nav-phone">
          <span className="nav-phone-dot" aria-hidden />
          {PHONE_DISPLAY}
        </a>
        <LangToggle />
        <RequestButton label={t.nav.quote} />
      </div>
    </nav>
  );
}
