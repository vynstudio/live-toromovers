import type { Metadata } from "next";
import Link from "next/link";
import {
  LeadCaptureAgent,
  LeadCaptureSticky,
} from "@/components/lead-capture-agent";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  GOOGLE_RATING,
  BUSINESS_NAME,
} from "@/lib/contact";
import { PRICING } from "@/lib/pricing";

export const metadata: Metadata = {
  title: { absolute: "Cotiza tu mudanza en 60 segundos | Toro Movers" },
  description:
    "Precios por hora claros en Florida Central. Nombre + teléfono y ve un rango típico. Sin cargos ocultos. Empresa familiar · bilingüe.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/es/get-my-price" },
};

const PROOF = [
  {
    quote:
      "Great experience! The team was on time, professional, and handled everything with care. Very easy to work with and made my move stress-free.",
    name: "Stael G.",
    meta: "Apartment move",
  },
  {
    quote:
      "Very communicative about timing and friendly throughout. So far everything made it to the new place without damage. Highly recommend!",
    name: "Olivia H.",
    meta: "Full-service move",
  },
  {
    quote:
      "The hourly rate was upfront so no shock. Patient crew — nobody complained when plans changed mid-move.",
    name: "Kony C.",
    meta: "Kissimmee → Clermont",
  },
];

export default function GetMyPriceEsPage() {
  const fs = PRICING.fullService;
  const lo = PRICING.laborOnly;

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
        <a href={PHONE_TEL} className="lca-top-phone">
          {PHONE_DISPLAY}
        </a>
      </header>

      <section className="lca-hero">
        <div className="lca-hero-copy">
          <p className="lca-eyebrow">
            <span className="lca-stars" aria-hidden>
              ★★★★★
            </span>
            {GOOGLE_RATING} en Google · Familiar · Florida Central
          </p>
          <h1 className="lca-h1">
            Cotiza tu mudanza.
            <em> Sin cargos ocultos.</em>
          </h1>
          <p className="lca-lede">
            Precio por hora por adelantado. Déjanos tu teléfono — te mostramos un
            rango típico en menos de un minuto y una persona real confirma el
            precio exacto.
          </p>
          <ul className="lca-bullets">
            <li>
              Full-service desde ${fs.baseRate}/hr (2 mudanceros + camión, mín.{" "}
              {fs.minimumHours} hrs)
            </li>
            <li>
              Solo labor desde ${lo.baseRate}/hr (tú traes el camión, mín.{" "}
              {lo.minimumHours} hrs)
            </li>
            <li>Sin gasolina extra · sin cargos por escaleras · bilingüe</li>
          </ul>
        </div>

        <div className="lca-card" id="get-price">
          <p className="lca-card-kicker">Precio gratis · ~45 segundos</p>
          <LeadCaptureAgent lang="es" />
        </div>
      </section>

      <section className="lca-proof" aria-label="Reseñas">
        <h2 className="lca-h2">Lo que dice Florida Central</h2>
        <div className="lca-reviews">
          {PROOF.map((r) => (
            <figure key={r.name} className="lca-review">
              <div className="lca-stars" aria-hidden>
                ★★★★★
              </div>
              <blockquote>“{r.quote}”</blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                <span>{r.meta}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="lca-why">
        <h2 className="lca-h2">Por qué eligen Toro</h2>
        <div className="lca-why-grid">
          <div>
            <h3>Misma cuadrilla que cotiza</h3>
            <p>Sin call center. Empresa familiar — dueños en el trabajo.</p>
          </div>
          <div>
            <h3>El reloj para al terminar</h3>
            <p>Precio por hora con mínimo claro. Sin sorpresas al final.</p>
          </div>
          <div>
            <h3>Materiales incluidos</h3>
            <p>Plástico, frazadas y armado básico en la tarifa.</p>
          </div>
        </div>
      </section>

      <section className="lca-bottom-cta">
        <h2>¿Prefieres hablarlo?</h2>
        <p>Somos personas reales en Florida Central — no un franquicia.</p>
        <div className="lca-bottom-row">
          <a href={PHONE_TEL} className="fn-btn fn-btn-primary fn-btn-lg">
            Llamar {PHONE_DISPLAY}
          </a>
          <a href="#get-price" className="fn-btn fn-btn-ghost-light">
            Ver mi precio
          </a>
        </div>
      </section>

      <footer className="lca-foot">
        <p>
          © {new Date().getFullYear()} {BUSINESS_NAME} · Orlando y Florida
          Central · <Link href="/privacy">Privacidad</Link> ·{" "}
          <Link href="/get-my-price">English</Link>
        </p>
      </footer>

      <LeadCaptureSticky lang="es" />
    </main>
  );
}
