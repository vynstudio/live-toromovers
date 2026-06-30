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
    // Base only — the root layout template appends " · Toro Movers".
    title: "Orlando Movers",
    description:
      "Family-owned Orlando movers — downtown, Lake Nona, Dr. Phillips & nearby. Fully insured, bilingual, up-front hourly pricing, no hidden fees. Free estimate.",
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
  faqs: [
    {
      q: "How does Orlando traffic affect my moving day?",
      a: "More than most cities — I-4 work, theme-park weekend congestion, and downtown construction can add time if a crew doesn't know the area. Our Orlando crews plan routes around city patterns, not map-app defaults, and we quote the timing honestly up front.",
    },
    {
      q: "Can you move a downtown Orlando high-rise or apartment?",
      a: "Yes. We move downtown high-rises, Lake Nona apartments, and homes across Orange County regularly — reserving the freight elevator or loading zone where the building requires it and working within your complex's move-in window.",
    },
    {
      q: "How is an Orlando move priced?",
      a: "By the hour, with the crew size and rate agreed before the day — no per-mile charge, no fuel surcharge, no hidden fees. You only pay for the time the move actually takes.",
    },
  ],
  schema: { lat: 28.5384, lng: -81.3789 },
};

export const LAKE_MARY: CityData = {
  slug: "lake-mary-movers",
  href: "/lake-mary-movers",
  name: "Lake Mary",
  navLabel: "Lake Mary movers",
  metadata: {
    title: "Lake Mary Movers",
    description:
      "Family-owned Lake Mary movers — Heathrow, Markham Woods, Timacuan & Seminole County. Insured, bilingual, up-front hourly pricing, no hidden fees.",
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
  faqs: [
    {
      q: "My Lake Mary HOA needs a certificate of insurance — can you provide one?",
      a: "Yes. Many Lake Mary and Heathrow communities require a COI on file and a set arrival window. We're fully insured and send the certificate naming your HOA or property management ahead of move day.",
    },
    {
      q: "Do you move in gated communities like Heathrow or Markham Woods?",
      a: "Regularly. We coordinate guard-gate check-ins and HOA arrival windows directly so move-in day doesn't get held up at the gate.",
    },
    {
      q: "How far in advance should I book a Lake Mary move?",
      a: "Sooner is better for gated communities that require advance notice, but we keep same-week availability across Seminole County. Call with your date and we'll tell you honestly what's open.",
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
    title: "Winter Park Movers",
    description:
      "Family-owned Winter Park movers — Park Ave, Aloma & historic neighborhoods. Insured, careful with high-value homes, up-front hourly pricing. Free estimate.",
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
  faqs: [
    {
      q: "Are you careful with antiques and historic Winter Park homes?",
      a: "Yes — Winter Park has more historic homes than most Florida cities, with hardwood floors, original moldings, and narrow doorways. We bring extra blankets, floor protection, and door-jamb padding and handle antique and high-value pieces deliberately.",
    },
    {
      q: "Can you handle tight parking near Park Avenue?",
      a: "We plan truck access ahead of time for Park Avenue and the older Olde Winter Park streets, where parking and driveways are tight, so loading doesn't hold up the move.",
    },
    {
      q: "Do you move both homes and apartments in Winter Park?",
      a: "Yes — from historic homes near Park Avenue to modern apartments and luxury residential, all on the same up-front hourly pricing.",
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
    title: "Kissimmee, FL Movers — Moving Company",
    description:
      "Family-owned movers in Kissimmee, FL — Celebration, Poinciana, Buenaventura Lakes & Osceola County. Bilingual, insured, up-front hourly pricing, no hidden fees.",
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
    title: "Sanford, FL Movers — Moving Company",
    description:
      "Family-owned movers in Sanford, FL — Historic Downtown, Lake Monroe, Mayfair & Seminole County. Insured, bilingual, up-front hourly pricing. Free estimate.",
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
  metadata: {
    title: "Clermont Movers",
    description:
      "Family-owned Clermont movers — Kings Ridge, Legends, Summit Greens & Lake County. Insured, bilingual, up-front hourly pricing. Free estimate.",
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
    title: "Oviedo Movers",
    description:
      "Family-owned Oviedo movers — Alafaya Woods, Twin Rivers, Live Oak Reserve & Seminole County. Insured, bilingual, up-front hourly pricing. Free estimate.",
  },
  h1: "Oviedo Movers — Toro Movers",
  subline:
    "Family-owned movers serving Oviedo, including Alafaya Woods, Twin Rivers, Live Oak Reserve, and the surrounding Seminole County area. Fully insured, honest pricing.",
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
  metadata: {
    title: "Winter Garden Movers",
    description:
      "Family-owned Winter Garden movers — Historic Downtown, Independence, Horizon West & west Orange County. Insured, bilingual, up-front hourly pricing.",
  },
  h1: "Winter Garden Movers — Toro Movers",
  subline:
    "Family-owned movers serving Winter Garden, including Historic Downtown, Independence, the Hamlin / Horizon West area, and west Orange County. Fully insured, honest pricing.",
  about: {
    h2: "Winter Garden movers, growth and charm.",
    lead: "Toro Movers handles apartment, home, and new-construction moves throughout Winter Garden and west Orange County. From historic homes near Plant Street to brand-new builds in Horizon West, the process stays the same: phone estimate, scheduled crew, no surprises.",
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
  metadata: {
    title: "Altamonte Springs, FL Movers — Moving Company",
    description:
      "Family-owned movers in Altamonte Springs, FL — Cranes Roost, Uptown, Sanlando & Seminole County apartments & condos. Insured, up-front hourly pricing.",
  },
  h1: "Altamonte Springs Movers — Toro Movers",
  subline:
    "Family-owned movers serving Altamonte Springs, including Uptown Altamonte, Cranes Roost, Sanlando Springs, and the surrounding Seminole County area. Fully insured, honest pricing.",
  about: {
    h2: "Altamonte movers for apartments & condos.",
    lead: "Toro Movers handles apartment, condo, and home moves throughout Altamonte Springs and south Seminole County. From third-floor walk-ups near Uptown to condos by Cranes Roost, the process stays the same: phone estimate, scheduled crew, no surprises.",
  },
  neighborhoods: [
    "Uptown Altamonte",
    "Cranes Roost",
    "Sanlando Springs",
    "Spring Oaks",
    "Lake Lotus",
    "The Springs",
    "Montgomery Club",
    "Bear Lake",
  ],
  uniqueAngle: {
    eyebrow: "apartment & condo moves",
    h2: "Built for Altamonte apartments.",
    body: "Altamonte Springs is dense with apartment and condo communities, which means stairs, elevators, narrow breezeways, and strict complex move-in windows. Toro Movers' hourly crews are built for exactly this — labor-only or labor-plus-truck, careful on walk-ups and tight turns, and quoted up front by the hour so a third-floor unit never turns into a surprise bill.",
  },
  faqs: [
    {
      q: "Do you charge extra for stairs or a third-floor Altamonte apartment?",
      a: "No separate stair fee — we bill by the hour, so a higher floor or walk-up simply takes a little longer, and we tell you up front how that affects the estimate.",
    },
    {
      q: "Can you work with apartment-complex move-in windows near Uptown or Cranes Roost?",
      a: "Yes. Altamonte is dense with apartment and condo communities — we reserve elevators where needed and work within your complex's move-in window.",
    },
    {
      q: "Do you do labor-only loading if I have my own truck or POD?",
      a: "Yes — labor-only loading and unloading by the hour is one of our most-requested options in Altamonte's apartment communities.",
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
    title: "Apopka Movers",
    description:
      "Family-owned Apopka movers — Errol Estates, Rock Springs Ridge, Wekiva & north Orange County. Bilingual, insured, up-front hourly pricing, no hidden fees.",
  },
  h1: "Apopka Movers — Toro Movers",
  subline:
    "Family-owned movers serving Apopka, including Errol Estates, Rock Springs Ridge, Wekiva, and the surrounding north Orange County area. Bilingual crews, fully insured, honest pricing.",
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
  metadata: {
    title: "St. Cloud, FL Movers — Moving Company",
    description:
      "Looking for a moving company in St. Cloud, FL? Toro Movers — family-owned & insured, serving Narcoossee, Anthem Park, Lakeshore & Osceola County. Bilingual crews, up-front hourly pricing, no hidden fees.",
  },
  h1: "St. Cloud Movers — Toro Movers",
  subline:
    "Family-owned movers serving St. Cloud, including the Narcoossee corridor, Anthem Park, Lakeshore, and the surrounding Osceola County area. Bilingual crews, fully insured, honest pricing.",
  about: {
    h2: "St. Cloud movers for new homes.",
    lead: "Toro Movers handles apartment, home, and new-construction moves throughout St. Cloud and south Osceola County. From brand-new builds near Narcoossee and Lake Nona to established homes by East Lake Toho, the process stays the same: phone estimate, scheduled crew, no surprises. Hablamos español.",
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
    eyebrow: "new construction & fast growth",
    h2: "Built for fast-growing St. Cloud.",
    body: "St. Cloud is one of the fastest-growing spots south of Lake Nona, so a lot of moves here are first-day move-ins to brand-new homes — builder schedules, fresh floors, and new-community streets that aren't on older maps yet. Toro Movers coordinates builder and HOA timing, protects new finishes, and gets you in without the surprises.",
  },
  faqs: [
    {
      q: "Can you do a first-day move-in to a new St. Cloud build near Narcoossee?",
      a: "Yes. St. Cloud is one of the fastest-growing areas south of Lake Nona, so first-day move-ins to brand-new homes are routine — we coordinate builder and HOA timing and protect new finishes.",
    },
    {
      q: "¿Hablan español en St. Cloud?",
      a: "Sí — our St. Cloud crews are bilingual (English / Spanish) and can quote and run the move in either language.",
    },
    {
      q: "St. Cloud is south of the metro — is there a travel charge?",
      a: "We bill by the hour and quote the drive honestly up front. There's no per-mile fee or fuel surcharge across Osceola County.",
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
    title: "Windermere Movers",
    description:
      "Family-owned Windermere movers — Isleworth, Keene's Pointe, Butler Bay & the Butler Chain. Insured, careful with high-value homes. Free estimate.",
  },
  h1: "Windermere Movers — Toro Movers",
  subline:
    "Family-owned movers serving Windermere, including Isleworth, Keene's Pointe, Butler Bay, and the lakefront communities of the Butler Chain. Fully insured, honest pricing.",
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
    body: "Windermere is gated, lakefront, and high-value — guard-gate check-ins, certificates of insurance on file, long private driveways, and homes full of antiques, art, and custom pieces. Toro Movers carries the documentation these communities require, brings extra padding and floor protection for high-value interiors, and works deliberately so nothing gets rushed.",
  },
  faqs: [
    {
      q: "Do you carry insurance and a COI for gated Windermere communities like Isleworth?",
      a: "Yes. Communities like Isleworth and Keene's Pointe require a certificate of insurance on file and guard-gate check-ins — we're fully insured and handle the documentation and access ahead of time.",
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
    title: "Maitland, FL Movers — Moving Company",
    description:
      "Moving company in Maitland, FL — Toro Movers. Family-owned & insured, serving Dommerich, Lake Maitland, Maitland Center & the Orange/Seminole line. Bilingual, up-front hourly pricing, no hidden fees.",
  },
  h1: "Maitland Movers — Toro Movers",
  subline:
    "Family-owned movers serving Maitland, including the Dommerich and Lake Maitland neighborhoods, the Maitland Center business district, and the surrounding Orange and Seminole County line. Fully insured, honest pricing.",
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
      a: "Yes. We run commercial and office moves in the Maitland Center business district, scheduled after hours or on weekends so your team loses as little working time as possible. A certificate of insurance is provided for the building.",
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
    title: "Davenport Movers",
    description:
      "Family-owned Davenport movers — ChampionsGate, Providence, Ridgewood Lakes & the Four Corners area. Bilingual, insured, up-front hourly pricing.",
  },
  h1: "Davenport Movers — Toro Movers",
  subline:
    "Family-owned movers serving Davenport, including ChampionsGate, Providence, Ridgewood Lakes, the Four Corners area, and the surrounding northeast Polk County region. Bilingual crews, fully insured, honest pricing.",
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
    title: "Lakeland Movers",
    description:
      "Family-owned Lakeland movers serving Polk County — apartment, home, and labor-only moves. Fully insured, bilingual, up-front hourly pricing, no hidden fees. Free estimate.",
  },
  h1: "Lakeland Movers — Toro Movers",
  subline:
    "Family-owned movers serving Lakeland and Polk County — Dixieland, Lake Hollingsworth, South Lakeland, Grasslands, and the surrounding area. Fully insured, honest hourly pricing.",
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
  metadata: {
    title: "Winter Haven Movers",
    description:
      "Family-owned Winter Haven movers serving Polk County — apartment, home, and labor-only moves. Fully insured, bilingual, up-front hourly pricing, no hidden fees. Free estimate.",
  },
  h1: "Winter Haven Movers — Toro Movers",
  subline:
    "Family-owned movers serving Winter Haven and Polk County — the Chain of Lakes, Florence Villa, Eloise, Inwood, and the Cypress Gardens area. Fully insured, honest hourly pricing.",
  about: {
    h2: "Winter Haven movers for the Chain of Lakes.",
    lead: "Toro Movers handles apartment, home, and labor-only moves across Winter Haven and Polk County — from lakefront homes near the Chain of Lakes to apartments near the Cypress Gardens area. Phone estimate, scheduled crew, hourly pricing, no surprises.",
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
    eyebrow: "lakefront access",
    h2: "Built for lakefront moves.",
    body: "Winter Haven's Chain of Lakes means narrow lakefront drives, docks, and tight access at many homes. Toro Movers crews pad-wrap furniture and plan the carry so lakefront and Cypress Gardens-area moves go smoothly — billed by the hour, quoted honestly up front.",
  },
  faqs: [
    {
      q: "Do you serve all of Polk County?",
      a: "Yes — Winter Haven, Lakeland, Bartow, Auburndale, Haines City, Lake Wales, and the surrounding Polk County area, plus moves between Polk and the Orlando metro.",
    },
    {
      q: "How is a Winter Haven move priced?",
      a: "By the hour, with the crew size and rate agreed before the day — no per-mile charge, no fuel surcharge, no hidden fees. You only pay for the time the move actually takes.",
    },
    {
      q: "Can you do labor-only — load or unload my U-Haul or POD?",
      a: "Yes. If you already have a truck, U-Haul, or POD, we provide the crew to load and/or unload — or we bring the truck for a full-service move. Your choice.",
    },
  ],
  schema: { lat: 28.0222, lng: -81.7329 },
};

export const FERN_PARK: CityData = {
  slug: "fern-park-movers",
  href: "/fern-park-movers",
  name: "Fern Park",
  navLabel: "Fern Park movers",
  metadata: {
    title: "Fern Park, FL Movers — Moving Company",
    description:
      "Moving company in Fern Park, FL — Toro Movers. Family-owned & insured, serving Fern Park, English Estates & the US-17-92 corridor in Seminole County. Bilingual, up-front hourly pricing, no hidden fees.",
  },
  h1: "Fern Park Movers — Toro Movers",
  subline:
    "Family-owned movers serving Fern Park and the US Highway 17-92 corridor in Seminole County — between Casselberry and Winter Park. Fully insured, honest hourly pricing.",
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
