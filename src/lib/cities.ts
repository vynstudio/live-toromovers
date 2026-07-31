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
  /** Optional answer-first SEO sections (H2 + body) for flagship city pages. */
  sections?: readonly { h2: string; body: string }[];
  neighborhoods: string[];
  uniqueAngle: {
    eyebrow: string;
    h2: string;
    body: string;
  };
  faqs?: { q: string; a: string }[];
  // Optional outbound citations to authoritative local-government / official
  // sources (rendered as a contextual "Helpful local resources" line).
  references?: readonly { label: string; href: string }[];
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
    title: "Orlando Movers | Local Moving Company in Orlando FL",
    description:
      "Need Orlando movers? Toro Movers is a family-owned moving company offering full-service moves, labor-only loading, apartment moves, and up-front hourly rates.",
  },
  h1: "Orlando Movers for Clear, Careful Local Moves",
  subline:
    "Toro Movers is a family-owned Orlando moving company helping local customers with full-service moves, labor-only loading and unloading, apartment moves, and up-front hourly rates.",
  about: {
    h2: "Local movers in Orlando, FL",
    lead: "Toro Movers provides local moving help in Orlando, FL for homes, apartments, storage units, rental trucks, and POD-style containers. Our bilingual English and Spanish crew helps with full-service moves, labor-only loading, apartment moves, and careful placement at your new address.",
  },
  sections: [
    {
      h2: "Full-service movers in Orlando",
      body: "Our full-service movers in Orlando handle loading, transportation, unloading, and placement so you do not have to manage the heavy parts yourself. Toro Movers plans around access details like stairs, elevators, parking, storage units, and building rules before move day.",
    },
    {
      h2: "Labor-only movers in Orlando",
      body: "Toro Movers offers labor-only moving help in Orlando for U-Haul trucks, PODS, trailers, rental trucks, and storage units. You provide the vehicle or container, and our crew handles loading, unloading, heavy lifting, and placement by the hour.",
    },
    {
      h2: "Apartment movers in Orlando",
      body: "Toro Movers helps with apartment moves in Orlando, including walk-ups, elevators, tight hallways, parking limits, loading zones, and scheduled move-in windows. Our crew plans around access details so the move stays organized and careful.",
    },
    {
      h2: "Up-front hourly moving rates",
      body: "Toro Movers uses up-front hourly rates for most Orlando local moves. Pricing depends on crew size, truck needs, stairs, elevators, access, distance, and how much you need moved. We explain the rate structure before move day so expectations are clear.",
    },
  ],
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
    eyebrow: "why toro",
    h2: "Why Orlando customers choose Toro Movers",
    body: "Toro Movers is family-owned, locally operated, bilingual in English and Spanish, and rated 5 stars on Google. Orlando customers choose Toro because they want a local crew, clear communication, up-front hourly pricing, and movers who understand apartments, storage moves, stairs, elevators, and rental truck loading.",
  },
  faqs: [
    {
      q: "How much do movers cost in Orlando?",
      a: "Toro Movers quotes most Orlando moves with up-front hourly rates. The final cost depends on crew size, truck needs, stairs, elevators, distance, access, and how much you need moved. Call or text (689) 600-2720 with your move details and we will explain the hourly pricing model before move day.",
    },
    {
      q: "Do you offer labor-only movers in Orlando?",
      a: "Yes, Toro Movers offers labor-only movers in Orlando for U-Haul trucks, PODS, trailers, storage units, and rental trucks. You provide the vehicle or container, and our crew handles the loading, unloading, heavy lifting, and placement.",
    },
    {
      q: "Do you handle apartment moves in Orlando?",
      a: "Yes, Toro Movers handles apartment moves in Orlando, including walk-ups, elevators, loading zones, tight hallways, parking limits, and scheduled move-in windows. We ask about apartment access before quoting so the crew can plan the move correctly.",
    },
    {
      q: "Are you a local Orlando moving company?",
      a: "Yes, Toro Movers is a family-owned local moving company serving Orlando and Central Florida. You work with a local crew instead of a franchise hand-off, which helps keep communication, scheduling, and move-day expectations clear.",
    },
    {
      q: "What is the difference between full-service and labor-only moving?",
      a: "Full-service moving includes the crew, truck, loading, transportation, unloading, and placement. Labor-only moving is for customers who already have a U-Haul, POD, trailer, or rental truck and only need movers for loading, unloading, or heavy lifting.",
    },
    {
      q: "How do I get a moving quote in Orlando?",
      a: "To get a moving quote in Orlando, call or text Toro Movers at (689) 600-2720. Share your move date, pickup and drop-off locations, home or apartment type, stairs or elevators, and whether you need full-service movers or labor-only help.",
    },
  ],
  schema: { lat: 28.5384, lng: -81.3789 },
};

