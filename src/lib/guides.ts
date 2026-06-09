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

export const GUIDES: GuideData[] = [ORLANDO_MOVE_PREP];
