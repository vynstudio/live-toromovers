"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    num: "i.",
    title: "The Deep Reset",
    body: "Your first visit is always a full deep clean. We map your home, learn its details, and establish the standard we will maintain.",
  },
  {
    num: "ii.",
    title: "Your Rhythm",
    body: "You choose the cadence. We return on the same day, with the same team, at the same hour. Quietly, every time.",
  },
  {
    num: "iii.",
    title: "Just Live",
    body: "No reminders, no chasing, no surprise invoices. You walk into a calm, ready home. That is the entire promise.",
  },
];

export function Process() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = container.querySelectorAll(".process-step, .reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="process-section" id="process">
      <div className="process-grid" ref={containerRef}>
        <div className="process-intro reveal">
          <div className="section-eyebrow">
            <span className="roman">II</span> The Process
          </div>
          <h2>
            Quiet,
            <br />
            consistent,
            <br />
            <em className="gradient-text">uncompromising.</em>
          </h2>
        </div>
        <div className="process-steps">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`process-step reveal reveal-d${(i + 1) as 1 | 2 | 3}`}
            >
              <div className="num">{s.num}</div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