export const LAKE_MARY: CityData = {
  slug: "lake-mary-movers",
  href: "/lake-mary-movers",
  name: "Lake Mary",
  navLabel: "Lake Mary movers",
  // Full long-form page lives at src/app/(site)/lake-mary-movers/page.tsx
  // (not the thin CityPage template). Keep metadata/h1 aligned for sitemap/grids.
  metadata: {
    title: "Lake Mary Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Lake Mary, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "Lake Mary Movers",
  subline:
    "Professional household, office, and planned relocation moving help in Lake Mary, FL, with upfront hourly pricing and no hidden fees.",
  about: {
    h2: "Lake Mary movers built for household and planned relocations",
    lead: "Toro Movers is a family-owned Central Florida crew serving Lake Mary, Heathrow, Markham Woods, office parks, and nearby Seminole County — homes, townhomes, office moves, and full-service with upfront hourly pricing.",
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
    eyebrow: "timing, access, parking",
    h2: "Moving in Lake Mary comes down to timing, access, and parking",
    body: "I-4 corridor traffic, HOA and gated arrival windows, townhome parking, and office-park access shape every Lake Mary job. Toro plans around the rules you share and quotes by the hour — no fuel, stair, or material surprise fees.",
  },
  faqs: [
    {
      q: "How much do movers cost in Lake Mary, FL?",
      a: "Costs depend on crew size, home size, access, and hours. Toro uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees.",
    },
    {
      q: "Do you move homes and townhomes in Lake Mary?",
      a: "Yes. Single-family homes and townhomes are a core job type across Lake Mary, Heathrow, and nearby Seminole County streets.",
    },
    {
      q: "How far in advance should I book a Lake Mary move?",
      a: "Book one to two weeks ahead when you can, especially for weekends and HOA or gated windows. Same-week is often available — call (689) 600-2720.",
    },
  ],
  schema: { lat: 28.7589, lng: -81.3178 },
};

export const WINTER_PARK: CityData = {
  slug: "winter-park-movers",
  href: "/winter-park-movers",
  name: "Winter Park",
  navLabel: "Winter Park movers",
  metadata: {
    title: "Winter Park Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Winter Park, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing and no hidden fees.",
  },
  h1: "Winter Park Movers",
  subline:
    "Local, apartment, and full-service moving help in Winter Park, FL, with upfront hourly pricing and no hidden fees.",
  about: {
    h2: "Winter Park movers built for local moves",
    lead: "Toro Movers handles moves throughout Winter Park — older homes near Park Avenue, apartments around Rollins College, Aloma corridor rentals, and short hops into Orlando, Maitland, Fern Park, and Baldwin Park. Careful furniture handling, clear hourly pricing, no surprises.",
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
    eyebrow: "careful handling · older homes · apartments",
    h2: "Built for Winter Park homes and streets.",
    body: "Winter Park moves often mean narrow streets, older homes with tight staircases, and apartment elevators near campus. Toro plans truck access, pads floors and doorways, and handles furniture deliberately — professional local service without fake luxury claims.",
  },
  faqs: [
    {
      q: "How much do movers cost in Winter Park, FL?",
      a: "Winter Park moving cost depends on crew size, home or apartment size, access (narrow streets, stairs, elevators, long carries), packing readiness, and how long the job takes. Toro Movers uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees.",
    },
    {
      q: "Do you move apartments in Winter Park?",
      a: "Yes. Apartment and condo moves are common near Rollins College, along Aloma, and in newer mixed-use pockets. We plan around elevator windows, loading zones, and property-manager rules.",
    },
    {
      q: "Do you charge extra for stairs or elevators?",
      a: "No separate stair or elevator fee. Toro bills by the hour, so a walk-up, slow elevator, or long carry simply adds time on the clock. Furniture blankets, shrink wrap, and basic assembly/disassembly are included.",
    },
    {
      q: "Can you move me from Winter Park to Orlando?",
      a: "Yes. Local moves between Winter Park and Orlando (and nearby cities like Maitland, Fern Park, Altamonte Springs, and Baldwin Park) are a regular part of our week. Same upfront hourly pricing across Central Florida.",
    },
    {
      q: "Do you offer labor-only moving help in Winter Park?",
      a: "Yes. If you already have a U-Haul, POD, rental truck, or storage container, Toro provides labor-only loading and unloading help by the hour — same background-checked, bilingual crew and included protection materials.",
    },
    {
      q: "How do you handle older Winter Park homes and tight streets?",
      a: "Many Winter Park streets near Park Avenue and older residential blocks are narrow, with limited driveway depth. We plan truck placement and carries ahead of time, pad floors and doorways, and move furniture deliberately through tight turns.",
    },
    {
      q: "What makes Toro Movers different from franchise moving companies?",
      a: "Toro is a family-owned Central Florida moving company — not a national call center. You get a local crew, clear hourly pricing, bilingual support (Hablamos español), and no franchise-style surprise fees.",
    },
  ],
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
    title: "Kissimmee Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Kissimmee, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "Kissimmee Movers — Toro Movers",
  subline:
    "Family-owned movers serving Kissimmee, Celebration, Poinciana, Buenaventura Lakes, and the surrounding Osceola County area. Bilingual crews, honest, up-front pricing.",
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
  faqs: [
    {
      q: "¿Tienen cuadrilla bilingüe en Kissimmee?",
      a: "Sí — our Kissimmee crews are fully bilingual (English / Spanish), so we can quote, schedule, and run your whole move in either language. Hablamos español.",
    },
    {
      q: "Can you handle a vacation-rental or furnished-home turnover near the parks?",
      a: "Yes. Kissimmee has a lot of short-term and furnished rentals near the parks — we handle fast turnovers on furnished homes as easily as a family move, billed by the hour.",
    },
    {
      q: "Do you serve Celebration, Poinciana, and Buenaventura Lakes?",
      a: "Yes — those are core Kissimmee service areas, along with the wider Osceola County region. Same honest hourly pricing, no surprises at the gate.",
    },
  ],
  schema: { lat: 28.292, lng: -81.4076 },
};

export const SANFORD: CityData = {
  slug: "sanford-movers",
  href: "/sanford-movers",
  name: "Sanford",
  navLabel: "Sanford movers",
  metadata: {
    title: "Sanford Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Sanford, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "Sanford Movers — Toro Movers",
  subline:
    "Family-owned movers serving Sanford, including Historic Downtown, the Lake Monroe waterfront, Mayfair, and the surrounding Seminole County area. Honest, up-front pricing.",
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
  faqs: [
    {
      q: "Can you move in Sanford's historic district with brick streets?",
      a: "Yes. The historic district means brick streets, narrow lots, and tight downtown parking. We plan truck access ahead of time and bring extra floor and door-jamb protection for century-old homes.",
    },
    {
      q: "Do you move homes along Lake Monroe and the waterfront?",
      a: "Regularly — from the Lake Monroe waterfront to Mayfair and the newer neighborhoods, every Sanford move runs on the same process: phone estimate, scheduled crew, no surprises.",
    },
    {
      q: "How is a Sanford move priced?",
      a: "By the hour, agreed up front, with no per-mile or fuel charge. Older homes can take a little longer and we tell you that honestly before the day.",
    },
  ],
  schema: { lat: 28.8117, lng: -81.2731 },
};

export const CLERMONT: CityData = {
  slug: "clermont-movers",
  href: "/clermont-movers",
  name: "Clermont",
  navLabel: "Clermont movers",
  // Full long-form page lives at src/app/(site)/clermont-movers/page.tsx
  // (not the thin CityPage template). Keep metadata/h1 aligned for sitemap/grids.
  metadata: {
    title: "Clermont Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Clermont, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "Clermont Movers",
  subline:
    "Local, apartment, and full-service moving help in Clermont, FL, with upfront hourly pricing and no hidden fees.",
  about: {
    h2: "Clermont movers built for local moves",
    lead: "Toro Movers is a family-owned Central Florida crew serving Clermont, Minneola, Groveland, and Lake County — larger homes, gated communities, apartments, storage moves, and full-service with upfront hourly pricing.",
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
  faqs: [
    {
      q: "Do you move in Clermont's gated 55+ communities like Kings Ridge?",
      a: "Yes. Gated and 55+ communities like Kings Ridge and Summit Greens have guard-gate check-ins and HOA arrival windows — we carry the documentation they ask for and book realistic arrival times.",
    },
    {
      q: "Clermont is a bit west of Orlando — do you charge extra for the drive?",
      a: "We bill by the hour and quote the drive to and from the Orlando metro honestly up front. There's no per-mile fee or fuel surcharge.",
    },
    {
      q: "Can you handle hilly driveways and larger Lake County homes?",
      a: "Yes — Clermont's rolling hills and larger homes are routine for us. We plan access for long or steep driveways so loading stays efficient.",
    },
  ],
  schema: { lat: 28.5494, lng: -81.7729 },
};

export const OVIEDO: CityData = {
  slug: "oviedo-movers",
  href: "/oviedo-movers",
  name: "Oviedo",
  navLabel: "Oviedo movers",
  metadata: {
    title: "Oviedo, FL Movers — Moving Company",
    description:
      "Family-owned Oviedo movers — Alafaya Woods, Twin Rivers, Live Oak Reserve & Seminole County. Bilingual, up-front hourly pricing. Free estimate.",
  },
  h1: "Oviedo Movers — Toro Movers",
  subline:
    "Family-owned movers serving Oviedo, including Alafaya Woods, Twin Rivers, Live Oak Reserve, and the surrounding Seminole County area. Honest, up-front pricing.",
  about: {
    h2: "Oviedo movers for family homes.",
    lead: "Toro Movers handles apartment, home, and family moves throughout Oviedo and east Seminole County. From new subdivisions near Oviedo on the Park to established homes by the UCF area, every move runs on the same process: phone estimate, scheduled crew, no surprises.",
  },
  neighborhoods: [
    "Alafaya Woods",
    "Twin Rivers",
    "Live Oak Reserve",
    "Kingsbridge",
    "Carillon",
    "Stillwater",
    "Oviedo on the Park",
    "Riverside at Twin Rivers",
  ],
  uniqueAngle: {
    eyebrow: "family homes & school moves",
    h2: "Built for Oviedo families.",
    body: "Oviedo is one of Central Florida's top family-and-schools destinations, so most moves here are families upsizing into single-family homes — often timed around the school calendar. Toro Movers books realistic family-move windows, handles the bulky stuff (beds, sectionals, garage gear) carefully, and keeps the day predictable: phone estimate, scheduled crew, no surprises.",
  },
  faqs: [
    {
      q: "Can you schedule an Oviedo move around the school calendar?",
      a: "Yes. Most Oviedo moves are families timing a move around school, so we book realistic family-move windows and keep the day predictable.",
    },
    {
      q: "Do you move the bulky stuff — beds, sectionals, garage gear?",
      a: "That's the typical Oviedo family-home job. We handle bulky furniture and garage gear carefully, disassembling and reassembling what's needed.",
    },
    {
      q: "Do you serve the UCF-area and Alafaya neighborhoods?",
      a: "Yes — from Alafaya Woods and Twin Rivers to the newer subdivisions near Oviedo on the Park, all on up-front hourly pricing.",
    },
  ],
  schema: { lat: 28.67, lng: -81.2081 },
};

export const WINTER_GARDEN: CityData = {
  slug: "winter-garden-movers",
  href: "/winter-garden-movers",
  name: "Winter Garden",
  navLabel: "Winter Garden movers",
  // Full long-form page lives at src/app/(site)/winter-garden-movers/page.tsx
  // (not the thin CityPage template). Keep metadata/h1 aligned for sitemap/grids.
  metadata: {
    title: "Winter Garden Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Winter Garden, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "Winter Garden Movers",
  subline:
    "Local, family, and new-build moving help in Winter Garden, FL, with upfront hourly pricing and no hidden fees.",
  about: {
    h2: "Winter Garden movers built for local moves",
    lead: "Toro Movers is a family-owned Central Florida crew serving Winter Garden, Horizon West, Hamlin, and west Orange County — new-build communities, family homes, storage-to-home, and full-service with upfront hourly pricing.",
  },

  neighborhoods: [
    "Historic Downtown / Plant Street",
    "Independence",
    "Stoneybrook West",
    "Orchard Hills",
    "Lakeview Preserve",
    "Hamlin",
    "Watermark",
    "Tucker Oaks",
  ],
  uniqueAngle: {
    eyebrow: "new construction & Horizon West",
    h2: "Built for fast-growing Winter Garden.",
    body: "Winter Garden is one of the fastest-growing corners of metro Orlando — Horizon West and Hamlin add new homes constantly, which means a steady stream of first-day move-ins with builder schedules, gated entries, and tight new-community streets. Toro Movers coordinates builder and HOA timing, protects fresh floors and paint, and gets you in without the surprises.",
  },
  faqs: [
    {
      q: "Can you do a first-day move-in to a new build in Horizon West or Hamlin?",
      a: "Yes. Winter Garden adds new homes constantly, so first-day move-ins are routine — we coordinate builder and HOA timing and protect fresh floors and paint.",
    },
    {
      q: "Do you serve the Historic Downtown / Plant Street area?",
      a: "Yes — from historic homes near Plant Street to brand-new builds in Horizon West, every Winter Garden move runs on the same process and honest hourly pricing.",
    },
    {
      q: "Will a gated community arrival window be a problem?",
      a: "No — newer Winter Garden communities often have gated entries and arrival windows, and we schedule and document around them so move-in isn't held up.",
    },
  ],
  schema: { lat: 28.5653, lng: -81.5862 },
};

export const ALTAMONTE_SPRINGS: CityData = {
  slug: "altamonte-springs-movers",
  href: "/altamonte-springs-movers",
  name: "Altamonte Springs",
  navLabel: "Altamonte Springs movers",
  // Full long-form page lives at src/app/(site)/altamonte-springs-movers/page.tsx
  // (not the thin CityPage template). Keep metadata/h1 aligned for sitemap/grids.
  metadata: {
    title: "Altamonte Springs Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Altamonte Springs, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing and no hidden fees.",
  },
  h1: "Altamonte Springs Movers",
  subline:
    "Local, apartment, and full-service moving help in Altamonte Springs, FL, with upfront hourly pricing and no hidden fees.",
  about: {
    h2: "Altamonte Springs movers built for local moves",
    lead: "Toro Movers is a family-owned Central Florida crew serving Altamonte Springs, Uptown Altamonte, Cranes Roost, and nearby Seminole County — apartments, homes, labor-only, and full-service with upfront hourly pricing.",
  },
  neighborhoods: [
    "Uptown Altamonte",
    "Cranes Roost",
    "Forest City",
    "Fern Park",
    "Sanlando Springs",
    "Spring Oaks",
    "Lake Lotus",
    "The Springs",
  ],
  uniqueAngle: {
    eyebrow: "timing, access, parking",
    h2: "Moving in Altamonte Springs comes down to timing, access, and parking",
    body: "SR 436 and I-4 traffic, apartment elevator windows, long carries, and loading zones shape every Altamonte job. Toro plans for complex rules and quotes by the hour — no fuel, stair, or material surprise fees.",
  },
  faqs: [
    {
      q: "How much do movers cost in Altamonte Springs, FL?",
      a: "Costs depend on crew size, home size, access, and hours. Toro uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees.",
    },
    {
      q: "Do you move apartments in Altamonte Springs?",
      a: "Yes — elevators, walk-ups, loading zones, and move-in windows around Uptown and Cranes Roost are regular work for our crew.",
    },
    {
      q: "Do you charge extra for stairs or elevators?",
      a: "No separate stair or elevator fee. We bill by the hour; materials and basic assembly/disassembly are included.",
    },
    {
      q: "Can you move me from Altamonte Springs to Orlando?",
      a: "Yes. Local moves between Altamonte Springs and Orlando and nearby cities are a core part of our service area.",
    },
    {
      q: "Do you offer labor-only moving help in Altamonte Springs?",
      a: "Yes — load or unload a U-Haul, POD, or rental truck by the hour with the same bilingual, background-checked crew.",
    },
    {
      q: "How far in advance should I book movers in Altamonte Springs?",
      a: "One to two weeks is ideal; same-week dates are often available. Call (689) 600-2720 or request an estimate online.",
    },
    {
      q: "What makes Toro Movers different from franchise moving companies?",
      a: "Family-owned Central Florida company, local crew, clear hourly pricing, no call-center handoff, bilingual support.",
    },
  ],
  schema: { lat: 28.6611, lng: -81.3656 },
};

export const APOPKA: CityData = {
  slug: "apopka-movers",
  href: "/apopka-movers",
  name: "Apopka",
  navLabel: "Apopka movers",
  metadata: {
    title: "Apopka Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Apopka, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "Apopka Movers — Toro Movers",
  subline:
    "Family-owned movers serving Apopka, including Errol Estates, Rock Springs Ridge, Wekiva, and the surrounding north Orange County area. Bilingual crews, honest, up-front pricing.",
  about: {
    h2: "Apopka movers for growing homes.",
    lead: "Toro Movers handles apartment, home, and family moves throughout Apopka and north Orange County. From new communities along the 429 corridor to established homes near Wekiwa Springs, the process stays the same: phone estimate, scheduled crew, no surprises. Hablamos español.",
  },
  neighborhoods: [
    "Errol Estates",
    "Rock Springs Ridge",
    "Sweetwater Country Club",
    "Wekiva",
    "Lake Doe",
    "Bear Lake",
    "Kelly Park",
    "Wekiwa Springs",
  ],
  uniqueAngle: {
    eyebrow: "growth corridor & larger homes",
    h2: "Built for Apopka.",
    body: "Apopka has boomed along the SR-429 corridor, so many moves here are families trading apartments for single-family homes with more space, bigger garages, and longer driveways. Toro Movers runs bilingual crews, handles the bulky stuff that comes with a bigger home, and quotes by the hour up front — no surprises as you size up.",
  },
  faqs: [
    {
      q: "¿Tienen cuadrilla bilingüe en Apopka?",
      a: "Sí — our Apopka crews are bilingual (English / Spanish) and can run your full move in either language. Hablamos español.",
    },
    {
      q: "Can you handle a bigger home with a long driveway along the 429 corridor?",
      a: "Yes. Many Apopka moves are families upsizing into single-family homes with bigger garages and longer driveways near the SR-429 corridor — we handle the bulky stuff and plan access ahead.",
    },
    {
      q: "Do you serve Errol Estates, Rock Springs Ridge, and Wekiva?",
      a: "Yes — those are core Apopka service areas across north Orange County, all on up-front hourly pricing with no hidden fees.",
    },
  ],
  schema: { lat: 28.6776, lng: -81.5106 },
};

export const ST_CLOUD: CityData = {
  slug: "st-cloud-movers",
  href: "/st-cloud-movers",
  name: "St. Cloud",
  navLabel: "St. Cloud movers",
  // Full long-form page lives at src/app/(site)/st-cloud-movers/page.tsx
  // (not the thin CityPage template). Keep metadata/h1 aligned for sitemap/grids.
  metadata: {
    title: "St. Cloud Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in St. Cloud, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "St. Cloud Movers",
  subline:
    "Local, residential, and full-service moving help in St. Cloud, FL, with upfront hourly pricing and no hidden fees.",
  about: {
    h2: "St. Cloud movers built for local and residential moves",
    lead: "Toro Movers is a family-owned Central Florida crew serving St. Cloud, Narcoossee, Anthem Park, Lakeshore, and nearby Osceola County — family homes, apartments, labor-only, and full-service with upfront hourly pricing.",
  },
  neighborhoods: [
    "Narcoossee",
    "Anthem Park",
    "Lakeshore",
    "Stevens Plantation",
    "Canoe Creek",
    "Gramercy Farms",
    "Twin Lakes",
    "Center Lake",
  ],
  uniqueAngle: {
    eyebrow: "timing, access, parking",
    h2: "Moving in St. Cloud comes down to timing, access, and parking",
    body: "Narcoossee corridor traffic, HOA and new-community access, long driveway carries, and family-home closings shape every St. Cloud job. Toro plans for real logistics and quotes by the hour — no fuel, stair, or material surprise fees.",
  },
  faqs: [
    {
      q: "How much do movers cost in St. Cloud, FL?",
      a: "Costs depend on crew size, home size, access, and hours. Toro uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees.",
    },
    {
      q: "Do you move apartments and family homes in St. Cloud?",
      a: "Yes — residential homes, townhomes, apartments, and condos around Narcoossee, Anthem Park, and Lakeshore are regular work for our crew.",
    },
    {
      q: "Do you charge extra for stairs or elevators?",
      a: "No separate stair or elevator fee. We bill by the hour; materials and basic assembly/disassembly are included.",
    },
    {
      q: "Can you move me from St. Cloud to Orlando, Kissimmee, or Lake Nona?",
      a: "Yes. Local moves between St. Cloud and Orlando, Kissimmee, Lake Nona, and nearby cities are a core part of our service area.",
    },
    {
      q: "Do you offer labor-only moving help in St. Cloud?",
      a: "Yes — load or unload a U-Haul, POD, or rental truck by the hour with the same bilingual, background-checked crew.",
    },
    {
      q: "How far in advance should I book movers in St. Cloud?",
      a: "One to two weeks is ideal; same-week dates are often available. Call (689) 600-2720 or request an estimate online.",
    },
    {
      q: "What makes Toro Movers different from franchise moving companies?",
      a: "Family-owned Central Florida company, local crew, clear hourly pricing, no call-center handoff, bilingual support.",
    },
  ],
  references: [
    { label: "City of St. Cloud", href: "https://www.stcloudfl.gov/" },
    { label: "Osceola County", href: "https://www.osceola.org/" },
  ],
  schema: { lat: 28.2489, lng: -81.2812 },
};

export const WINDERMERE: CityData = {
  slug: "windermere-movers",
  href: "/windermere-movers",
  name: "Windermere",
  navLabel: "Windermere movers",
  metadata: {
    title: "Windermere Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Windermere, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "Windermere Movers — Toro Movers",
  subline:
    "Family-owned movers serving Windermere, including Isleworth, Keene's Pointe, Butler Bay, and the lakefront communities of the Butler Chain. Honest, up-front pricing.",
  about: {
    h2: "Windermere movers for high-value homes.",
    lead: "Toro Movers handles moves throughout Windermere — from gated golf communities to lakefront estates on the Butler Chain. Antique furniture, art, narrow guard gates, and long private drives all get the same careful process: phone estimate, scheduled crew, no surprises.",
  },
  neighborhoods: [
    "Isleworth",
    "Keene's Pointe",
    "Butler Bay",
    "Windermere Downs",
    "Reserve at Belmere",
    "Tildens Grove",
    "Casabella",
    "Lake Butler",
  ],
  uniqueAngle: {
    eyebrow: "lakefront & gated luxury",
    h2: "Built for Windermere estates.",
    body: "Windermere is gated, lakefront, and high-value — guard-gate check-ins, long private driveways, and homes full of antiques, art, and custom pieces. Toro Movers brings extra padding and floor protection for high-value interiors, coordinates the guard-gate access, and works deliberately so nothing gets rushed.",
  },
  faqs: [
    {
      q: "Do you handle guard-gate access for communities like Isleworth?",
      a: "Yes. Communities like Isleworth and Keene's Pointe require guard-gate check-ins and advance notice — we coordinate the gate access and arrival window ahead of time.",
    },
    {
      q: "Are you careful with antiques, art, and high-value furniture?",
      a: "Yes — Windermere homes are often full of antiques, art, and custom pieces. We bring extra padding and floor protection and work deliberately so nothing gets rushed.",
    },
    {
      q: "Can you handle long private driveways and lakefront estates?",
      a: "Yes. We plan access for long private drives and the lakefront estates on the Butler Chain so loading and unloading stay efficient.",
    },
  ],
  schema: { lat: 28.4955, lng: -81.5348 },
};

export const MAITLAND: CityData = {
  slug: "maitland-movers",
  href: "/maitland-movers",
  name: "Maitland",
  navLabel: "Maitland movers",
  metadata: {
    title: "Maitland Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Maitland, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "Maitland Movers — Toro Movers",
  subline:
    "Family-owned movers serving Maitland, including the Dommerich and Lake Maitland neighborhoods, the Maitland Center business district, and the surrounding Orange and Seminole County line. Honest, up-front pricing.",
  about: {
    h2: "Maitland movers for homes and offices.",
    lead: "Toro Movers handles apartment, home, and office moves throughout Maitland — from established lakeside homes near Lake Maitland to the offices of the Maitland Center business park. Every move runs on the same process: phone estimate, scheduled crew, no surprises.",
  },
  neighborhoods: [
    "Dommerich",
    "Lake Maitland",
    "Maitland Center",
    "Dommerich Estates",
    "Kewannee",
    "Lake Catherine",
    "Sybelia",
    "Hidden Estates",
  ],
  uniqueAngle: {
    eyebrow: "lakeside homes & office park",
    h2: "Built for Maitland.",
    body: "Maitland mixes quiet, established lakeside neighborhoods with one of the area's busiest office parks at Maitland Center. That means careful residential moves around mature trees and narrow lake-road lots one day, and after-hours office moves the next. Toro Movers handles both — protecting older homes and scheduling commercial moves around the business day so nothing slows down.",
  },
  faqs: [
    {
      q: "Do you move homes near Lake Maitland and the Dommerich area?",
      a: "Yes — established neighborhoods like Dommerich and the Lake Maitland area are core Maitland service areas for us. We plan truck access for narrow lake-road lots and protect older homes with extra padding and floor runners.",
    },
    {
      q: "Can you move an office in Maitland Center?",
      a: "Yes. We run commercial and office moves in the Maitland Center business district, scheduled after hours or on weekends so your team loses as little working time as possible.",
    },
    {
      q: "How is a Maitland move priced?",
      a: "By the hour, with the rate and crew size agreed up front — no hidden fees and no per-mile charge. You only pay for the time the move actually takes.",
    },
  ],
  schema: { lat: 28.6276, lng: -81.3631 },
};

export const DAVENPORT: CityData = {
  slug: "davenport-movers",
  href: "/davenport-movers",
  name: "Davenport",
  navLabel: "Davenport movers",
  metadata: {
    title: "Davenport Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Davenport, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "Davenport Movers — Toro Movers",
  subline:
    "Family-owned movers serving Davenport, including ChampionsGate, Providence, Ridgewood Lakes, the Four Corners area, and the surrounding northeast Polk County region. Bilingual crews, honest, up-front pricing.",
  about: {
    h2: "Davenport movers for new homes and rentals.",
    lead: "Toro Movers handles apartment, home, and vacation-rental moves throughout Davenport and the Four Corners area. From brand-new builds in ChampionsGate and Providence to furnished short-term rentals near the parks, every move runs on the same process: phone estimate, scheduled crew, no surprises. Hablamos español.",
  },
  neighborhoods: [
    "ChampionsGate",
    "Providence",
    "Ridgewood Lakes",
    "Loma del Sol",
    "Bella Trae",
    "Solterra Resort",
    "Horse Creek",
    "Town Center",
  ],
  uniqueAngle: {
    eyebrow: "new construction & vacation rentals",
    h2: "Built for fast-growing Davenport.",
    body: "Davenport and the Four Corners area exploded with new construction and short-term rentals near the parks, so a lot of moves here are first-day move-ins to brand-new homes or fast turnovers on furnished rentals. Toro Movers coordinates builder and HOA timing, handles furnished-rental turnovers as easily as a family move, and quotes the drive honestly up front — no padded hours.",
  },
  faqs: [
    {
      q: "Do you serve ChampionsGate and the Four Corners area?",
      a: "Yes — ChampionsGate, Providence, Solterra, and the wider Four Corners area are core Davenport service areas. We coordinate guard-gate check-ins and HOA arrival windows so move-in day isn't held up.",
    },
    {
      q: "Can you handle a furnished vacation-rental turnover?",
      a: "Yes. Furnished short-term rentals near the parks need fast, careful turnovers — we handle those as easily as a family-home move, billed by the hour.",
    },
    {
      q: "Davenport is a bit outside Orlando — do you charge extra for the drive?",
      a: "We bill by the hour and quote the drive honestly up front. There's no per-mile fee or fuel surcharge — you'll know the estimate before the day.",
    },
  ],
  schema: { lat: 28.1614, lng: -81.6015 },
};

export const LAKELAND: CityData = {
  slug: "lakeland-movers",
  href: "/lakeland-movers",
  name: "Lakeland",
  navLabel: "Lakeland movers",
  metadata: {
    title: "Lakeland, FL Movers — Moving Company",
    description:
      "Family-owned Lakeland movers serving Polk County — apartment, home, and labor-only moves. Bilingual, up-front hourly pricing, no hidden fees. Free estimate.",
  },
  h1: "Lakeland Movers — Toro Movers",
  subline:
    "Family-owned movers serving Lakeland and Polk County — Dixieland, Lake Hollingsworth, South Lakeland, Grasslands, and the surrounding area. Honest, up-front hourly pricing.",
  about: {
    h2: "Lakeland movers, the same honest rate.",
    lead: "Toro Movers handles apartment, home, and labor-only moves across Lakeland and Polk County. Loading a U-Haul or POD, a full move with our truck, or a quick in-town move — the process stays the same: phone estimate, scheduled crew, no surprises.",
  },
  neighborhoods: [
    "Dixieland",
    "Lake Hollingsworth",
    "South Lakeland",
    "Grasslands",
    "Cleveland Heights",
    "Christina",
    "Beacon Hill",
    "Lakeland Highlands",
  ],
  uniqueAngle: {
    eyebrow: "I-4 corridor",
    h2: "Between Tampa and Orlando.",
    body: "Lakeland sits on the I-4 corridor between Tampa and Orlando, so many Polk County moves cross county lines. Toro Movers runs Central Florida daily — we quote the drive time honestly up front and bill by the hour, so a Lakeland-to-Orlando or local Polk move has no mystery flat-rate padding.",
  },
  faqs: [
    {
      q: "Do you serve all of Polk County?",
      a: "Yes — Lakeland, Winter Haven, Bartow, Auburndale, Haines City, Lake Wales, and the surrounding Polk County area, plus moves between Polk and the Orlando metro.",
    },
    {
      q: "How is a Lakeland move priced?",
      a: "By the hour, with the crew size and rate agreed before the day — no per-mile charge, no fuel surcharge, no hidden fees. You only pay for the time the move actually takes.",
    },
    {
      q: "Can you do labor-only — load or unload my U-Haul or POD?",
      a: "Yes. If you already have a truck, U-Haul, or POD, we provide the crew to load and/or unload — or we bring the truck for a full-service move. Your choice.",
    },
  ],
  schema: { lat: 28.0395, lng: -81.9498 },
};

export const WINTER_HAVEN: CityData = {
  slug: "winter-haven-movers",
  href: "/winter-haven-movers",
  name: "Winter Haven",
  navLabel: "Winter Haven movers",
  // Full long-form page lives at src/app/(site)/winter-haven-movers/page.tsx
  // (not the thin CityPage template). Keep metadata/h1 aligned for sitemap/grids.
  metadata: {
    title: "Winter Haven Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Winter Haven, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "Winter Haven Movers",
  subline:
    "Local, apartment, and full-service moving help in Winter Haven, FL, with upfront hourly pricing and no hidden fees.",
  about: {
    h2: "Winter Haven movers built for local moves",
    lead: "Toro Movers is a family-owned Central Florida crew serving Winter Haven and Polk County — family homes, apartments, storage moves, and regional hops to Lakeland, Davenport, and the Orlando area with upfront hourly pricing.",
  },
  neighborhoods: [
    "Chain of Lakes",
    "Florence Villa",
    "Eloise",
    "Inwood",
    "Lake Region",
    "Cypress Gardens area",
    "Garden Grove",
    "Lucerne Park",
  ],
  uniqueAngle: {
    eyebrow: "timing, access, parking",
    h2: "Moving in Winter Haven comes down to timing, access, and parking",
    body: "Polk County regional hops, family home access, storage loads, and apartment loading windows shape Winter Haven jobs. Toro plans for real driveway and complex rules and quotes by the hour — no fuel, stair, or material surprise fees.",
  },
  faqs: [
    {
      q: "How much do movers cost in Winter Haven, FL?",
      a: "Costs depend on crew size, home size, access, and hours. Toro uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees.",
    },
    {
      q: "Do you move apartments and family homes in Winter Haven?",
      a: "Yes — apartments, townhomes, and single-family homes across Winter Haven and nearby Polk County are regular work for our crew.",
    },
    {
      q: "Can you move me from Winter Haven to Lakeland, Davenport, or Orlando?",
      a: "Yes. Local and regional moves between Winter Haven, Lakeland, Davenport, Kissimmee, and the Orlando metro use the same upfront hourly pricing.",
    },
  ],
  schema: { lat: 28.0222, lng: -81.7329 },
};

export const FERN_PARK: CityData = {
  slug: "fern-park-movers",
  href: "/fern-park-movers",
  name: "Fern Park",
  navLabel: "Fern Park movers",
  // Full long-form page lives at src/app/(site)/fern-park-movers/page.tsx
  metadata: {
    title: "Fern Park Movers | Local Moving Company | Toro Movers",
    description:
      "Need movers in Fern Park, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.",
  },
  h1: "Fern Park Movers — Toro Movers",
  subline:
    "Family-owned movers serving Fern Park and the US Highway 17-92 corridor in Seminole County — between Casselberry and Winter Park. Honest, up-front hourly pricing.",
  about: {
    h2: "Fern Park movers, no hidden fees.",
    lead: "Toro Movers handles apartment, home, and labor-only moves in Fern Park and along the 17-92 corridor in Seminole County. Loading a U-Haul or POD, a full move with our truck, or a quick local move — the process stays the same: phone estimate, scheduled crew, no surprises.",
  },
  neighborhoods: [
    "English Estates",
    "US Highway 17-92 corridor",
    "Fern Park CDP",
    "near Casselberry",
    "near Maitland",
    "near Winter Park",
  ],
  uniqueAngle: {
    eyebrow: "17-92 corridor",
    h2: "Right on the 17-92 corridor.",
    body: "Fern Park sits on the US Highway 17-92 corridor in Seminole County, between Casselberry and Winter Park — so most moves here are short, local hops. Toro Movers works this stretch daily, bills by the hour, and quotes the timing honestly up front, with no per-mile padding on a quick local move.",
  },
  faqs: [
    {
      q: "Do you serve Fern Park and the 17-92 corridor?",
      a: "Yes — Fern Park, English Estates, and the Highway 17-92 stretch through Seminole County, plus neighboring Casselberry, Maitland, and Winter Park.",
    },
    {
      q: "How is a Fern Park move priced?",
      a: "By the hour, with crew size and rate agreed up front — no per-mile charge, no fuel surcharge, no hidden fees. You only pay for the time the move actually takes.",
    },
    {
      q: "Can you do labor-only — load or unload my U-Haul or POD?",
      a: "Yes. If you already have a truck, U-Haul, or POD, we provide the crew to load and/or unload — or we bring the truck for a full move.",
    },
  ],
  schema: { lat: 28.6492, lng: -81.3409 },
};

export const CITIES: CityData[] = [
  ORLANDO,
  LAKE_MARY,
  WINTER_PARK,
  MAITLAND,
  FERN_PARK,
  KISSIMMEE,
  SANFORD,
  CLERMONT,
  DAVENPORT,
  LAKELAND,
  WINTER_HAVEN,
  OVIEDO,
  WINTER_GARDEN,
  ALTAMONTE_SPRINGS,
  APOPKA,
  ST_CLOUD,
  WINDERMERE,
];

export function otherCities(slug: string): CityData[] {
  return CITIES.filter((c) => c.slug !== slug);
}
