import { Reveal } from "./reveal";

export function EditorialQuote() {
  return (
    <section className="editorial-quote" id="brand-statement">
      <div className="inner">
        <Reveal>
          <div className="mark">&ldquo;</div>
        </Reveal>
        <Reveal delay={1} as="p">
          We don&apos;t clean homes. We{" "}
          <em className="gradient-text-warm">maintain</em> them &mdash; quietly,
          professionally, for the people who can no longer afford to think about
          it.
        </Reveal>
        <Reveal delay={2}>
          <div className="attr">&mdash; Our promise</div>
        </Reveal>
      </div>
    </section>
  );
}
