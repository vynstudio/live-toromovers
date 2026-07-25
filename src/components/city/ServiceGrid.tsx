import Link from "next/link";

export type ServiceCard = {
  title: string;
  description: string;
  href?: string;
  meta?: string;
  /** Simple emoji/text icon fallback until SVGs land */
  icon?: string;
};

const DEFAULT_INCLUDE = [
  "Furniture blankets & shrink wrap",
  "Basic assembly / disassembly",
  "Background-checked crew",
  "Upfront hourly pricing",
  "No fuel or stair fees",
];

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 20V11.5M4 8.5l8 3 8-3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function ServiceGrid({
  kicker = "What we move",
  title,
  lead,
  services,
  includeStrip = DEFAULT_INCLUDE,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  services: ServiceCard[];
  includeStrip?: string[];
}) {
  return (
    <>
      <p className="city-sec-kicker">{kicker}</p>
      <h2 className="city-sec-title">{title}</h2>
      {lead ? <p className="city-sec-lead">{lead}</p> : null}
      <div className="city-svc-grid">
        {services.map((s) => {
          const inner = (
            <>
              <span className="city-svc-icon" aria-hidden>
                {s.icon ? <span style={{ fontSize: 16 }}>{s.icon}</span> : <BoxIcon />}
              </span>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              {s.meta ? <span className="city-svc-meta">{s.meta}</span> : null}
            </>
          );
          return s.href ? (
            <Link key={s.title} href={s.href} className="city-svc-card">
              {inner}
            </Link>
          ) : (
            <article key={s.title} className="city-svc-card">
              {inner}
            </article>
          );
        })}
      </div>
      {includeStrip?.length ? (
        <div className="city-include-strip">
          <strong>All moves include</strong>
          {includeStrip.map((item) => (
            <span key={item} className="city-include-item">
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}
