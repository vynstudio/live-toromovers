import { Reveal } from "./reveal";

const areas = [
  { name: "Jacksonville", county: "Duval", zip: "32202 — 32259" },
  { name: "Ponte Vedra", county: "St. Johns", zip: "32081 — 32082" },
  { name: "St. Augustine", county: "St. Johns", zip: "32080 — 32092" },
];

export function Areas() {
  return (
    <section className="areas-section" id="areas">
      <div className="areas-grid">
        <Reveal className="areas-intro">
          <div className="section-eyebrow">
            <span className="roman">III</span> Where we serve
          </div>
          <h2>
            Northeast
            <br />
            Florida,
            <br />
            <em className="gradient-text">quietly.</em>
          </h2>
          <p>
            Currently accepting a limited number of new clients in three coastal
            communities. We would rather serve fewer homes beautifully.
          </p>
        </Reveal>
        <div className="areas-list">
          {areas.map((a, i) => (
            <Reveal
              key={a.name}
              delay={i === 0 ? undefined : (i as 1 | 2 | 3)}
              className="area-item"
            >
              <span className="area-name">{a.name}</span>
              <span className="area-counties">{a.county}</span>
              <span className="area-zip">{a.zip}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
