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
}

export const APARTMENT_MOVERS: ServiceData = {
  slug: "apartment-movers",
  href: "/apartment-movers",
  name: "Apartment movers",
  navLabel: "Apartment movers",
  metadata: {
    title: "Apartment Movers Orlando",
    description:
      "Family-owned apartment movers in Orlando & Central Florida. Stairs, elevators, tight complex windows — up-front hourly pricing, insured, bilingual crew.",
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
      body: "Most Orlando-area communities require a reserved elevator, a certificate of insurance, or a set arrival window. We carry the documentation property managers ask for and show up inside the window so move-in day isn't held up at the office.",
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
      q: "My building needs a certificate of insurance. Can you provide one?",
      a: "Yes. We're fully insured and can send a certificate of insurance (COI) naming your building or HOA ahead of move day — just send us the requirements when you book.",
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
      "Family-owned residential movers across Orlando & Central Florida — houses, condos & HOA communities. Insured, bilingual, up-front hourly pricing.",
  },
  h1: "Residential Movers in Orlando & Central Florida",
  subline:
    "Single-family homes, townhomes, and HOA communities moved by a crew that treats your house like their own — up-front hourly pricing, fully insured.",
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
      body: "Across Central Florida, most newer homes sit in HOA or gated neighborhoods with arrival windows, guard-gate check-ins, and COI requirements. We carry the documentation and coordinate timing so you're not stuck at the gate.",
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
    title: "Commercial Movers Orlando",
    description:
      "Office & commercial movers in Orlando & Central Florida — after-hours moves, desks, IT & equipment. Insured, bilingual, up-front pricing.",
  },
  h1: "Commercial & Office Movers in Orlando",
  subline:
    "Offices, retail, and small commercial spaces moved around your schedule — after-hours or weekend, fully insured, with up-front hourly pricing.",
  intro: {
    h2: "Move the business without losing a day.",
    lead: "A commercial move lives or dies on timing — every hour the office is in boxes is an hour nobody's working. Toro Movers schedules around your operation, including evenings and weekends, and moves desks, workstations, conference furniture, and equipment carefully so you're back up and running fast. Fully insured, COI provided for your building, and quoted by the hour up front.",
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
      h3: "Building & COI coordination",
      body: "Office buildings almost always require a certificate of insurance and a reserved freight elevator or dock window. We handle the paperwork and book the access ahead of time.",
    },
  ],
  faqs: [
    {
      q: "Can you move our office after hours or on a weekend?",
      a: "Yes. Most commercial moves we run are scheduled in the evening or over a weekend so your team loses as little working time as possible.",
    },
    {
      q: "Do you provide a certificate of insurance for our building?",
      a: "Yes. We're fully insured and provide a COI naming your building management ahead of the move — send us the requirements when you book.",
    },
    {
      q: "How do you price a commercial move?",
      a: "By the hour, with crew size and timing agreed up front. We'll walk the space or review a list first so the estimate reflects the real job — no vague flat rate.",
    },
  ],
  serviceType: "Commercial moving service",
};

export const PACKING_SERVICES: ServiceData = {
  slug: "packing-services",
  href: "/packing-services",
  name: "Packing services",
  navLabel: "Packing services",
  metadata: {
    title: "Packing Services Orlando",
    description:
      "Professional packing services in Orlando & Central Florida — full or partial packing, supplies, fragile items. Insured, bilingual, up-front pricing.",
  },
  h1: "Packing Services in Orlando & Central Florida",
  subline:
    "Full-home or kitchen-only packing, done fast and carefully by the same crew that moves you — up-front hourly pricing, packing materials available.",
  intro: {
    h2: "Skip the worst part of moving.",
    lead: "Packing is the part everyone underestimates — and the part that keeps people up the night before a move. Toro Movers packs as much or as little as you want: the whole home, just the kitchen and breakables, or only the stuff you ran out of time for. We bring the boxes, paper, and wrap, label everything by room, and pack it so it actually survives the truck.",
  },
  points: [
    {
      h3: "Full or partial — your call",
      body: "Hand us the whole home or just the rooms you didn't get to. We scale the crew and the materials to what you actually need, billed by the hour.",
    },
    {
      h3: "Fragile items done right",
      body: "Dishes, glassware, mirrors, art, and electronics are wrapped and boxed with the right materials so they don't rattle, shift, or break in transit.",
    },
    {
      h3: "Labeled by room for a fast unload",
      body: "Every box is labeled by room and contents, so unloading at the new place is quick and nothing ends up in the wrong room.",
    },
  ],
  faqs: [
    {
      q: "Do you bring boxes and packing materials?",
      a: "Yes — we can supply boxes, paper, tape, and wrap, or pack materials you already have. Supplies are billed separately from labor and we tell you the cost up front.",
    },
    {
      q: "Can you pack just the kitchen or fragile items?",
      a: "Absolutely. Partial packing — kitchens, glassware, art, electronics — is one of the most popular options. You only pay for the hours it takes.",
    },
    {
      q: "Can you pack the day before the move?",
      a: "Yes. Many customers book packing for the day before so move day itself is just loading and transport. We'll schedule whichever works for you.",
    },
  ],
  serviceType: "Packing service",
};

export const LOADING_UNLOADING: ServiceData = {
  slug: "loading-unloading",
  href: "/loading-unloading",
  name: "Loading & unloading help",
  navLabel: "Loading & unloading",
  metadata: {
    title: "Loading & Unloading Help Orlando",
    description:
      "Loading & unloading help in Orlando & Central Florida — U-Haul, PODS & rental trucks loaded tight. Insured, bilingual, up-front hourly pricing.",
  },
  h1: "Loading & Unloading Help in Orlando",
  subline:
    "Got the truck, POD, or container? We bring the muscle — labor-only loading and unloading by the hour, fully insured, no truck rental required.",
  intro: {
    h2: "You rented the truck. We'll load it right.",
    lead: "Plenty of moves don't need a moving truck — you've already got a U-Haul, a POD, a rental, or a container in the driveway. What you need is a strong, careful crew to load it tight or unload it fast. Toro Movers does labor-only by the hour: we load so nothing shifts on the road, or unload and place everything where it goes. Fully insured, up-front pricing, two-hour minimum.",
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
      h3: "Insured muscle, not a moving truck bill",
      body: "You skip the cost of our truck and just pay for the crew's time. Same insured, careful handling — wrapped furniture, protected floors, no scratched walls.",
    },
  ],
  faqs: [
    {
      q: "Can I hire just movers without a truck?",
      a: "Yes — labor-only loading and unloading is one of our most-requested services. You provide the truck, POD, or container; we provide the crew, billed by the hour.",
    },
    {
      q: "Can you load a POD or U-Haul so nothing shifts?",
      a: "That's exactly the job. We pack the load tight and balanced so furniture and boxes don't move on the road, whether you're driving across town or storing it.",
    },
    {
      q: "Is there a minimum?",
      a: "Yes, a two-hour minimum, then billed by the hour after that. We tell you the rate and crew size up front before you book.",
    },
  ],
  serviceType: "Loading and unloading labor service",
};

export const SERVICES: ServiceData[] = [
  APARTMENT_MOVERS,
  RESIDENTIAL_MOVERS,
  COMMERCIAL_MOVERS,
  PACKING_SERVICES,
  LOADING_UNLOADING,
];

export function otherServices(slug: string): ServiceData[] {
  return SERVICES.filter((s) => s.slug !== slug);
}
