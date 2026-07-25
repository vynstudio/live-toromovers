// Service SEO pages — high-intent moving-service keywords for the Orlando /
// Central Florida metro. Data-driven (one shared <ServicePage> template) but
// every field below is unique per service — no boilerplate with the name
// swapped. Local-moves positioning only; no long-distance claims.

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServiceData {
  slug: string;
  href: string;
  name: string; // short label, e.g. "Apartment movers"
  navLabel: string;
  metadata: {
    // Base only — the root layout template appends " · Toro Movers".
    title: string;
    description: string;
  };
  h1: string;
  subline: string;
  intro: {
    h2: string;
    lead: string;
  };
  // 3–4 genuinely distinct value points for this service.
  points: { h3: string; body: string }[];
  faqs: ServiceFaq[];
  // schema.org Service type / serviceType string.
  serviceType: string;
  // Optional outbound citations to authoritative .gov / official sources
  // (rendered as a contextual "Helpful resources" line). Only set where a
  // genuinely useful reference exists — never filler links.
  references?: readonly { label: string; href: string }[];
}

export const APARTMENT_MOVERS: ServiceData = {
  slug: "apartment-movers",
  // Repointed to the dedicated LP — /apartment-movers now 301s here, so every
  // SERVICES-driven internal link (footer, city grids, service-page grids)
  // targets the canonical apartment page with no redirect hop. slug stays
  // "apartment-movers" so the sitemap filter still excludes this entry (the LP
  // is listed directly in sitemap.ts `pages`).
  href: "/apartment-movers-orlando-fl",
  name: "Apartment movers",
  navLabel: "Apartment movers",
  metadata: {
    title: "Apartment Movers Orlando",
    description:
      "Family-owned apartment movers in Orlando & Central Florida. Stairs, elevators, tight complex windows — up-front hourly pricing, bilingual crew.",
  },
  h1: "Apartment Movers in Orlando & Central Florida",
  subline:
    "Walk-ups, elevators, narrow breezeways, and strict complex move-in windows — apartment moves done by the hour, with no surprise charges.",
  intro: {
    h2: "Apartment moves are what we do every week.",
    lead: "Orlando and the surrounding metro are packed with apartment and condo communities, and they all come with the same friction: stairs, elevators, loading-zone limits, and a property manager holding you to a tight move-in window. Toro Movers runs labor-only or labor-plus-truck crews built for exactly that — careful on walk-ups, fast through elevators, and quoted up front by the hour so a third-floor unit never turns into a surprise bill.",
  },
  points: [
    {
      h3: "Stairs & elevators, priced honestly",
      body: "We bill by the hour, not by a vague flat rate, so you only pay for the time your move actually takes. We tell you up front how a third-floor walk-up or a single slow elevator affects the estimate — no padding, no guessing.",
    },
    {
      h3: "We work with your complex",
      body: "Most Orlando-area communities require a reserved elevator or a set arrival window. We coordinate with property managers and show up inside the window so move-in day isn't held up at the office.",
    },
    {
      h3: "Furniture protected on tight turns",
      body: "Narrow doorways, low breezeway ceilings, and sharp stair landings are where furniture and walls get damaged. We pad, wrap, and protect floors and corners on every apartment move.",
    },
  ],
  faqs: [
    {
      q: "Do you charge extra for stairs or a third-floor apartment?",
      a: "No separate stair fee. We bill by the hour, so a higher floor or a walk-up simply takes a little longer — and we tell you up front how that affects the estimate so there's no surprise on the invoice.",
    },
    {
      q: "Can you move just a one-bedroom apartment?",
      a: "Yes. Small apartment moves are one of the most common jobs we run. A two-mover crew handles most one- and two-bedroom apartments quickly, and you only pay for the hours used.",
    },
    {
      q: "Can you work with my building's move-in requirements?",
      a: "Yes. Most Orlando-area buildings ask for a reserved elevator and a set arrival window — we coordinate those with your property manager and show up inside the window so move-in day isn't held up.",
    },
  ],
  serviceType: "Apartment moving service",
};

