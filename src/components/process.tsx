"use client";

import { useLang } from "./lang-provider";

export function Process() {
  const { t } = useLang();
  return (
    <section className="block" id="process" style={{ background: "var(--bg-soft)" }}>
      <div className="block-inner">
        <div className="block-eyebrow">{t.process.eyebrow}</div>
        <h2 className="block-h2">
          {t.process.head} <em>{t.process.headItalic}</em>
        </h2>

        <div className="process-steps">
          {t.process.steps.map((s) => (
            <article key={s.num} className="process-step">
              <span className="process-step-num">Step {s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
