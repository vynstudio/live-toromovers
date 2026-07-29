// Homepage copy — mobile-first VitaBand layout adapted for Toro Movers.
// Real business facts only (phone, rating, services, area).

export const nav = {
  links: [
    { label: "discover", href: "#discover" },
    { label: "why toro", href: "#why" },
    { label: "how it works", href: "#how-it-works" },
  ],
  cta: "get a quote",
  ctaHref: "#quote",
  ctaPhoneLabel: "call now",
} as const;

export const hero = {
  h1: "Your Move,\nSimplified",
  lede: "Stay in control with Toro Movers, the Central Florida crew that handles packing, loading, and careful placement—all on your schedule.",
  cta: "discover toro movers",
  ctaHref: "#discover",
  /** Still frame from the hero video — mobile placeholder until a mobile clip is ready. */
  image: {
    src: "/images/hero-poster.webp",
    alt: "Toro Movers crew handling a residential move in Central Florida",
  },
  /** Desktop-only (lg+) high-quality muted loop. */
  video: {
    src: "/videos/hero-desktop.mp4",
  },
} as const;

/** src + alt + focal point for portrait stock inside landscape/tall frames. */
export type ImageAsset = {
  src: string;
  alt: string;
  /** Tailwind object-position class, e.g. object-[center_30%] */
  position?: string;
};

export type FeatureBlock = {
  id: string;
  title: string;
  body: string;
  image: ImageAsset;
  reverse: boolean;
  /** When true, mobile stacks text above image (matches VitaBand precise block). */
  mobileTextFirst?: boolean;
};

export const features: FeatureBlock[] = [
  {
    id: "comfort",
    title: "So smooth, you won't even feel the stress",
    body: "Designed for real life, Toro fits effortlessly into your day—whether you're packing a studio, emptying a family home, or winding down a lease. Care and efficiency, perfectly balanced.",
    image: {
      src: "/images/comfort-relax.webp",
      alt: "Couple relaxing stress-free after settling into their new home",
      position: "object-[center_42%]",
    },
    reverse: false,
  },
  {
    id: "precise",
    title: "Precise is nice",
    body: "Our trained crew and proven process ensure you get careful handling with unparalleled attention. Whether it's furniture, fragile boxes, or tight stairwells, Toro delivers reliable moves you can trust—helping you start fresh, every time.",
    image: {
      src: "/images/precise-packing.webp",
      alt: "Family carefully packing boxes in a bright home on move day",
      position: "object-[center_32%]",
    },
    reverse: true,
    mobileTextFirst: true,
  },
];

export const integrations = {
  title: "Better living through coordination",
  body: "Toro Movers works seamlessly with your timeline, building access, and local logistics—giving you a complete picture of your move in one place. From stairs and elevators to HOA windows, we integrate smoothly so you can focus on the new chapter without missing a beat.",
  cta: "know your move better",
  ctaHref: "#why",
  image: {
    src: "/images/living-joy.webp",
    alt: "Homeowner laughing with joy after a smoothly coordinated move",
    position: "object-[center_58%]",
  },
} as const;

/** Concrete differentiators — replaces full-bleed lifestyle banners */
export const whyToro = {
  title: "Why Toro Movers",
  lede: "Local Central Florida movers—clear pricing, real crew, no franchise hand-offs.",
  items: [
    {
      title: "Family-owned",
      body: "Owners handle your booking. Same people who quote often show up on the day—no call center, no contractor hand-off.",
      icon: "truck" as const,
    },
    {
      title: "Up-front hourly rates",
      body: "You know the crew size, rate, and minimum before we start. No fuel surcharges or surprise stair fees.",
      icon: "tag" as const,
    },
    {
      title: "Bilingual crew",
      body: "English and Spanish from quote to final box so timing and placement stay clear.",
      icon: "chat" as const,
    },
    {
      title: "Apartment specialists",
      body: "Stairs, elevators, tight loading zones, and HOA windows—handled carefully so deposits stay safe.",
      icon: "building" as const,
    },
  ],
  stats: [
    { value: "4.9★", label: "Google rating" },
    { value: "36+", label: "reviews" },
    { value: "100+", label: "local moves" },
    { value: "EN · ES", label: "bilingual" },
  ],
  ctaPhone: "Call now",
  ctaQuote: "Get a free quote",
} as const;

