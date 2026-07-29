import Image from "next/image";
import { footer } from "@/lib/home-kit-content";
import {
  BUSINESS_NAME,
  EMAIL,
  EMAIL_HREF,
  PHONE_DISPLAY,
  PHONE_TEL,
  SOCIAL,
} from "@/lib/contact";
import { IconFacebook, IconInstagram, IconX } from "./icons";

/**
 * Dark footer only.
 * Brand bar: socials + white bull + TORO·MOVERS as one centered lockup row.
 */
export function Footer() {
  return (
    <footer className="full-bleed w-full bg-foreground px-[var(--container-pad)] pb-28 text-white md:pb-4">
      <div className="site-container border-t border-white/10">
        {/* Single row: f · X · IG · bull · TORO·MOVERS */}
        <div className="footer-bar" role="group" aria-label="Brand and social">
          <a
            href={SOCIAL.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="footer-social-link"
          >
            <IconFacebook />
          </a>
          <a
            href={SOCIAL.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="footer-social-link"
          >
            <IconX />
          </a>
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="footer-social-link"
          >
            <IconInstagram />
          </a>

          <a
            href="/"
            className="footer-lockup"
            aria-label={`${BUSINESS_NAME} home`}
          >
            <Image
              src="/logos/toro-bull-white.svg"
              alt=""
              width={40}
              height={32}
              className="footer-bull"
              priority={false}
            />
            <span className="footer-wordmark">
              TORO<span className="footer-dot">·</span>MOVERS
            </span>
          </a>
        </div>

        <div className="footer-meta">
          <a
            href={PHONE_TEL}
            data-cta="footer-phone"
            className="tap-target min-h-0 py-1"
          >
            {PHONE_DISPLAY}
          </a>
          <a href={EMAIL_HREF} className="tap-target min-h-0 py-1">
            {EMAIL}
          </a>
          <a href={footer.privacyHref} className="tap-target min-h-0 py-1">
            {footer.privacy}
          </a>
          <a href={footer.cookiesHref} className="tap-target min-h-0 py-1">
            {footer.cookies}
          </a>
          <a href={footer.termsHref} className="tap-target min-h-0 py-1">
            {footer.terms}
          </a>
        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} {BUSINESS_NAME}. Local movers serving
          Central Florida · Orlando, FL
        </p>
      </div>
    </footer>
  );
}
