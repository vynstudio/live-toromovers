// City SEO pages — content ported verbatim from the previous toromovers.net
// site so the indexed /movers-{city} URLs keep their exact canonicals and copy.
// Do NOT invent new details here; this is real, previously-published content.

export interface CityData {
  slug: string;
  href: string;
  name: string;
  navLabel: string;
  metadata: {
    title: string;
    description: string;
  };
  h1: string;
  subline: string;
  about: {
    h2: string;
    lead: string;
  };
  neighborhoods: string[];
  uniqueAngle: {
    eyebrow: string;
    h2: string;
    body: string;
  };
  schema: {
    lat: number;
    lng: number;
  };
}

export const ORLANDO: CityData = {
  slug: "orlando-movers",
  href: "/orlando-movers",
  name: "Orlando",
  navLabel: "Orlando movers",
  metadata: {
    // Base only — the root layout template appends " · Toro Movers".
    title: "Orlando Movers — $75/Mover/Hour, Fully Insured",
    description:
      "Family-owned Orlando movers — downtown, Lake Nona, Dr. Phillips & nearby. Fully insured, $75/mover/hour, no hidden fees. Free phone estimate.",
  },
  h1: "Orlando Movers — Toro Movers",
  subline:
    "Family-owned movers serving downtown Orlando, Lake Nona, Dr. Phillips, MetroWest, Baldwin Park, and the surrounding Orange County area. Fully insured, honest pricing.",
  about: {
    h2: "Orlando movers built for the city.",
    lead: "Toro Movers handles apartment, home, and commercial moves throughout Orlando and Orange County. From downtown high-rises to single-family homes in Baldwin Park, the process stays the same: phone estimate, scheduled crew, no surprises.",
  },
  neighborhoods: [
    "Downtown Orlando",
    "Lake Nona",
    "Dr. Phillips",
    "MetroWest",
    "Baldwin Park",
    "Audubon Park",
    "College Park",
    "Thornton Park",
  ],
  uniqueAngle: {
    eyebrow: "timing & traffic",
    h2: "Orlando timing matters.",
    body: "Orlando’s traffic patterns affect moving day more than most cities. I-4 closures, theme park weekend congestion, and downtown construction zones can add hours to a move if the crew doesn’t know the area. Toro Movers crews work Orlando full-time and plan routes around city patterns — not Google Maps defaults.",
  },
  schema: { lat: 28.5384, lng: -81.3789 },
};

export const LAKE_MARY: CityData = {
  slug: "lake-mary-movers",
  href: "/lake-mary-movers",
  name: "Lake Mary",
  navLabel: "Lake Mary movers",
  metadata: {
    title: "Lake Mary Movers — $75/Mover/Hour, Fully Insured",
    description:
      "Family-owned Lake Mary movers — Heathrow, Markham Woods, Timacuan & Seminole County. Fully insured, $75/mover/hour, no hidden fees.",
  },
  h1: "Lake Mary Movers — Toro Movers",
  subline:
    "Family-owned movers serving Lake Mary, Heathrow, Markham Woods, Timacuan, and the surrounding Seminole County area. Fully insured, honest pricing.",
  about: {
    h2: "Lake Mary movers, careful with the details.",
    lead: "Toro Movers handles apartment, home, and commercial moves throughout Lake Mary and Seminole County. Residential moves in HOA communities, gated neighborhoods, and high-end homes all run on the same process: phone estimate, scheduled crew, no surprises.",
  },
  neighborhoods: [
    "Heathrow",
    "Markham Woods",
    "Timacuan",
    "Lake Mary Boulevard",
    "Sanlando Springs",
    "Greenwood Lakes",
    "Sun Lake",
    "Country Club Oaks",
  ],
  uniqueAngle: {
    eyebrow: "HOA & gated communities",
    h2: "Built for HOA neighborhoods.",
    body: "Many Lake Mary communities require advance notice, certificate of insurance on file, and specific arrival windows for moving trucks. Toro Movers carries the required documentation and coordinates with property management or HOA offices directly — so move-in day doesn’t get held up at the gate.",
  },
  schema: { lat: 28.7589, lng: -81.3178 },
};

