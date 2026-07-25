import { CityContainer } from "./CityPageLayout";

export function NeighborhoodStrip({
  label = "Serving",
  neighborhoods,
}: {
  label?: string;
  neighborhoods: string[];
}) {
  if (!neighborhoods.length) return null;
  return (
    <div className="city-nbhd-strip">
      <CityContainer>
        <div className="city-section" style={{ paddingTop: "1.25rem", paddingBottom: "1.25rem" }}>
          <p className="city-nbhd-label">{label}</p>
          <div className="city-nbhd-pills">
            {neighborhoods.map((n) => (
              <span key={n} className="city-nbhd-pill">
                {n}
              </span>
            ))}
          </div>
        </div>
      </CityContainer>
    </div>
  );
}