export const RESIDENTIAL_MOVERS: ServiceData = {
  slug: "residential-movers",
  href: "/residential-movers",
  name: "Residential movers",
  navLabel: "Residential movers",
  metadata: {
    title: "Residential Movers Orlando & Central Florida",
    description:
      "Family-owned residential movers across Orlando & Central Florida — houses, condos & HOA communities. Bilingual, up-front hourly pricing.",
  },
  h1: "Residential Movers in Orlando & Central Florida",
  subline:
    "Single-family homes, townhomes, and HOA communities moved by a crew that treats your house like their own — up-front hourly pricing.",
  intro: {
    h2: "Your home move, handled start to finish.",
    lead: "A house move has more moving parts than an apartment — more rooms, bigger furniture, garages and patios, and often an HOA or gated community on at least one end. Toro Movers handles the whole thing: disassembly and reassembly, careful loading, and floor and doorway protection throughout. Up-front hourly pricing, the same crew that quoted you on the day, and no surprises.",
  },
  points: [
    {
      h3: "Whole-home, not just the easy stuff",
      body: "Beds, sectionals, dressers, appliances, the garage, the patio set — we move it all and reassemble what we take apart, so you're not living around a half-finished move the next morning.",
    },
    {
      h3: "Built for HOA & gated communities",
      body: "Across Central Florida, most newer homes sit in HOA or gated neighborhoods with arrival windows and guard-gate check-ins. We coordinate the timing and gate access so you're not stuck at the gate.",
    },
    {
      h3: "Floors and walls protected",
      body: "We pad door jambs, lay floor runners, and wrap furniture before it moves — the details that keep a brand-new floor or a freshly painted hallway looking new.",
    },
  ],
  faqs: [
    {
      q: "How is a house move priced?",
      a: "By the hour, with the rate and crew size agreed up front. Bigger homes simply take more time; we give you an honest estimate based on bedrooms, access, and distance before the day so there are no surprises.",
    },
    {
      q: "Do you disassemble and reassemble furniture?",
      a: "Yes — beds, table legs, wall units, and similar pieces are taken apart for transport and put back together at the new home as part of the move.",
    },
    {
      q: "Can you do the move in one day?",
      a: "Most local residential moves within Central Florida are completed in a single day. For larger homes we'll tell you up front if a second crew or an early start makes sense.",
    },
  ],
  serviceType: "Residential moving service",
};

export const COMMERCIAL_MOVERS: ServiceData = {
  slug: "commercial-movers",
  href: "/commercial-movers",
  name: "Commercial movers",
  navLabel: "Commercial movers",
  metadata: {
    title: "Commercial & Office Movers Orlando",
    description:
      "Office & commercial movers in Orlando & Central Florida — after-hours moves, desks, IT & equipment. Bilingual, up-front pricing.",
  },
  h1: "Commercial & Office Movers in Orlando",
  subline:
    "Offices, retail, and small commercial spaces moved around your schedule — after-hours or weekend, with up-front hourly pricing.",
  intro: {
    h2: "Move the business without losing a day.",
    lead: "A commercial move lives or dies on timing — every hour the office is in boxes is an hour nobody's working. Toro Movers schedules around your operation, including evenings and weekends, and moves desks, workstations, conference furniture, and equipment carefully so you're back up and running fast. Quoted by the hour up front, and we coordinate building access ahead of time.",
  },
  points: [
    {
      h3: "After-hours & weekend moves",
      body: "We schedule commercial moves outside business hours when you need them, so the team walks into a finished setup instead of a day lost to boxes.",
    },
    {
      h3: "Desks, IT, and equipment",
      body: "Workstations, filing, conference tables, and sensitive equipment are wrapped, labeled, and placed where they go at the new space — not just dropped in a pile by the door.",
    },
    {
      h3: "Building access coordination",
      body: "Office buildings almost always require a reserved freight elevator or dock window and advance scheduling. We book the access and arrival window ahead of time.",
    },
  ],
  faqs: [
    {
      q: "Can you move our office after hours or on a weekend?",
      a: "Yes. Most commercial moves we run are scheduled in the evening or over a weekend so your team loses as little working time as possible.",
    },
    {
      q: "Can you schedule around our building's access rules?",
      a: "Yes. Office buildings usually require a reserved freight elevator or dock window and advance notice — we coordinate the access and timing with building management ahead of the move.",
    },
    {
      q: "How do you price a commercial move?",
      a: "By the hour, with crew size and timing agreed up front. We'll walk the space or review a list first so the estimate reflects the real job — no vague flat rate.",
    },
  ],
  serviceType: "Commercial moving service",
  references: [
    { label: "the FMCSA's rules for licensed carriers", href: "https://www.fmcsa.dot.gov/protect-your-move" },
    { label: "Florida's Sunbiz business registry", href: "https://dos.fl.gov/sunbiz/" },
  ],
};

