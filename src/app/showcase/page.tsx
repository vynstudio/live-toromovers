"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type Scene = {
  id: string;
  duration: number; // ms
};

const SCENES: Scene[] = [
  { id: "logo", duration: 4000 },
  { id: "standard", duration: 5500 },
  { id: "locations", duration: 5000 },
  { id: "service-1", duration: 6500 },
  { id: "service-2", duration: 6500 },
  { id: "service-3", duration: 6500 },
  { id: "process", duration: 6500 },
  { id: "testimonial", duration: 9000 },
  { id: "promise", duration: 6000 },
  { id: "closing", duration: 7000 },
];

const PHOTOS = {
  s1: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&q=85&auto=format&fit=crop",
  s2: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=85&auto=format&fit=crop",
  s3: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=85&auto=format&fit=crop",
};

export default function Showcase() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Auto-advance
  useEffect(() => {
    if (paused || ended) return;
    const dur = SCENES[idx]?.duration ?? 0;
    const t = setTimeout(() => {
      if (idx >= SCENES.length - 1) {
        setEnded(true);
      } else {
        setIdx((i) => i + 1);
      }
    }, dur);
    return () => clearTimeout(t);
  }, [idx, paused, ended]);

  // Show controls on mouse move
  useEffect(() => {
    let timeout: number | null = null;
    const onMove = () => {
      setShowControls(true);
      if (timeout) clearTimeout(timeout);
      timeout = window.setTimeout(() => setShowControls(false), 2000);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  // Keyboard controls
  const restart = useCallback(() => {
    setIdx(0);
    setEnded(false);
    setPaused(false);
  }, []);
  const advance = useCallback(() => {
    if (idx >= SCENES.length - 1) {
      setEnded(true);
    } else {
      setIdx((i) => i + 1);
    }
  }, [idx]);
  const back = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "ArrowRight") {
        advance();
      } else if (e.key === "ArrowLeft") {
        back();
      } else if (e.key.toLowerCase() === "r") {
        restart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, back, restart]);

  // Total duration for progress bar
  const total = SCENES.reduce((s, sc) => s + sc.duration, 0);
  const elapsed = SCENES.slice(0, idx).reduce((s, sc) => s + sc.duration, 0);
  const progress = ended ? 1 : Math.min((elapsed + 0) / total, 1);

  const sceneClass = (i: number) =>
    i === idx ? "scene active" : i < idx ? "scene past" : "scene future";

  return (
    <div className="showcase-root">
      {/* Scene 1 — Logo */}
      <div className={sceneClass(0)} data-scene="logo">
        <div className="scene-center">
          <div className="sc-eyebrow">Est. Northeast Florida</div>
          <h1 className="sc-logo">
            Grace<span className="sc-amp">&nbsp;&amp;&nbsp;</span>Co.
          </h1>
          <div className="sc-divider" />
          <div className="sc-tagline">Residential care, quietly delivered.</div>
        </div>
      </div>

      {/* Scene 2 — Standard */}
      <div className={sceneClass(1)} data-scene="standard">
        <div className="scene-center">
          <div className="sc-eyebrow">I &mdash; Our Promise</div>
          <h1 className="sc-h1-big">
            The standard
            <br />
            your home
            <br />
            <em className="gradient-text">deserves.</em>
          </h1>
        </div>
      </div>

      {/* Scene 3 — Locations */}
      <div className={sceneClass(2)} data-scene="locations">
        <div className="scene-center">
          <div className="sc-eyebrow">II &mdash; Where we serve</div>
          <h2 className="sc-h2 sc-h2-small">Northeast Florida.</h2>
          <ul className="sc-locations">
            <li><span className="sc-roman">i.</span>Jacksonville</li>
            <li><span className="sc-roman">ii.</span>Ponte Vedra</li>
            <li><span className="sc-roman">iii.</span>St. Augustine</li>
          </ul>
        </div>
      </div>

      {/* Scene 4 — Service 1 */}
      <div className={sceneClass(3)} data-scene="service-1">
        <ServiceScene
          photo={PHOTOS.s1}
          alt="An en-suite restored"
          plate="Plate No. 01"
          title="Initial Deep"
          italic="Reset."
          body="The foundation. A complete reset of every room — the standard your home will be held to from that day forward."
          reverse={false}
        />
      </div>

      {/* Scene 5 — Service 2 */}
      <div className={sceneClass(4)} data-scene="service-2">
        <ServiceScene
          photo={PHOTOS.s2}
          alt="A kitchen quietly maintained"
          plate="Plate No. 02"
          title="Recurring"
          italic="Maintenance."
          body="The same dedicated team, returning on rhythm. Weekly. Bi-weekly. Monthly. Quietly consistent — visit after visit."
          reverse={true}
        />
      </div>

      {/* Scene 6 — Service 3 */}
      <div className={sceneClass(5)} data-scene="service-3">
        <ServiceScene
          photo={PHOTOS.s3}
          alt="A residence prepared for transition"
          plate="Plate No. 03"
          title="Transition"
          italic="Care."
          body="End-of-lease, pre-listing, or a new beginning. A complete, top-to-bottom service handled discreetly."
          reverse={false}
        />
      </div>

      {/* Scene 7 — Process */}
      <div className={sceneClass(6)} data-scene="process">
        <div className="scene-center">
          <div className="sc-eyebrow">III &mdash; The Process</div>
          <h2 className="sc-h2">
            Quiet, consistent,
            <br />
            <em className="gradient-text">uncompromising.</em>
          </h2>
          <ul className="sc-process">
            <li><span className="sc-roman">i.</span>The Deep Reset</li>
            <li><span className="sc-roman">ii.</span>Your Rhythm</li>
            <li><span className="sc-roman">iii.</span>Just Live</li>
          </ul>
        </div>
      </div>

      {/* Scene 8 — Testimonial (dark) */}
      <div className={`${sceneClass(7)} scene-dark`} data-scene="testimonial">
        <div className="scene-center scene-narrow">
          <div className="sc-eyebrow electric">IV &mdash; Client Review</div>
          <blockquote className="sc-quote">
            &ldquo;I work twelve-hour days. I used to dread Sundays. {" "}
            <em className="gradient-text-light">
              Now I don&apos;t think about it.
            </em>{" "}
            The house is simply right.&rdquo;
          </blockquote>
          <cite className="sc-cite">
            <span className="sc-cite-name">Dr. M. Hernandez</span>
            <span className="sc-cite-role">
              &mdash; Cardiologist, Ponte Vedra
            </span>
          </cite>
        </div>
      </div>

      {/* Scene 9 — Promise */}
      <div className={sceneClass(8)} data-scene="promise">
        <div className="scene-center">
          <div className="sc-eyebrow">V</div>
          <p className="sc-promise">
            We don&apos;t clean homes. We{" "}
            <em className="gradient-text-warm">maintain</em> them.
          </p>
        </div>
      </div>

      {/* Scene 10 — Closing */}
      <div className={sceneClass(9)} data-scene="closing">
        <div className="scene-center">
          <h1 className="sc-logo sc-logo-closing">
            Grace<span className="sc-amp">&nbsp;&amp;&nbsp;</span>Co.
          </h1>
          <div className="sc-divider" />
          <div className="sc-tagline">Begin a relationship worth keeping.</div>
          <div className="sc-url">grace-co.netlify.app</div>
        </div>
      </div>

      {/* Hidden photo preloads */}
      <div style={{ display: "none" }}>
        <Image src={PHOTOS.s1} alt="" width={100} height={100} priority />
        <Image src={PHOTOS.s2} alt="" width={100} height={100} priority />
        <Image src={PHOTOS.s3} alt="" width={100} height={100} priority />
      </div>

      {/* Bottom progress hairline */}
      <div className="sc-progress">
        <div className="sc-progress-bar" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Controls — fade in on mouse move */}
      <div className={`sc-controls${showControls || paused || ended ? " visible" : ""}`}>
        <button onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play" : "Pause"}>
          {paused ? "▶" : "❚❚"}
        </button>
        <button onClick={restart} aria-label="Restart">↻</button>
        <a href="/" className="sc-exit" aria-label="Exit">×</a>
      </div>

      {ended && (
        <div className="sc-end-card">
          <button className="sc-end-btn" onClick={restart}>↻ Replay</button>
          <a className="sc-end-btn sc-end-link" href="/">← Back to site</a>
        </div>
      )}
    </div>
  );
}

function ServiceScene({
  photo,
  alt,
  plate,
  title,
  italic,
  body,
  reverse,
}: {
  photo: string;
  alt: string;
  plate: string;
  title: string;
  italic: string;
  body: string;
  reverse: boolean;
}) {
  return (
    <div className={`scene-service${reverse ? " reverse" : ""}`}>
      <div className="scene-service-photo">
        <Image src={photo} alt={alt} fill sizes="50vw" style={{ objectFit: "cover" }} />
      </div>
      <div className="scene-service-text">
        <div className="sc-eyebrow">{plate}</div>
        <h2 className="sc-h2-service">
          {title}
          <br />
          <em className="gradient-text">{italic}</em>
        </h2>
        <p className="sc-service-body">{body}</p>
      </div>
    </div>
  );
}
