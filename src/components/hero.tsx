import Image from "next/image";
import { Reveal } from "./reveal";
import { RequestButton } from "./request-button";

const VIDEO_URL =
  "https://videos.pexels.com/video-files/7515918/7515918-uhd_2732_1440_25fps.mp4";
const POSTER_DESKTOP =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85&auto=format&fit=crop";
const POSTER_MOBILE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80&auto=format&fit=crop";

export function Hero() {
  return (
    <section className="hero-video">
      <video
        className="hero-bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={POSTER_DESKTOP}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="hero-bg-photo" aria-hidden>
        <Image
          src={POSTER_MOBILE}
          alt=""
          fill
          sizes="(max-width: 720px) 100vw, 0px"
          priority
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="hero-overlay" aria-hidden />

      <div className="hero-center">
        <Reveal>
          <div className="hero-label hero-label-light">
            Residential care &mdash; Northeast Florida
          </div>
        </Reveal>
        <Reveal delay={1}>
          <h1 className="hero-h1-light">
            The standard your home{" "}
            <em className="gradient-text-light">deserves.</em>
          </h1>
        </Reveal>
        <Reveal delay={2}>
          <p className="hero-lede-light">
            Discreet, professional residential care for the homes and lives of
            Jacksonville&apos;s most considered families. One uncompromising
            standard, quietly held.
          </p>
        </Reveal>
        <Reveal delay={3}>
          <div className="hero-actions">
            <RequestButton />
            <a href="#brand-statement" className="btn-discover">
              Discover more
              <span className="discover-arrow" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
