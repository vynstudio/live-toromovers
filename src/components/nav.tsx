"use client";

import { useEffect, useState } from "react";
import { RequestButton } from "./request-button";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`top${scrolled ? " scrolled" : ""}`}>
      <a href="#" className="brand">
        Grace<span className="ampersand"> &amp;</span> Co.
        <span className="est">Est. Northeast Florida</span>
      </a>
      <div className="nav-links">
        <a href="#services">Services</a>
        <a href="#process">Process</a>
        <a href="#areas">Areas</a>
        <a href="#faq">FAQ</a>
      </div>
      <RequestButton />
    </nav>
  );
}