export const LOADING_UNLOADING: ServiceData = {
  slug: "loading-unloading",
  href: "/loading-unloading",
  name: "Loading & unloading help",
  navLabel: "Loading & unloading",
  metadata: {
    title: "Loading & Unloading Help Orlando",
    description:
      "Loading & unloading help in Orlando & Central Florida — U-Haul, PODS & rental trucks loaded tight. Bilingual, up-front hourly pricing.",
  },
  h1: "Loading & Unloading Help in Orlando",
  subline:
    "Got the truck, POD, or container? We bring the muscle — labor-only loading and unloading by the hour, no truck rental required.",
  intro: {
    h2: "You rented the truck. We'll load it right.",
    lead: "Plenty of moves don't need a moving truck — you've already got a U-Haul, a POD, a rental, or a container in the driveway. What you need is a strong, careful crew to load it tight or unload it fast. Toro Movers does labor-only by the hour: we load so nothing shifts on the road, or unload and place everything where it goes. Up-front pricing, two-hour minimum.",
  },
  points: [
    {
      h3: "U-Haul, PODS, containers, rentals",
      body: "Whatever's in your driveway, we load it like a puzzle so the weight is balanced and nothing slides in transit — or unload and carry it in, your call.",
    },
    {
      h3: "Loading help, unloading help, or both",
      body: "Book us for one end or both. Loading-only, unloading-only, or a full reload between addresses — all billed by the hour with a two-hour minimum.",
    },
    {
      h3: "Just the muscle, not a moving truck bill",
      body: "You skip the cost of our truck and just pay for the crew's time. Same careful handling — wrapped furniture, protected floors, no scratched walls.",
    },
  ],
  faqs: [
    {
      q: "Can I hire just movers without a truck?",
      a: "Yes — labor-only loading and unloading is one of our most-requested services. You provide the truck, POD, or container; we provide the crew, billed by the hour.",
    },
    {
      q: "Can you load a POD or U-Haul so nothing shifts?",
      a: "That's exactly the job. We load the truck tight and balanced so furniture and boxes don't shift on the road, whether you're driving across town or storing it.",
    },
    {
      q: "Is there a minimum?",
      a: "Yes, a two-hour minimum, then billed by the hour after that. We tell you the rate and crew size up front before you book.",
    },
  ],
  serviceType: "Loading and unloading labor service",
};

export const FULL_SERVICE_MOVING: ServiceData = {
  slug: "full-service-moving",
  href: "/full-service-moving",
  name: "Full-service moving",
  navLabel: "Full-service moving",
  metadata: {
    title: "Full-Service Movers Orlando",
    description:
      "Full-service movers in Central Florida — truck, crew, loading, transport & placement. Up-front pricing, bilingual crew. Quote in 60s.",
  },
  h1: "Full-Service Movers in Central Florida",
  subline:
    "Truck, crew, loading, transport, and careful placement — door to door with upfront hourly pricing and no hidden fees.",
  intro: {
    h2: "Everything handled. You just open the door.",
    lead: "Full-service is our primary move: Toro brings the truck, the bilingual crew, furniture protection, loading, local transport, unloading, and placement. Beds and tables go back together, floors stay protected, and the same people who quote you show up on the day. Local Central Florida only — that is how we keep same-week scheduling and honest hourly rates.",
  },
  points: [
    {
      h3: "Furniture protection included",
      body: "Blankets, shrink wrap, and careful loading so pieces arrive the way they left — no extra material fees on the bill.",
    },
    {
      h3: "Door to door",
      body: "An experienced local crew loads, drives, protects, and unloads. You do not lift a thing from origin to destination.",
    },
    {
      h3: "Set up & reassembled",
      body: "Furniture placed where you want it, with beds and tables put back together so the new place feels livable on day one.",
    },
    {
      h3: "Upfront hourly pricing",
      body: "Crew size and truck agreed before we start. No fuel surcharges, no stair fees — the clock stops when the job ends.",
    },
  ],
  faqs: [
    {
      q: "What does full-service moving include?",
      a: "Truck, crew, furniture protection, loading, transport, unloading, placement, and disassembly/reassembly as needed. Same crew that quotes shows up on the day.",
    },
    {
      q: "Do you only move locally?",
      a: "Yes. Toro Movers is a local Central Florida moving company serving the Orlando metro. We don't do long-distance — staying local lets us schedule fast and price honestly by the hour.",
    },
    {
      q: "How is a full-service move priced?",
      a: "Up front, by the hour — a two-mover crew and our truck (up to 26 ft) with a four-hour minimum, and you can add movers for larger homes. Shrink wrap, furniture blankets, and assembly/disassembly are included; no fuel surcharge, no stair fee. For long-distance moves a per-mile charge applies beyond 100 miles. Send your details and you'll get your exact price in about 60 seconds — confirmed before we start, no surprise add-ons.",
    },
    {
      q: "How do you protect furniture on the truck?",
      a: "We pad and secure furniture with moving blankets and careful loading so pieces stay protected door to door.",
    },
  ],
  serviceType: "Full-service local moving",
};

