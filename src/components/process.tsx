"use client";

import Link from "next/link";
import { useLang } from "./lang-provider";

const STEP_MEDIA = [
  "/images/env-step1.webp",
  "/images/env-step2.webp",
  "/images/env-step3.webp",
] as const;

export function Process() {
  const { t, lang } = useLang();
  return (
    <section className="block" id="process">
      <div className="block-inner">
        <div className="block-eyebrow reveal">{t.process.eyebrow}</div>
        <h2 className="block-h2 reveal reveal-d1">
          {t.process.head} <em>{t.process.headItalic}</em>
        </h2>

        <div className="process-steps">
          {t.process.steps.map((s, i) => (
            <article
              key={s.num}
              className={`process-step reveal reveal-d${(i + 1) as 1 | 2 | 3}`}
            >
              <div className="process-step-body">
                <span className="process-step-num">
                  {lang === "es" ? "Paso" : "Step"} {s.num}
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {i === 0 && (
                  <div style={{ marginTop: "1.25rem" }}>
                    <Link href="/quote" className="btn btn-link">
                      {lang === "es" ? "Empezar cotización" : "Start your quote"}{" "}
                      <span className="chev" aria-hidden>
                        →
                      </span>
                    </Link>
                  </div>
                )}
              </div>
              <div className="process-step-media">
                <img
                  src={STEP_MEDIA[i] ?? STEP_MEDIA[0]}
                  alt=""
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