export const WINTER_PARK: CityData = {
  slug: "winter-park-movers",
  href: "/winter-park-movers",
  name: "Winter Park",
  navLabel: "Winter Park movers",
  metadata: {
    title: "Winter Park Movers — $75/Mover/Hour, Fully Insured",
    description:
      "Family-owned Winter Park movers — Park Ave, Aloma & historic neighborhoods. Fully insured, $75/mover/hour, no hidden fees. Free estimate.",
  },
  h1: "Winter Park Movers — Toro Movers",
  subline:
    "Family-owned movers serving Winter Park, including Park Avenue, Aloma, and the surrounding historic and luxury residential areas. Fully insured, honest pricing.",
  about: {
    h2: "Winter Park movers, careful with what matters.",
    lead: "Toro Movers handles moves throughout Winter Park — from historic homes near Park Avenue to modern apartments and luxury residential. Older homes with narrow staircases, brick driveways, and antique furniture get the same careful process: phone estimate, scheduled crew, no surprises.",
  },
  neighborhoods: [
    "Park Avenue",
    "Aloma",
    "Hannibal Square",
    "Olde Winter Park",
    "Windsong",
    "Lakemont",
    "Glenridge",
    "Comstock",
  ],
  uniqueAngle: {
    eyebrow: "historic & high-value homes",
    h2: "Built for Winter Park homes.",
    body: "Winter Park has more historic homes per capita than most Florida cities. Hardwood floors, original moldings, narrow doorways, and antique furniture require slower, more deliberate handling. Toro Movers crews are trained for high-value residential — and we always bring extra blankets, floor protection, and door-jamb padding for older homes.",
  },
  schema: { lat: 28.5999, lng: -81.3392 },
};

// --- New city pages (2026-06-04). Content is newly written but factual:
// real neighborhoods and genuine local angles; brand claims kept consistent
// with the ported pages above. ---

export const KISSIMMEE: CityData = {
  slug: "kissimmee-movers",
  href: "/kissimmee-movers",
  name: "Kissimmee",
  navLabel: "Kissimmee movers",
  metadata: {
    title: "Kissimmee Movers — $75/Mover/Hour, Fully Insured",
    description:
      "Family-owned Kissimmee movers — Celebration, Poinciana, Buenaventura Lakes & Osceola County. Bilingual crews, fully insured, $75/mover/hour, no hidden fees.",
  },
  h1: "Kissimmee Movers — Toro Movers",
  subline:
    "Family-owned movers serving Kissimmee, Celebration, Poinciana, Buenaventura Lakes, and the surrounding Osceola County area. Bilingual crews, fully insured, honest pricing.",
  about: {
    h2: "Kissimmee movers who know the area.",
    lead: "Toro Movers handles apartment, home, and vacation-rental moves throughout Kissimmee and Osceola County. From new-build communities near Lake Nona to established neighborhoods in Buenaventura Lakes, the process stays the same: phone estimate, scheduled crew, no surprises. Hablamos español.",
  },
  neighborhoods: [
    "Celebration",
    "Poinciana",
    "Buenaventura Lakes",
    "Storey Lake",
    "Mystic Dunes",
    "Kissimmee Lakeside",
    "Downtown Kissimmee",
    "Lake Tohopekaliga",
  ],
  uniqueAngle: {
    eyebrow: "bilingual & vacation-rental moves",
    h2: "Built for Kissimmee.",
    body: "Kissimmee mixes long-time residents, a large Spanish-speaking community, and a wave of short-term and vacation-rental homes near the parks. Toro Movers runs fully bilingual crews (English / Spanish) and handles fast turnovers on furnished rentals as easily as a family-home move — same honest hourly pricing, same careful handling, no surprises at the gate.",
  },
  schema: { lat: 28.292, lng: -81.4076 },
};

