import type { Metadata } from "next";
import Link from "next/link";
import { UniversalQuoteForm } from "@/components/quote/universal-quote-form";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME } from "@/lib/contact";
import { QUOTE_COPY } from "@/config/quote-form";

export const metadata: Metadata = {
  title: { absolute: "Request a Moving Quote | Toro Movers" },
  description:
    "Tell us where and when you’re moving. A Toro Movers team member will contact you shortly.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/get-a-quote" },
};

export const dynamic = "force-static";

export default function GetAQuotePage() {
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
          <span className="lca-top-responds">{QUOTE_COPY.trustLine}</span>
          <a href={PHONE_TEL} className="lca-top-phone">
            {PHONE_DISPLAY}
          </a>
        </div>
      </header>
      <section className="lca-hero">
        <div className="lca-card">
          <UniversalQuoteForm />
        </div>
      </section>
    </main>
  );
}
