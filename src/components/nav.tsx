"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "./lang-provider";
import { LangToggle } from "./lang-toggle";
import { RequestButton } from "./request-button";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

const SERVICE_LINKS = [
  { href: "/full-service-moving", labelEn: "Full-Service Moving", labelEs: "Mudanza completa" },
  {
    href: "/apartment-movers-orlando-fl",
    labelEn: "Apartment Movers",
    labelEs: "Mudanzas de apartamento",
  },
  { href: "/labor-only-moving", labelEn: "Labor-Only Moving", labelEs: "Solo mano de obra" },
  { href: "/commercial-movers", labelEn: "Commercial Movers", labelEs: "Mudanzas comerciales" },
] as const;

const AREA_LINKS = [
  { href: "/orlando-movers", label: "Orlando" },
  { href: "/altamonte-springs-movers", label: "Altamonte Springs" },
  { href: "/winter-park-movers", label: "Winter Park" },
  { href: "/maitland-movers", label: "Maitland" },
  { href: "/lake-mary-movers", label: "Lake Mary" },
  { href: "/sanford-movers", label: "Sanford" },
  { href: "/kissimmee-movers", label: "Kissimmee" },
  { href: "/service-areas", labelEn: "View All Areas", labelEs: "Ver todas las áreas" },
] as const;

const NAV_COMPACT_PX = 16;
/** Mobile: hide nav bar past this scroll; sticky Call/Quote bar takes over. */
const NAV_AWAY_PX = 72;

export function Nav() {
  const { t, lang } = useLang();
  const es = lang === "es";
  const [scrolled, setScrolled] = useState(false);
  const [navAway, setNavAway] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState<"services" | "areas" | null>(null);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setScrolled(y > NAV_COMPACT_PX);
      // Only hide on narrow screens; desktop keeps fixed nav
      const mobile =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(max-width: 979px)").matches;
      setNavAway(mobile && y > NAV_AWAY_PX);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler, { passive: true });
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileOpen(null);
  };

  // Keep nav visible while the mobile menu is open
  const hideNav = navAway && !menuOpen;

  return (
    <nav
      className={`top${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}${hideNav ? " nav-away" : ""}`}
    >
      <a
        href="/"
        className="brand"
        aria-label="Toro Movers — Home"
        onClick={closeMenu}
      >
        <span className="brand-mark" aria-hidden>
          <img src="/bull.svg" alt="" />
        </span>
        <span className="brand-name">
          TORO<span className="accent">·</span>MOVERS
        </span>
      </a>

      <div className="nav-links" aria-label="Main">
        <div className="nav-dropdown">
          <button type="button" className="nav-dropdown-trigger" aria-haspopup="true">
            {t.nav.services}
            <span className="nav-caret" aria-hidden />
          </button>
          <div className="nav-dropdown-panel" role="menu">
            {SERVICE_LINKS.map((s) => (
              <Link key={s.href} href={s.href} role="menuitem">
                {es ? s.labelEs : s.labelEn}
              </Link>
            ))}
          </div>
        </div>

        <div className="nav-dropdown">
          <button type="button" className="nav-dropdown-trigger" aria-haspopup="true">
            {t.nav.areas}
            <span className="nav-caret" aria-hidden />
          </button>
          <div className="nav-dropdown-panel" role="menu">
            {AREA_LINKS.map((a) => (
              <Link key={a.href} href={a.href} role="menuitem">
                {"label" in a
                  ? a.label
                  : es
                    ? a.labelEs
                    : a.labelEn}
              </Link>
            ))}
          </div>
        </div>

        <a href="/#services">{t.nav.pricing}</a>
        <a href="/#reviews">{t.nav.reviews}</a>
      </div>

      <div className="nav-right">
        <a href={PHONE_TEL} className="nav-phone">
          <span className="nav-phone-dot" aria-hidden />
          {PHONE_DISPLAY}
        </a>
        <LangToggle />
        <RequestButton label={t.nav.quote} source="nav" />
        <button
          type="button"
          className="nav-menu-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="nav-mobile-panel"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="nav-menu-icon" aria-hidden data-open={menuOpen}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {menuOpen ? (
        <div
          id="nav-mobile-panel"
          className="nav-mobile-panel"
          role="dialog"
          aria-label="Site menu"
        >
          <div className="nav-mobile-links">
            <button
              type="button"
              className="nav-mobile-section-btn"
              aria-expanded={mobileOpen === "services"}
              onClick={() =>
                setMobileOpen((v) => (v === "services" ? null : "services"))
              }
            >
              {t.nav.services}
              <span className="nav-caret" aria-hidden />
            </button>
            {mobileOpen === "services"
              ? SERVICE_LINKS.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="nav-mobile-sub"
                    onClick={closeMenu}
                  >
                    {es ? s.labelEs : s.labelEn}
                  </Link>
                ))
              : null}

            <button
              type="button"
              className="nav-mobile-section-btn"
              aria-expanded={mobileOpen === "areas"}
              onClick={() =>
                setMobileOpen((v) => (v === "areas" ? null : "areas"))
              }
            >
              {t.nav.areas}
              <span className="nav-caret" aria-hidden />
            </button>
            {mobileOpen === "areas"
              ? AREA_LINKS.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="nav-mobile-sub"
                    onClick={closeMenu}
                  >
                    {"label" in a
                      ? a.label
                      : es
                        ? a.labelEs
                        : a.labelEn}
                  </Link>
                ))
              : null}

            <a href="/#services" onClick={closeMenu}>
              {t.nav.pricing}
            </a>
            <a href="/#reviews" onClick={closeMenu}>
              {t.nav.reviews}
            </a>
          </div>
          <a href={PHONE_TEL} className="nav-mobile-phone" onClick={closeMenu}>
            {es ? "Llamar" : "Call"} {PHONE_DISPLAY}
          </a>
          <a
            href="/get-my-price"
            className="btn btn-primary nav-mobile-cta"
            data-open-quote
            data-source="nav-mobile"
            onClick={closeMenu}
          >
            {t.nav.quote}
            <span className="arrow" aria-hidden />
          </a>
        </div>
      ) : null}
    </nav>
  );
}
