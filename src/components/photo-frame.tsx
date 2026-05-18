"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Props = {
  src: string;
  alt: string;
  caption?: string;
  plateNo?: string;
  priority?: boolean;
};

export function PhotoFrame({ src, alt, caption, plateNo, priority }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reveal on scroll
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
    io.observe(el);

    // Magnetic cursor-aware 3D tilt — skip on touch devices (no hover)
    const supportsHover = window.matchMedia("(hover: hover)").matches;
    const inner = el.querySelector<HTMLElement>(".photo-inner");
    let raf: number | null = null;
    const onMove = (e: MouseEvent) => {
      if (!inner) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        inner.style.transform = `rotateY(${(-x * 9).toFixed(2)}deg) rotateX(${(y * 7).toFixed(2)}deg) translateZ(18px) scale(1.02)`;
      });
    };
    const onLeave = () => {
      if (inner) inner.style.transform = "";
    };
    if (supportsHover) {
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
    }

    return () => {
      io.disconnect();
      if (supportsHover) {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      }
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="photo-frame">
      <div className="photo-inner">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 980px) 100vw, 40vw"
          priority={priority}
          style={{ objectFit: "cover" }}
        />
      </div>
      {(plateNo || caption) && (
        <div className="photo-plate">
          {plateNo && <span className="plate-no">Plate No. {plateNo}</span>}
          {caption && <span className="plate-caption">{caption}</span>}
        </div>
      )}
    </div>
  );
}
