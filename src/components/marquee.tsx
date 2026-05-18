export function Marquee() {
  const items = [
    "Discreet",
    "Bonded",
    "Insured",
    "Background-checked",
    "Family-owned",
    "Same team, every visit",
    "Northeast Florida",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">{item}</span>
        ))}
      </div>
    </div>
  );
}