export const LABOR_ONLY_MOVING: ServiceData = {
  slug: "labor-only-moving",
  href: "/labor-only-moving",
  name: "Labor-only moving",
  navLabel: "Labor-only moving",
  metadata: {
    title: "Labor-Only Movers Orlando",
    description:
      "Labor-only movers in Orlando — load/unload U-Haul, PODS & trucks by the hour. Secondary to our full-service moves. Family-owned. Quote today.",
  },
  h1: "Labor-Only Movers in Orlando & Central Florida",
  subline:
    "Already have a U-Haul, POD, or rental truck? Hire our crew for loading, unloading, and stair help — by the hour, no truck fee.",
  intro: {
    h2: "You keep the truck. We bring the muscle.",
    lead: "Labor-only is for when you already have the truck, POD, or container — Toro provides the careful bilingual crew. We load tight so nothing shifts, unload and place, and handle stairs and heavy items. Same family-owned Central Florida team as full-service, billed by the hour with a two-hour minimum and no surprise add-ons.",
  },
  points: [
    {
      h3: "By the hour, up front",
      body: "Honest hourly pricing quoted before we start. No fuel surcharge, no stair fee, no surprise line items.",
    },
    {
      h3: "Just the muscle",
      body: "Already have a truck or POD? We bring the crew, the care, and the Tetris skills to pack it right.",
    },
    {
      h3: "U-Haul, PODS & storage",
      body: "Loading and unloading help for rentals, pods, and storage units across Orlando and the surrounding metro.",
    },
    {
      h3: "Fast to book",
      body: "Local Central Florida crews mean we can often fit you in this week — call or request a quote online.",
    },
  ],
  faqs: [
    {
      q: "What is labor-only moving?",
      a: "You provide the truck, POD, or storage unit — we provide the crew. Toro Movers loads, unloads, and carefully handles your belongings by the hour, including stairs and heavy items.",
    },
    {
      q: "Can you help load or unload a U-Haul, PODS, or rental truck in Orlando?",
      a: "Yes — loading and unloading a U-Haul, PODS, rental truck, or storage container is exactly what labor-only moving is. You keep the truck; we load it tight so nothing shifts on the road, or unload and carry everything in. Billed by the hour, two-hour minimum, across Orlando and Central Florida.",
    },
    {
      q: "How much does labor-only cost?",
      a: "Labor-only is billed up front by the hour — a two-mover crew with a two-hour minimum, and you can add movers for bigger jobs. Shrink wrap, furniture blankets, and assembly/disassembly are included; no fuel surcharge, no stair fee. Send your move details and you'll get your exact rate in about 60 seconds — confirmed before we start, with no surprise line items.",
    },
    {
      q: "Do you only work in Central Florida?",
      a: "Yes. We're a local Central Florida moving company based in the Orlando metro and we keep it local — that's what lets us schedule fast and price honestly.",
    },
    {
      q: "Can you help on short notice?",
      a: "Often, yes. Call us to check availability for your date and we'll tell you right away what we can do.",
    },
  ],
  serviceType: "Labor-only moving help",
};

export const SERVICES: ServiceData[] = [
  APARTMENT_MOVERS,
  RESIDENTIAL_MOVERS,
  COMMERCIAL_MOVERS,
  FULL_SERVICE_MOVING,
  LABOR_ONLY_MOVING,
  LOADING_UNLOADING,
];

export function otherServices(slug: string): ServiceData[] {
  return SERVICES.filter((s) => s.slug !== slug);
}
