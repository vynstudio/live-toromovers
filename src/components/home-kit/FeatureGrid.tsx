import { featureGrid } from "@/lib/home-kit-content";
import { FeatureIcon, IconArrow } from "./icons";

/**
 * Services — high on mobile conversion path.
 * 1-col → 2-col (768) → 3-col (1024).
 */
export function FeatureGrid() {
  return (
    <section
      id="services"
      className="full-bleed section-pad w-full bg-white"
      aria-label="Services and capabilities"
    >
      <div className="site-container">
        <h2 className="fluid-h2 mb-8 text-foreground md:mb-12 md:text-center">
          What we handle
        </h2>

        <div className="section-grid section-grid-3">
          {featureGrid.items.map((item) => (
            <div
              key={item.title}
              className="service-card flex w-full flex-col items-start text-left md:items-center md:text-center"
            >
              <div className="icon-circle mb-3 md:mb-4" aria-hidden>
                <FeatureIcon name={item.icon} />
              </div>
              <h3 className="fluid-h3 text-foreground">{item.title}</h3>
              <p className="aeo-answer mt-2 w-full max-w-none text-[var(--text-body)] leading-relaxed text-muted md:mx-auto md:max-w-sm">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center md:mt-14">
          <button
            type="button"
            data-open-quote
            data-source="features-quote"
            data-cta="features-quote"
            className="btn-outline btn-fluid tap-target inline-flex w-full max-w-sm md:w-auto md:max-w-none"
          >
            {featureGrid.cta}
            <IconArrow />
          </button>
        </div>
      </div>
    </section>
  );
}
