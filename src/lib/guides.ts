// Blog / guide content — informational SEO that supports the local money
// pages. Data-driven (one shared <GuidePage> template). Buyer-first, genuinely
// useful, local. No price figures, no long-distance claims.

export interface GuideSection {
  h2: string;
  body?: string[];
  bullets?: string[];
}

export interface GuideData {
  slug: string;
  href: string;
  metadata: { title: string; description: string };
  h1: string;
  intro: string;
  datePublished: string; // ISO date
  readMins: number;
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
}

export const ORLANDO_MOVE_PREP: GuideData = {
  slug: "how-to-prepare-for-a-local-move-in-orlando",
  href: "/blog/how-to-prepare-for-a-local-move-in-orlando",
  metadata: {
    title: "How to Prepare for a Local Move in Orlando",
    description:
      "A practical local checklist for moving in Orlando — timing, HOA & elevator rules, traffic, packing, and what to expect from your movers. From Toro Movers.",
  },
  h1: "How to Prepare for a Local Move in Orlando, FL",
  intro:
    "A local move across Orlando is simpler than a cross-country one, but the details still make or break the day — building rules, traffic, summer heat, and how well you've packed. Here's how to get ready, from a family-owned crew that moves the metro every week.",
  datePublished: "2026-06-09",
  readMins: 6,
  sections: [
    {
      h2: "Start two to three weeks out",
      body: [
        "Most local moves don't need months of planning, but two to three weeks gives you room to book a crew, sort what you're keeping, and clear anything your building requires. The biggest mistake we see in Orlando is people calling for movers two days before the end of the month — the busiest window — and finding everyone booked.",
      ],
    },
    {
      h2: "Book your movers early — especially end of month",
      body: [
        "Lease turnovers cluster at the end and start of each month, so those dates fill first across the metro. If your date is flexible, a mid-month weekday is easier to book and the crew isn't rushing between jobs. When you call, have your two addresses, rough size (bedrooms), and any stairs or elevator details ready so the hourly estimate is accurate up front.",
      ],
    },
    {
      h2: "Know your building's rules before move day",
      body: [
        "This is the step that most often delays an Orlando move. Many apartment communities, downtown high-rises, and HOA neighborhoods (think Lake Mary, Windermere, Winter Garden) require some combination of the following — confirm them a week ahead:",
      ],
      bullets: [
        "A reserved elevator or loading-dock window for the building.",
        "A certificate of insurance (COI) naming the property — a good mover provides this; just send the requirements when you book.",
        "An HOA or guard-gate arrival window, and notice that a moving truck is coming.",
        "Where the truck can legally park, and how far the carry is from there to your door.",
      ],
    },
    {
      h2: "Plan around Orlando traffic and your start time",
      body: [
        "Orlando traffic affects moving day more than people expect. I-4 construction, theme-park weekend congestion, and downtown one-ways can add real time between addresses. An early-morning start (the crew arriving around 8 AM) usually beats the worst of it and leaves margin if the day runs long. A crew that works the metro full-time will route around the city's patterns rather than trusting the default map app.",
      ],
    },
    {
      h2: "Declutter before you pack — it lowers the bill",
      body: [
        "Because local moves are billed by the hour, the less you move, the less you pay. Donate, sell, or toss what you don't want before packing day — it's cheaper than paying a crew to carry it to a new closet. Central Florida has plenty of donation pickups and junk-haul options, and we can haul a few unwanted large items to the curb or dumpster while we're there.",
      ],
    },
    {
      h2: "Pack smart: label by room and keep a first-night box",
      body: [
        "Good packing is the single biggest thing you control. Two habits make unloading fast:",
      ],
      bullets: [
        "Label every box by room and a two-word contents note, so the crew puts it straight in the right room.",
        "Pack a clearly marked first-night box: phone chargers, meds, a change of clothes, basic toiletries, and a few kitchen items — so you're not opening ten boxes at 10 PM.",
      ],
    },
    {
      h2: "Mind the Florida weather",
      body: [
        "Summer heat and the June–November rainy season are real factors here. For a hot-month move, start early, keep water on hand for everyone, and protect anything heat- or humidity-sensitive (candles, electronics, vinyl). If a thunderstorm rolls through, a good crew pauses loading to keep your floors and furniture dry rather than tracking water through the new place.",
      ],
    },
    {
      h2: "Decide what the crew handles vs. what you do",
      body: [
        "You can hand over the whole move or just the heavy lifting. Common splits: full-service (we pack, load, move, and unload), labor-only if you already have a truck or POD, or load/unload help on one end. Whatever you choose, get the rate and crew size agreed up front, confirm the mover is insured, and make sure someone is reachable at both addresses on the day.",
      ],
    },
  ],
  faqs: [
    {
      q: "How far in advance should I book movers in Orlando?",
      a: "Two to three weeks is comfortable for a local move, and earlier is better if your date lands at the end or start of the month, when lease turnovers fill the calendar fastest. We can often still fit in same-week or next-day moves when there's an opening — call with your date and we'll tell you honestly what's available.",
    },
    {
      q: "What does my apartment complex or HOA need before move day?",
      a: "Most commonly a reserved elevator or loading window, a certificate of insurance (COI) naming the property, and an arrival window for the truck. We're fully insured and provide the COI ahead of time — just send us your building's requirements when you book.",
    },
    {
      q: "When is the best time to schedule a local move?",
      a: "A mid-month weekday is usually the easiest to book and the least rushed. Starting early in the morning also helps you beat Orlando traffic and leaves margin if the day runs long.",
    },
    {
      q: "Do I need to be there on move day?",
      a: "Someone should be reachable at both the pickup and drop-off to direct the crew, point out fragile items, and handle building check-in. It doesn't have to be you — many customers leave an alternate contact, which we ask for when you book.",
    },
  ],
};

