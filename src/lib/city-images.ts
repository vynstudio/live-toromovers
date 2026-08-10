/**
 * City-page image registry for Toro Movers service-area landings.
 *
 * SEO rules:
 * - Filenames are geo + intent descriptive (never image1.webp)
 * - Alts are full natural sentences with city + service
 * - Files live in /public/city/*.webp (generate via Runway; fallbacks allowed)
 *
 * Runway prompt notes (for batch generation):
 * - Style: photorealistic or polished marketing photo, sunny Central Florida light,
 *   family-friendly, professional movers (diverse crew), red/black Toro branding
 *   accents OK, NO copyrighted landmarks/logos, NO readable fake brand trucks
 * - Hero: wide 4:3, truck + crew curb-side in a residential neighborhood with
 *   Florida palms / suburban greenery, empty sky, positive energy
 * - Apartment: crew carefully carrying boxes/furniture at apartment stairs or
 *   breezeway, elevators optional, clean modern complex vibe
 */

export type CityImageSet = {
  hero: {
    src: string;
    alt: string;
    /** Comment for Runway operators */
    runwayPrompt: string;
  };
  mid: {
    src: string;
    alt: string;
    caption: string;
    runwayPrompt: string;
  };
};

const FALLBACK_HERO = "/hero/slide-02.webp";
const FALLBACK_MID = "/hero/slide-02.webp";

/** Per-city assets. Prefer /city/{slug}-* when generated; falls back to site heroes. */
export const CITY_IMAGES: Record<string, CityImageSet> = {
  "orlando-movers": {
    hero: {
      src: "/city/orlando-movers-hero.webp",
      alt: "Toro Movers crew loading a moving truck for a residential move in Orlando, FL on a sunny day",
      runwayPrompt:
        "Photorealistic: professional moving crew and box truck at curb in sunny Orlando suburban neighborhood with palm trees, Florida light, family-friendly, no logos, 4:3",
    },
    mid: {
      src: "/city/orlando-apartment-move.webp",
      alt: "Toro Movers carefully carrying boxes during an apartment move in Orlando, FL",
      caption:
        "Apartment and condo moves across Orlando — elevators, stairs, and loading zones handled carefully.",
      runwayPrompt:
        "Photorealistic: two movers carrying wrapped furniture up apartment stairs / breezeway in Orlando-style complex, careful handling, sunny Florida, 4:3",
    },
  },
  "lake-mary-movers": {
    hero: {
      src: "/city/lake-mary-movers-hero.webp",
      alt: "Toro Movers truck and crew preparing a home move in Lake Mary, FL",
      runwayPrompt:
        "Photorealistic: movers and truck in clean suburban Lake Mary / Heathrow-style neighborhood, HOA homes, sunny Florida, 4:3",
    },
    mid: {
      src: "/city/lake-mary-home-move.webp",
      alt: "Movers protecting furniture for a single-family home move in Lake Mary, FL",
      caption:
        "Planned household moves in Lake Mary — pads, wrap, and careful placement included.",
      runwayPrompt:
        "Photorealistic: movers wrapping furniture with blankets outside a suburban Florida home, professional, 4:3",
    },
  },
};

/**
 * Resolve images for a city slug. Missing /city files should be generated with
 * Runway using runwayPrompt; until then copy fallbacks into those paths.
 */
export function getCityImages(slug: string): CityImageSet {
  const set = CITY_IMAGES[slug];
  if (set) return set;
  // Generic Central Florida fallback — still descriptive alts per city name caller
  return {
    hero: {
      src: FALLBACK_HERO,
      alt: "Toro Movers crew preparing a local move in Central Florida",
      runwayPrompt: "Generic Central Florida residential move hero",
    },
    mid: {
      src: FALLBACK_MID,
      alt: "Toro Movers handling furniture on a local Central Florida move",
      caption: "Local moves across Central Florida with upfront hourly pricing.",
      runwayPrompt: "Generic apartment/home move mid image",
    },
  };
}
