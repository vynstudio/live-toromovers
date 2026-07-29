import { faq } from "@/lib/home-kit-content";

/**
 * Accordion FAQ — collapsed by default so the section stays short.
 * Uses native <details>/<summary> (no JS, keyboard-accessible).
 * Answers remain in the DOM for SEO / AEO.
 */
export function Faq() {
  return (
    <section
      id="faq"
      className="full-bleed w-full border-t border-border bg-white py-8 sm:py-10"
      aria-labelledby="faq-heading"
    >
      <div className="site-container-narrow">
        <div className="faq-head">
          <h2 id="faq-heading" className="faq-title">
            {faq.heading}
          </h2>
          <p className="faq-sub">{faq.sub}</p>
        </div>

        <div className="faq-accordion">
          {faq.items.map((item, i) => (
            <details key={item.q} className="faq-details" name="toro-faq">
              <summary className="faq-summary">
                <span className="faq-summary-text">{item.q}</span>
                <span className="faq-chevron" aria-hidden>
                  +
                </span>
              </summary>
              <div className="aeo-answer faq-panel">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
