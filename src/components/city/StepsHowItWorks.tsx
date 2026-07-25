export type Step = {
  title: string;
  body: string;
};

const DEFAULT_STEPS: Step[] = [
  {
    title: "Tell us about your move",
    body: "Share addresses, home size, access (stairs or elevator), and preferred date. Takes about 60 seconds.",
  },
  {
    title: "Lock the date",
    body: "We confirm hourly rate, crew size, and availability — same-week slots when open. No surprise add-ons.",
  },
  {
    title: "We move you forward",
    body: "Background-checked, bilingual crew arrives ready with pads, wrap, and a plan. Clock stops when the job ends.",
  },
];

export function StepsHowItWorks({
  kicker = "How it works",
  title = "Three steps to a clear local move",
  lead = "Simple process, local crew, upfront hourly pricing — no franchise call-center handoff.",
  steps = DEFAULT_STEPS,
}: {
  kicker?: string;
  title?: string;
  lead?: string;
  steps?: Step[];
}) {
  return (
    <>
      <p className="city-sec-kicker">{kicker}</p>
      <h2 className="city-sec-title">{title}</h2>
      {lead ? <p className="city-sec-lead">{lead}</p> : null}
      <div className="city-steps">
        {steps.map((s, i) => (
          <article key={s.title} className="city-step">
            <div className="city-step-num" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </article>
        ))}
      </div>
    </>
  );
}
