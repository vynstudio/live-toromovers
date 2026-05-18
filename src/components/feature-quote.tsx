import { Reveal } from "./reveal";

export function FeatureQuote() {
  return (
    <section className="feature-quote">
      <div className="inner">
        <Reveal>
          <div className="section-eyebrow">
            <span className="roman">IV</span> Client Review
          </div>
        </Reveal>
        <Reveal delay={1} as="blockquote">
          &ldquo;I work twelve-hour days. I used to dread Sundays &mdash; the
          catch-up, the laundry, the dread of starting Monday in chaos.{" "}
          <em className="gradient-text-light">
            Now I don&apos;t think about it.
          </em>{" "}
          The house is simply right. That changes everything.&rdquo;
        </Reveal>
        <Reveal delay={2} as="cite">
          <span className="name">Dr. M. Hernandez</span>
          <span className="role">&mdash; Cardiologist, Ponte Vedra</span>
        </Reveal>
      </div>
    </section>
  );
}
