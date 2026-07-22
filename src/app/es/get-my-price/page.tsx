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

export const metadata: Metadata = {
  title: { absolute: "Cotización gratis de mudanza | Toro Movers" },
  description:
    "Solicita tu cotización de mudanza en Florida Central. Empresa familiar, bilingüe, sin cargos ocultos. Te llamamos con un precio claro.",
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
            Cotiza gratis.
            <em> Sin cargos ocultos.</em>
          </h1>
          <p className="lca-lede">
            Cuéntanos un poco de tu mudanza — un miembro del equipo te llama con
            disponibilidad y un precio claro. Sin sorpresas en la factura.
          </p>
          <ul className="lca-bullets">
            <li>Full-service: camión + cuadrilla, empaque disponible</li>
            <li>Solo labor: tú traes el camión o POD — nosotros cargamos</li>
            <li>Sin gasolina extra · sin cargos por escaleras · bilingüe</li>
          </ul>
        </div>

        <div className="lca-card" id="get-price">
          <p className="lca-card-kicker">Cotización gratis · menos de un minuto</p>
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
            <p>Tarifa por hora con mínimo claro. Sin sorpresas al final.</p>
          </div>
          <div>
            <h3>Materiales incluidos</h3>
            <p>Plástico, frazadas y armado básico en la tarifa.</p>
          </div>
        </div>
      </section>

      <section className="lca-bottom-cta">
        <h2>¿Prefieres hablarlo?</h2>
        <p>Empresa familiar en Florida Central — no una franquicia.</p>
        <div className="lca-bottom-row">
          <a href={PHONE_TEL} className="fn-btn fn-btn-primary fn-btn-lg">
            Llamar {PHONE_DISPLAY}
          </a>
          <a href="#get-price" className="fn-btn fn-btn-ghost-light">
            Pedir cotización
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
