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
  title: { absolute: "Cotización gratis de mudanza | Toro Movers" },
  description:
    "Solicita tu cotización de mudanza en Florida Central. Empresa familiar, bilingüe, sin cargos ocultos. Te llamamos con un precio claro.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/es/get-my-price" },
};

export default function GetMyPriceEsPage() {
  return (
    <main className="lca-page" lang="es">
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
          <span className="lca-top-responds">Respondemos en minutos</span>
          <a href={PHONE_TEL} className="lca-top-phone">
            {PHONE_DISPLAY}
          </a>
        </div>
      </header>

      <section className="lca-hero">
        <div className="lca-card" id="get-price">
          <LeadCaptureAgent lang="es" />
        </div>
      </section>
    </main>
  );
}
