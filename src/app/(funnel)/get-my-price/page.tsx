import type { Metadata } from "next";
import Link from "next/link";
import {
  LeadCaptureAgent,
} from "@/components/lead-capture-agent";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  BUSINESS_NAME,
} from "@/lib/contact";

export const metadata: Metadata = {
  title: { absolute: "Get a Free Moving Quote | Toro Movers" },
  description:
    "Request your Central Florida moving quote. Family-owned, bilingual crew, no hidden fees. We call you back with clear pricing.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/get-my-price" },
};

/**
 * Pure sales funnel (matches toro-sales-funnel).
 * Contact first → soft lead → service → ZIPs → size → optional → when.
 */
export default function GetMyPricePage() {
  return (
    <main className="lca-page">
      <header className="lca-top">
        <Link href="/" className="lca-brand" aria-label={BUSINESS_NAME}>
          <span className="lca-brand-mark" aria-hidden>
            <img src="/bull.svg" alt="" width={18} height={18} />
          </span>
          <span>
            TORO<span className="lca-accent">·</span>MOVERS
          </span>
        </Link>
        <div className="lca-top-meta">
          <span className="lca-top-responds">Usually responds in minutes</span>
          <a href={PHONE_TEL} className="lca-top-phone">
            {PHONE_DISPLAY}
          </a>
        </div>
      </header>

      <section className="lca-hero">
        <div className="lca-card" id="get-price">
          <LeadCaptureAgent lang="en" />
        </div>
      </section>
    </main>
  );
}
