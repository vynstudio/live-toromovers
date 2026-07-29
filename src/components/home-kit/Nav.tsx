"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { nav } from "@/lib/home-kit-content";
import { BUSINESS_NAME, PHONE_TEL } from "@/lib/contact";

/**
 * Desktop: sticky top pill.
 * Mobile: top while in hero; hides when past hero (sticky Call/Quote takes over).
 */
export function Nav() {
  const [hiddenMobile, setHiddenMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");

    const update = () => {
      if (!mq.matches) {
        setHiddenMobile(false);
        return;
      }

      const hero = document.getElementById("hero");
      if (!hero) {
        setHiddenMobile(window.scrollY > 200);
        return;
      }

      setHiddenMobile(hero.getBoundingClientRect().bottom < 8);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  return (
    <>
      <div className="site-header-spacer" aria-hidden />
      <header
        className={`site-header pointer-events-none${
          hiddenMobile ? " site-header--hidden" : ""
        }`}
        data-mobile-nav={hiddenMobile ? "hidden" : "visible"}
      >
        <nav className="nav-pill pointer-events-auto" aria-label="Primary">
          <div className="nav-left">
            <a
              href="/"
              className="brand-lockup tap-target"
              aria-label={`${BUSINESS_NAME} home`}
            >
              <span className="brand-mark" aria-hidden>
                <Image
                  src="/logos/toro-bull-black.svg"
                  alt=""
                  width={32}
                  height={26}
                  priority
                  className="brand-bull"
                />
              </span>
              <span className="brand-name">
                TORO<span className="brand-dot">·</span>MOVERS
              </span>
            </a>
          </div>

          <div className="nav-center">
            <ul className="nav-links">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="nav-link tap-target inline-flex items-center rounded-md transition-opacity hover:opacity-70"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-right">
            <a
              href={PHONE_TEL}
              data-cta="nav-phone"
              className="btn-primary tap-target nav-cta"
            >
              Call now
            </a>
            <button
              type="button"
              data-open-quote
              data-source="nav-quote"
              data-cta="nav-quote"
              className="btn-primary tap-target nav-cta nav-cta-quote"
            >
              {nav.cta}
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}
