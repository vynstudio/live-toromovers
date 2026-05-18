import { PhotoFrame } from "./photo-frame";
import { Reveal } from "./reveal";

const spreads = [
  {
    num: "01",
    title: "Initial Deep",
    titleItalic: "Reset.",
    body: "Every relationship begins here. A meticulous, room-by-room reset — baseboards, fixtures, inside cabinets, the details others quietly skip. This visit defines the standard your home will be held to from that day forward.",
    meta: "Required for new clients",
    photo: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=85&auto=format&fit=crop",
    caption: "An en-suite restored.",
    alt: "A bathroom restored to its original standard",
    reverse: false,
  },
  {
    num: "02",
    title: "Recurring",
    titleItalic: "Maintenance.",
    body: "Weekly, bi-weekly, or monthly visits with the same dedicated team. They will learn your home, your preferences, the way you fold your linens. Consistency is the entire point — nothing surprising, ever.",
    meta: "By consultation · most requested",
    photo: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=85&auto=format&fit=crop",
    caption: "A kitchen, weekly.",
    alt: "A kitchen quietly maintained",
    reverse: true,
  },
  {
    num: "03",
    title: "Transition",
    titleItalic: "Care.",
    body: "End-of-lease, pre-listing, settling into a new home. A complete, top-to-bottom service handled discreetly — keys arrive in your hand, the residence ready, the timing immaculate.",
    meta: "Tailored to your home",
    photo: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85&auto=format&fit=crop",
    caption: "Pre-listing, immaculate.",
    alt: "A residence prepared for transition",
    reverse: false,
  },
];

export function Services() {
  return (
    <section className="services-section" id="services">
      <div className="services-head">
        <Reveal>
          <div className="section-eyebrow">
            <span className="roman">I</span> Services
          </div>
        </Reveal>
        <Reveal delay={1}>
          <h2>
            Three relationships
            <br />
            <em className="gradient-text">worth keeping.</em>
          </h2>
        </Reveal>
      </div>

      {spreads.map((s) => (
        <div key={s.num} className={`spread${s.reverse ? " reverse" : ""}`}>
          <div className="photo-frame-wrap">
            <PhotoFrame
              src={s.photo}
              alt={s.alt}
              caption={s.caption}
              plateNo={s.num}
            />
          </div>
          <Reveal delay={1} className="spread-text">
            <div className="spread-num">{s.num}</div>
            <h3>
              {s.title}
              <br />
              <em className="gradient-text">{s.titleItalic}</em>
            </h3>
            <p>{s.body}</p>
            <div className="spread-meta">{s.meta}</div>
          </Reveal>
        </div>
      ))}
    </section>
  );
}
