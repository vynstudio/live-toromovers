import type { Metadata } from "next";
import Link from "next/link";
import {
  BUSINESS_NAME,
  EMAIL,
  EMAIL_HREF,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "@/lib/contact";

// Legal page — indexable for trust/E-E-A-T; short title (template adds brand).
export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Toro Movers collects and uses contact details for moving quotes in Central Florida. We do not sell your personal information.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="quote-page" style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.25rem 5rem" }}>
      <header className="quote-header" style={{ marginBottom: "2rem" }}>
        <Link href="/" className="brand" aria-label="Toro Movers — Home">
          <span className="brand-mark" aria-hidden>
            <img src="/bull.svg" alt="" />
          </span>
          <span className="brand-name">
            TORO<span className="accent">·</span>MOVERS
          </span>
        </Link>
      </header>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>
        Privacy policy
      </h1>
      <div style={{ display: "grid", gap: "1rem", lineHeight: 1.6, color: "var(--text, #1a1a1a)" }}>
        <p>Last updated: July 14, 2026</p>
        <p>
          {BUSINESS_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates toromovers.net
          to provide moving quotes and bookings in Central Florida. This policy
          explains what we collect and how we use it.
        </p>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "0.5rem" }}>
          What we collect
        </h2>
        <p>
          Information you submit through our forms: name, phone number, email,
          move date, pickup and drop-off areas, and any details you share about
          your move.
        </p>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "0.5rem" }}>
          How we use it
        </h2>
        <p>
          To respond to your quote request, prepare and confirm your move, and
          apply any offers you claimed. By submitting a form you agree that we
          may contact you by phone, text message, or email about your request.
          Message and data rates may apply; reply STOP to opt out of texts at any
          time.
        </p>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "0.5rem" }}>
          Who we share it with
        </h2>
        <p>
          We store leads in our customer-management tools (such as HubSpot) and
          internal notifications. We use advertising measurement services (such
          as Meta) to understand how our ads perform; where applicable, contact
          details are hashed before being shared for measurement. We do not sell
          your personal information.
        </p>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "0.5rem" }}>
          Cookies
        </h2>
        <p>
          This site may use cookies set by advertising platforms (such as the
          Meta pixel) to measure ad performance. You can control cookies through
          your browser settings.
        </p>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "0.5rem" }}>
          Contact
        </h2>
        <p>
          Questions or requests to access or delete your information:{" "}
          <a href={EMAIL_HREF}>{EMAIL}</a> or{" "}
          <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/" style={{ fontWeight: 600 }}>
            ← Back to the site
          </Link>
        </p>
      </div>
    </main>
  );
}
