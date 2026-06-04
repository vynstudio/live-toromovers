"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

export function CountUp({
  end,
  duration = 1400,
  decimals = 0,
  prefix = "",
  suffix = "",
}: Props) {
  // Default to the REAL value so SSR / no-JS / crawler renders show the true
  // number (never "0" — which Google would otherwise read as "0.0★ rating,
  // 0+ moves"). The count-up animation is a progressive enhancement.
  const [val, setVal] = useState(end);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(end);
      return;
    }

    // Only animate when the element starts off-screen — resetting to 0 there is
    // invisible, so the count-up plays as the user scrolls in, with no flash on
    // load for stats already in view.
    const rect = el.getBoundingClientRect();
    const visibleOnLoad = rect.top < window.innerHeight && rect.bottom > 0;
    if (visibleOnLoad) {
      setVal(end);
      return;
    }

    setVal(0);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min((t - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(end * eased);
              if (p < 1) requestAnimationFrame(tick);
              else setVal(end);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}
