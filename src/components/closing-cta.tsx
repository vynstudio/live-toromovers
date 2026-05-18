import { Reveal } from "./reveal";
import { RequestButton } from "./request-button";

export function ClosingCta() {
  return (
    <section className="closing-cta">
      <Reveal>
        <div className="section-eyebrow">
          <span className="roman">VI</span>
        </div>
      </Reveal>
      <Reveal delay={1}>
        <h2>
          Begin a relationship
          <br />
          <em className="gradient-text">worth keeping.</em>
        </h2>
      </Reveal>
      <Reveal delay={2}>
        <RequestButton />
      </Reveal>
    </section>
  );
}