export const APARTMENT_CHECKLIST: GuideData = {
  slug: "apartment-moving-checklist-orlando-renters",
  href: "/blog/apartment-moving-checklist-orlando-renters",
  metadata: {
    title: "Orlando Apartment Moving Checklist",
    description:
      "A step-by-step apartment moving checklist for Orlando renters — notice, elevator & COI rules, utilities, packing, and protecting your deposit. From Toro Movers.",
  },
  h1: "Apartment Moving Checklist for Orlando Renters",
  intro:
    "Apartment moves have their own rules — move-out notice, elevator reservations, complex insurance requirements, and a deposit on the line. This renter-focused checklist keeps an Orlando apartment move on schedule, from a crew that does walk-ups and high-rises every week.",
  datePublished: "2026-06-09",
  readMins: 5,
  sections: [
    {
      h2: "About 30 days out: give notice and read the lease",
      body: [
        "Most Orlando leases require written move-out notice — often 30 to 60 days — so check your exact terms before anything else. While you're in the lease, note the move-out conditions that affect your deposit: cleaning standards, wall-patching, and carpet expectations.",
      ],
      bullets: [
        "Submit written move-out notice and keep a copy.",
        "Confirm your lease-end date and the deposit-return timeline.",
        "Ask the office what move-in/move-out rules apply (below).",
      ],
    },
    {
      h2: "Book movers and reserve the elevator or loading zone",
      body: [
        "Apartment communities and downtown high-rises usually limit when and where a truck can load. Lock these in early, especially for end-of-month dates:",
      ],
      bullets: [
        "Book your movers and give them your floor, elevator/stairs, and parking details for an accurate hourly estimate.",
        "Reserve the building's elevator or loading-dock window if required.",
        "Confirm where the truck can park and how far the carry is to your door.",
      ],
    },
    {
      h2: "Sort the certificate of insurance (COI) early",
      body: [
        "Many Orlando complexes won't let a moving crew start without a certificate of insurance naming the property. This trips up more apartment moves than anything else. Ask the office for their exact COI requirements as soon as you book, and send them to your mover — a fully insured company provides the COI ahead of time at no drama.",
      ],
    },
    {
      h2: "Two weeks out: declutter, gather supplies, start packing",
      body: [
        "Because local moves are billed by the hour, packing well directly lowers your cost. Start with what you don't use daily.",
      ],
      bullets: [
        "Donate or sell what you don't want to carry to the next place.",
        "Get boxes, tape, and wrap — or have your movers bring supplies.",
        "Pack non-essentials first; label every box by room and contents.",
      ],
    },
    {
      h2: "Update your address and transfer utilities",
      body: [
        "Switch services so you're not paying for the old unit or arriving to no power. In the Orlando area that usually means OUC or Duke Energy for electric, plus water and internet (Spectrum/AT&T).",
      ],
      bullets: [
        "Schedule electric, water, and internet transfers for your move date.",
        "Forward your mail with USPS and update your bank, license, and subscriptions.",
        "Confirm the new complex has your move-in date and any access codes ready.",
      ],
    },
    {
      h2: "Move week: confirm everything and pack an essentials box",
      body: [
        "A day or two before, reconfirm the crew's arrival window, the elevator reservation, and parking. Then pack a clearly marked essentials box — chargers, meds, toiletries, a change of clothes — so your first night isn't a treasure hunt.",
      ],
    },
    {
      h2: "Move day: protect the unit and your deposit",
      body: [
        "Damage to the old or new unit is what costs renters their deposit. A careful crew pads door jambs, lays floor protection, and wraps furniture — and on move-out, take dated photos of the empty unit's condition before you hand back the keys.",
      ],
      bullets: [
        "Walk both units with the crew and point out anything fragile or tight.",
        "Photograph the empty old unit (and any pre-existing damage) for your records.",
        "Do the move-out cleaning your lease requires, then return keys and get written confirmation.",
      ],
    },
  ],
  faqs: [
    {
      q: "Does my Orlando apartment complex require a certificate of insurance?",
      a: "Many do — especially larger communities and downtown high-rises. They'll want a COI naming the property before the crew can start. We're fully insured and provide the certificate ahead of time; just send us your complex's requirements when you book.",
    },
    {
      q: "Do you charge extra for stairs or a no-elevator building?",
      a: "There's no separate stair fee. We bill by the hour, so a third-floor walk-up simply takes a little longer — and we tell you up front how your floor and access affect the estimate.",
    },
    {
      q: "How long does an apartment move usually take?",
      a: "Most one- and two-bedroom apartment moves are done in a few hours with a two-mover crew, depending on stairs, elevator wait, and how well everything is packed. You only pay for the time used.",
    },
    {
      q: "Can you move me the same day I get my keys?",
      a: "Often, yes — if there's an opening and your new complex has your access ready. Same-day and next-day apartment moves are common for us; call with your date and we'll tell you honestly what's available.",
    },
  ],
};

export const GUIDES: GuideData[] = [ORLANDO_MOVE_PREP, APARTMENT_CHECKLIST];