export const featureGrid = {
  items: [
    {
      title: "Full-Service Moves",
      body: "Truck, crew, loading, transport, and careful placement—end to end across Orlando and Central Florida.",
      icon: "truck" as const,
    },
    {
      title: "Labor-Only Help",
      body: "Already have a U-Haul or POD? We load tight and unload fast—billed by the hour with a clear minimum.",
      icon: "box" as const,
    },
    {
      title: "Apartment Specialists",
      body: "Stairs, elevators, and tight complex windows handled carefully so your deposit and floors stay safe.",
      icon: "building" as const,
    },
    {
      title: "Up-Front Pricing",
      body: "Honest hourly rates quoted clearly before we start—no surprise fees on move day.",
      icon: "tag" as const,
    },
    {
      title: "Bilingual Crew",
      body: "English & Spanish-speaking team for clear communication from quote to final box.",
      icon: "chat" as const,
    },
    {
      title: "Local Coverage",
      body: "Orlando metro & Central Florida only—same-week scheduling when availability allows.",
      icon: "map" as const,
    },
  ],
  cta: "get your quote",
  ctaHref: "#quote",
} as const;

export const closing = {
  title: "Take Control of Your\nMove Today",
  body: "Join neighbors across Central Florida who transformed their moving day with Toro. Get a clear quote and start living your next chapter—one careful step at a time.",
  cta: "start moving better",
  // Primary conversion: phone
  ctaHref: "tel:+16896002720",
} as const;

export const footer = {
  privacy: "Privacy Policy",
  privacyHref: "/privacy",
  cookies: "Cookie Policy",
  cookiesHref: "/privacy",
  terms: "Terms of Service",
  termsHref: "/privacy",
} as const;

// AEO: answer-first FAQs for featured snippets / AI answers
export const faq = {
  heading: "Common questions",
  sub: "Straight answers from a local Central Florida moving company.",
  items: [
    {
      q: "How much do movers cost in Orlando?",
      a: "Most local moves with Toro Movers are quoted by the hour. Price depends on crew size, truck needs, stairs or elevators, and how much you're moving. You get an up-front hourly rate and a clear minimum—no surprise fees on move day. Call (689) 600-2720 for a fast quote.",
    },
    {
      q: "Do you offer labor-only moving help?",
      a: "Yes. If you already have a U-Haul, PODS, or rental truck, Toro provides labor-only loading and unloading by the hour. We pack the truck tight so nothing shifts, then unload and place items where you want them.",
    },
    {
      q: "Are you a local Central Florida moving company?",
      a: "Yes. Toro Movers is a family-owned local mover based in the Orlando metro. We serve Central Florida only—that is how we keep same-week scheduling and honest hourly pricing.",
    },
    {
      q: "Do you move apartments with stairs and elevators?",
      a: "Yes. Apartment and condo moves are a core service: walk-ups, elevators, loading-zone limits, and tight complex windows. We protect floors and doorways and work within building rules.",
    },
    {
      q: "Is the crew bilingual?",
      a: "Yes. Our crews speak English and Spanish so instructions, timing, and placement details stay clear from quote to last box.",
    },
    {
      q: "How do I get a quote?",
      a: "Call or text (689) 600-2720. Share your move date, from/to addresses, home type, and roughly how much you have. We reply with crew size, hourly rate, and availability—usually the same day.",
    },
  ],
} as const;

// Visible process for HowTo schema + conversion clarity
export const process = {
  heading: "How it works",
  steps: [
    {
      name: "Tell us about your move",
      text: "Share date, addresses, home type, and stairs or elevator details. Takes about two minutes on a call.",
    },
    {
      name: "Get an up-front rate",
      text: "We quote hourly pricing, crew size, and truck needs clearly—before anyone shows up.",
    },
    {
      name: "We show up and move",
      text: "The same careful bilingual crew loads, transports if needed, and places items where they go.",
    },
  ],
} as const;

export const trust = {
  rating: "4.9",
  ratingLabel: "Google rating",
  reviews: "36+",
  reviewsLabel: "reviews",
  moves: "100+",
  movesLabel: "local moves",
  area: "Central Florida",
  areaLabel: "service area",
} as const;

export const areasSnippet = {
  heading: "Service areas",
  lead: "Local movers across the Orlando metro and Central Florida—including Orlando, Kissimmee, Winter Park, Clermont, Sanford, Oviedo, Winter Garden, St. Cloud, Lakeland, and nearby communities.",
} as const;
