import type { Metadata } from "next";
import Link from "next/link";
import { SquareAppointmentsEmbed } from "@/components/square-appointments-embed";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  BUSINESS_NAME,
} from "@/lib/contact";

export const metadata: Metadata = {
  title: { absolute: "Reserve su mudanza | Toro Movers" },
  description:
    "Reserve su mudanza en Florida Central en línea con Toro Movers. Elija fecha y pague el depósito con Square.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/es/book" },
};

export default function BookPageEs() {
  return (
    <main className="lca-page sq-book-page">
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
          <span className="lca-top-responds">Reserve en línea · depósito</span>
          <a href={PHONE_TEL} className="lca-top-phone">
            {PHONE_DISPLAY}
          </a>
        </div>
      </header>

      <section className="lca-hero sq-book-hero">
        <div className="lca-card sq-book-card" id="book">
          <SquareAppointmentsEmbed lang="es" />
        </div>
        <p className="sq-book-alt">
          ¿Prefiere llamar?{" "}
          <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          {" · "}
          <Link href="/es/get-my-price">Cotización gratis</Link>
        </p>
      </section>
    </main>
  );
}
