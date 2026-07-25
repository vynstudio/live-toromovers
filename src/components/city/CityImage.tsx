import Image from "next/image";

export type CityImageProps = {
  src: string;
  alt: string;
  /** Hero images should set priority for LCP */
  priority?: boolean;
  /** Optional visible caption under the image (supports local SEO naturally) */
  caption?: string;
  className?: string;
  /** Aspect ratio wrapper — default 4/3 */
  aspect?: "hero" | "wide" | "square";
  sizes?: string;
  width?: number;
  height?: number;
};

/**
 * SEO-safe city visual wrapper.
 * - Descriptive alt required (geo + service, natural language)
 * - WebP paths under /public/city/
 * - priority only for above-the-fold hero
 * - lazy by default below the fold (Next Image default)
 */
export function CityImage({
  src,
  alt,
  priority = false,
  caption,
  className = "",
  aspect = "wide",
  sizes,
  width = 1200,
  height = 900,
}: CityImageProps) {
  const aspectClass =
    aspect === "hero"
      ? "city-img-frame city-img-frame--hero"
      : aspect === "square"
        ? "city-img-frame city-img-frame--square"
        : "city-img-frame";

  const defaultSizes =
    aspect === "hero"
      ? "(min-width: 980px) 480px, 100vw"
      : "(min-width: 900px) 560px, 100vw";

  return (
    <figure className={`city-img-figure ${className}`.trim()}>
      <div className={aspectClass}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes ?? defaultSizes}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="city-img"
        />
      </div>
      {caption ? <figcaption className="city-img-caption">{caption}</figcaption> : null}
    </figure>
  );
}