export const SANFORD: CityData = {
  slug: "sanford-movers",
  href: "/sanford-movers",
  name: "Sanford",
  navLabel: "Sanford movers",
  metadata: {
    title: "Sanford Movers — $75/Mover/Hour, Fully Insured",
    description:
      "Family-owned Sanford movers — Historic Downtown, Lake Monroe, Mayfair & Seminole County. Fully insured, $75/mover/hour, no hidden fees. Free estimate.",
  },
  h1: "Sanford Movers — Toro Movers",
  subline:
    "Family-owned movers serving Sanford, including Historic Downtown, the Lake Monroe waterfront, Mayfair, and the surrounding Seminole County area. Fully insured, honest pricing.",
  about: {
    h2: "Sanford movers, careful with older homes.",
    lead: "Toro Movers handles apartment, home, and commercial moves throughout Sanford and Seminole County. From historic bungalows near downtown to newer homes along the lake, every move runs on the same process: phone estimate, scheduled crew, no surprises.",
  },
  neighborhoods: [
    "Historic Downtown Sanford",
    "Lake Monroe",
    "Mayfair",
    "Loch Arbor",
    "Riverview",
    "Heron Ridge",
    "Celery Estates",
    "San Lanta",
  ],
  uniqueAngle: {
    eyebrow: "historic district & brick streets",
    h2: "Built for historic Sanford.",
    body: "Sanford's historic district means brick streets, narrow lots, century-old homes, and tight downtown parking — conditions that slow down a crew that doesn't know the area. Toro Movers plans truck access ahead of time, brings extra floor and door-jamb protection for older homes, and works the historic core without the surprises that hold up move-in day.",
  },
  schema: { lat: 28.8117, lng: -81.2731 },
};

export const CLERMONT: CityData = {
  slug: "clermont-movers",
  href: "/clermont-movers",
  name: "Clermont",
  navLabel: "Clermont movers",
  metadata: {
    title: "Clermont Movers — $75/Mover/Hour, Fully Insured",
    description:
      "Family-owned Clermont movers — Kings Ridge, Legends, Summit Greens & Lake County. Fully insured, $75/mover/hour, no hidden fees. Free estimate.",
  },
  h1: "Clermont Movers — Toro Movers",
  subline:
    "Family-owned movers serving Clermont, including Kings Ridge, Legends, Summit Greens, Lost Lake, and the surrounding Lake County area. Fully insured, honest pricing.",
  about: {
    h2: "Clermont movers built for the hills.",
    lead: "Toro Movers handles apartment, home, and 55+ community moves throughout Clermont and Lake County. From master-planned neighborhoods off Hartwood Marsh to established homes near the chain of lakes, the process stays the same: phone estimate, scheduled crew, no surprises.",
  },
  neighborhoods: [
    "Kings Ridge",
    "Legends",
    "Summit Greens",
    "Lost Lake",
    "Greater Hills",
    "Sawgrass Bay",
    "Downtown Clermont",
    "Hartwood Marsh",
  ],
  uniqueAngle: {
    eyebrow: "master-planned & 55+ communities",
    h2: "Built for Clermont.",
    body: "Clermont's rolling hills and gated 55+ communities like Kings Ridge and Summit Greens come with their own moving-day details: guard-gate check-ins, HOA arrival windows, and a longer haul to and from the Orlando metro. Toro Movers carries the documentation gated communities ask for, books realistic arrival times, and quotes the drive honestly up front — no padded hours, no surprises.",
  },
  schema: { lat: 28.5494, lng: -81.7729 },
};

export const CITIES: CityData[] = [
  ORLANDO,
  LAKE_MARY,
  WINTER_PARK,
  KISSIMMEE,
  SANFORD,
  CLERMONT,
];

export function otherCities(slug: string): CityData[] {
  return CITIES.filter((c) => c.slug !== slug);
}
