"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { hero } from "@/lib/home-kit-content";

/**
 * Mobile: poster still from the hero video (no truck stock image).
 * Desktop (lg+): high-quality muted autoplay loop — only mounts ≥1024px so
 * phones never download the desktop MP4.
 */
export function HeroVisual() {
  const [showDesktopVideo, setShowDesktopVideo] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setShowDesktopVideo(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div className="img-card relative aspect-[16/10] w-full overflow-hidden sm:aspect-[4/3] lg:aspect-[5/4.6]">
      {/* Mobile placeholder + brief desktop cover until video paints */}
      <Image
        src={hero.image.src}
        alt={hero.image.alt}
        fill
        priority
        quality={70}
        sizes="(max-width: 1023px) 100vw, 42vw"
        className={`object-cover object-center lg:object-contain lg:drop-shadow-[0_32px_64px_rgba(0,0,0,0.14)] ${
          showDesktopVideo ? "lg:invisible" : ""
        }`}
      />
      {showDesktopVideo ? (
        <video
          className="absolute inset-0 z-[1] h-full w-full object-cover object-center lg:object-contain lg:drop-shadow-[0_32px_64px_rgba(0,0,0,0.14)]"
          autoPlay
          muted
          loop
          playsInline
          // metadata is enough until play; full file streams after autoplay
          preload="metadata"
          aria-label={hero.image.alt}
        >
          <source src={hero.video.src} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
