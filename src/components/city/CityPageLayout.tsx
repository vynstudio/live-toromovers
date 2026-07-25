import type { ReactNode } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

/**
 * Shared shell for polished city SEO landings.
 * Controls container rhythm, base background, and chrome (nav/footer).
 */
export function CityPageLayout({
  children,
  jsonLd,
}: {
  children: ReactNode;
  /** Optional JSON-LD graph object */
  jsonLd?: Record<string, unknown>;
}) {
  return (
    <div className="city-shell">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export function CityContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`city-container ${className}`.trim()}>{children}</div>;
}

export function CitySection({
  children,
  soft,
  navy,
  id,
  className = "",
}: {
  children: ReactNode;
  soft?: boolean;
  navy?: boolean;
  id?: string;
  className?: string;
}) {
  const mods = [
    "city-section",
    soft ? "city-section--soft" : "",
    navy ? "city-section--navy" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <section id={id} className={mods}>
      <CityContainer>{children}</CityContainer>
    </section>
  );
}
