import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { TrustBand } from "@/components/trust-band";
import { Footer } from "@/components/footer";
import { FaqSection } from "@/components/faq-section";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  BUSINESS_NAME,
  GOOGLE_RATING,
  SERVICE_BASE_LOCALITY,
} from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";
const HREF = "/windermere-movers";

const TITLE = "Windermere Movers | Local Moving Company | Toro Movers";
const DESCRIPTION =
  "Need movers in Windermere, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: HREF },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${HREF}`,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const FAQS = [
  {
    q: "How much do movers cost in Windermere, FL?",
    a: "Moving costs in Windermere depend on crew size, home size, access (gated entries, long drives, stairs, elevators, long carries), packing readiness, and how long the job takes. Toro Movers uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees — so you know the rate and minimum before move day.",
  },
  {
    q: "Do you move homes in gated Windermere communities?",
    a: "Yes. Gated and HOA communities are a regular part of our Windermere work — including areas like Isleworth and homes around the Butler Chain. Share gate rules, guest lists, and preferred arrival windows when you request an estimate so the crew is cleared and ready on schedule.",
  },
  {
    q: "Do you charge extra for stairs or elevators?",
    a: "No separate stair or elevator fee. Toro bills by the hour, so a walk-up, slow elevator, or long carry simply adds time on the clock. Furniture blankets, shrink wrap, and basic assembly/disassembly are included — no surprise material fees.",
  },
  {
    q: "Can you move me from Windermere to Orlando or Winter Garden?",
    a: "Yes. Local moves between Windermere and Orlando, Winter Garden, Horizon West, Dr. Phillips, and nearby west Orange County cities are a regular part of our week. Same upfront hourly pricing across Central Florida.",
  },
  {
    q: "Do you offer labor-only moving help in Windermere?",
    a: "Yes. If you already have a U-Haul, POD, rental truck, or storage container, Toro provides labor-only loading and unloading help by the hour — same background-checked, bilingual crew and included protection materials.",
  },
  {
    q: "How do you handle large furniture and careful residential moves?",
    a: "Windermere homes often include large pieces, multi-room layouts, and finishes that need floor and doorway protection. We plan carries and disassembly ahead of time, use blankets and shrink wrap as standard, and work deliberately through tight turns — careful handling without padded “luxury” pricing games.",
  },
  {
    q: "How far in advance should I book movers in Windermere?",
    a: "Book one to two weeks ahead when you can, especially for weekends, month-end dates, and gated communities that need advance gate clearance. Same-week scheduling is often available — call (689) 600-2720 or request an estimate online and we’ll tell you what’s open.",
  },
  {
    q: "What makes Toro Movers different from franchise moving companies?",
    a: "Toro is a family-owned Central Florida moving company — not a national call center. You get a local crew, clear hourly pricing, simple scheduling, bilingual support (Hablamos español), and no franchise-style surprise fees. The same team that quotes you shows up to move you.",
  },
];

const INCLUDED = [
  "Background-checked moving crew",
  "Truck included on full-service moves",
  "Furniture blankets, shrink wrap, dollies, and equipment",
  "Basic assembly and disassembly when needed",
  "Stairs included — no stair fee",
  "No surprise fuel surcharge",
  "No surprise material fee",
  "Bilingual English / Spanish crew (Hablamos español)",
  "Same-week scheduling when available",
  "Upfront hourly pricing before move day",
];

const NEARBY = [
  { name: "Isleworth", note: "Gated community access and careful residential moves" },
  { name: "Butler Chain area", note: "Lakefront and neighborhood homes — plan for drives and access" },
  { name: "Keene's Pointe", note: "Gated entries and larger-home layouts" },
  { name: "Butler Bay", note: "Local Windermere residential hops" },
  { name: "Windermere Downs", note: "Neighborhood homes and short in-town moves" },
  { name: "Horizon West", note: "Growth corridor east and south of Windermere" },
  { name: "Winter Garden", note: "Neighbor city — short west Orange hops" },
  { name: "Dr. Phillips", note: "Nearby residential and local metro moves" },
  { name: "Tildens Grove", note: "Local homes and community access" },
  { name: "Orlando", note: "Metro moves toward downtown and I-4 corridors" },
  { name: "Lake Butler area", note: "Lakefront-adjacent residential access" },
];

const AREA_SERVED = [
  { "@type": "City", name: "Windermere, FL" },
  { "@type": "AdministrativeArea", name: "Orange County, FL" },
  { "@type": "City", name: "Winter Garden, FL" },
  { "@type": "City", name: "Orlando, FL" },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Service-area page — Orlando base address only (no invented Windermere office).
      "@type": ["MovingCompany", "LocalBusiness"],
      "@id": `${SITE_URL}${HREF}#business`,
      name: `${BUSINESS_NAME} — Windermere`,
      url: `${SITE_URL}${HREF}`,
      telephone: PHONE_DISPLAY,
      description: DESCRIPTION,
      areaServed: [...AREA_SERVED],
      address: {
        "@type": "PostalAddress",
        addressLocality: SERVICE_BASE_LOCALITY,
        addressRegion: "FL",
        addressCountry: "US",
      },
      parentOrganization: {
        "@type": "MovingCompany",
        name: BUSINESS_NAME,
        "@id": `${SITE_URL}/#movingcompany`,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 28.4955,
        longitude: -81.5348,
      },
      knowsLanguage: ["en", "es"],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      name: "Windermere moving services",
      serviceType: "Local moving",
      provider: { "@id": `${SITE_URL}${HREF}#business` },
      areaServed: [...AREA_SERVED],
      url: `${SITE_URL}${HREF}`,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Windermere Movers",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function WindermereMoversPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main>
        {/* Hero */}
        <section className="city-hero">
          <div className="city-hero-inner">
            <p className="city-kicker">movers windermere fl · orange county</p>
            <h1 className="city-h1">Windermere Movers</h1>
            <p className="city-subline">
              Local, residential, and full-service moving help in Windermere, FL,
              with upfront hourly pricing and no hidden fees.
            </p>
            <div className="city-hero-cta">
              <a
                href="/get-my-price"
                data-open-quote
                data-source="windermere-hero"
                className="btn btn-primary"
              >
                Get my free estimate
                <span className="arrow" aria-hidden />
              </a>
              <a href={PHONE_TEL} className="btn btn-outline">
                Call {PHONE_DISPLAY}
              </a>
            </div>
            <div className="city-hero-meta">
              <span className="city-stars" aria-hidden>
                ★★★★★
              </span>
              <span>
                {GOOGLE_RATING} on Google · Family-owned Central FL ·
                Background-checked · Bilingual · Same-week · Upfront hourly · No
                hidden fees
              </span>
            </div>
          </div>
        </section>

        <TrustBand />

        {/* Intro */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">local movers windermere</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Windermere movers with real Central Florida experience
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Toro Movers is a family-owned Central Florida moving company —{" "}
                {GOOGLE_RATING}-star rated on Google, background-checked, and
                bilingual (Hablamos español). We help with moves in and around
                Windermere every week: gated communities, homes near the Butler
                Chain, neighborhood moves toward Horizon West, and west Orange
                hops to{" "}
                <Link href="/winter-garden-movers">Winter Garden movers</Link>,{" "}
                Dr. Phillips, and{" "}
                <Link href="/orlando-movers">Orlando movers</Link>. We are part of
                the same local network as our{" "}
                <Link href="/central-florida-movers">Central Florida movers</Link>{" "}
                service area — one crew, one hourly model across the metro.
              </p>
              <p className="guide-p">
                We are a service-area mover based in the Orlando metro — not a
                national franchise with a fake storefront on every map pin. When
                you book Toro, you get clear hourly pricing, a crew that plans for
                gate access and larger residential layouts, and a simple path to{" "}
                <Link href="/get-my-price">get my free estimate</Link> or call{" "}
                <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>.
              </p>
              <p className="guide-p">
                Same-week scheduling is often available. Furniture blankets, shrink
                wrap, dollies, equipment, and basic assembly/disassembly are
                included. No fuel surcharges. No stair fees. No material fees. The
                clock starts when we work — and stops when the job is done.
              </p>
            </div>

            <div className="tier" style={{ marginTop: 28 }}>
              <h3 className="tier-title" style={{ marginBottom: 12 }}>
                Best for Windermere moves like:
              </h3>
              <ul className="tier-bullets">
                <li>
                  Residential moves in gated communities and larger homes
                </li>
                <li>
                  Local moves between Windermere, Winter Garden, and Orlando
                </li>
                <li>
                  Loading or unloading a U-Haul, POD, or storage unit
                </li>
                <li>
                  Careful handling of large furniture and multi-room layouts
                </li>
                <li>Same-week moves when availability allows</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Built for local moves */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">what we move</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Windermere movers built for local residential moves
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Most Windermere jobs are local: one community to another,
                Windermere to Winter Garden or Orlando, or a short west Orange
                County hop. We cover single-family homes, townhomes, condo moves
                where they apply, storage unit loads, and full local moves between
                Windermere and the wider metro.
              </p>
              <p className="guide-p">
                Homes here often mean larger rooms, heavier pieces, and access that
                takes planning — guard gates, long private drives, HOA rules, and
                finishes that need floor and doorway protection. We plan truck
                placement and carries ahead of time, pad high-traffic paths, and
                handle basic bed and table disassembly when stairs or tight turns
                demand it. If you want the full residential process spelled out,
                start with our{" "}
                <Link href="/residential-movers">residential movers</Link> page,
                then book the same crew for Windermere.
              </p>
              <p className="guide-p">
                Storage moves and labor-only days are common too: load a POD in a
                driveway, empty a unit before closing, or unload a U-Haul at a new
                address while you keep the truck contract. Local movers Windermere
                customers hire us for flexibility — full-service when you want the
                truck, labor-only when you already have one.
              </p>
              <p className="guide-p">
                We also handle partial moves: furniture only, a garage clean-out
                before a sale, or a second trip when a community only allows a short
                loading window. Tell us what has to go on day one versus what can
                wait. Upfront hourly pricing means you pay for the work you book —
                not a package that forces you into a bigger truck than you need.
              </p>
            </div>
          </div>
        </section>

        {/* Timing access parking */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">access &amp; logistics</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Moving in Windermere comes down to timing, access, and parking
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Windermere sits in west Orange County near Winter Garden, Horizon
                West, and Dr. Phillips. Traffic windows matter on Apopka-Vineland,
                Conroy-Windermere, and routes toward the Turnpike and I-4. Morning
                starts usually beat afternoon congestion, and weekend dates fill
                first. Tell us your preferred date early so we can protect a
                realistic arrival window — not a vague “sometime tomorrow.”
              </p>
              <p className="guide-p">
                Gated communities add another layer: guest lists, guard-gate
                check-ins, HOA move rules, and long carries down private drives.
                A good estimate needs those details. When you request a quote,
                share community name, gate instructions, driveway depth, and any
                HOA paperwork so the hourly plan matches the real day.
              </p>
              <p className="guide-p">
                Parking access on cul-de-sacs and lake-adjacent streets can mean a
                longer carry. We price that in time, not a mystery “access fee.”
                That is the opposite of the{" "}
                <Link href="/blog/hidden-moving-fees-orlando">
                  hidden moving fees
                </Link>{" "}
                some customers run into with padded flat quotes. Upfront hourly
                pricing keeps the math honest when access is tight.
              </p>
              <p className="guide-p">
                Rain delays and Florida heat are real on outdoor carries from the
                truck to a multi-story home. We bring blankets and wrap as
                standard so wood and fabric are protected while we work. If your
                community requires a certificate of insurance or a named arrival
                window, send those requirements when you request your estimate so
                we are not sorting paperwork at the gate.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">services</div>
            <h2 className="block-h2" style={{ marginBottom: 28 }}>
              Windermere moving services
            </h2>

            <h3 className="guide-h3">Local moving</h3>
            <p className="guide-p">
              Point A to point B inside west Orange County or into the wider
              Orlando metro — including Windermere to Winter Garden, Horizon West,
              Dr. Phillips, or Orlando. Same crew, same hourly structure, same
              no-surprise fees. Ideal for homes, townhomes, and mixed local
              itineraries.
            </p>

            <h3 className="guide-h3">Residential moving</h3>
            <p className="guide-p">
              Larger homes, gated access, and careful furniture handling are
              everyday work for our Windermere movers. We coordinate gate clearance
              when you give us the rules, protect floors and doorways on tight
              turns, and keep the load moving so the day stays on schedule. See
              also{" "}
              <Link href="/residential-movers">residential movers</Link>.
            </p>

            <h3 className="guide-h3">Labor-only moving</h3>
            <p className="guide-p">
              Already rented a U-Haul, POD, or storage container? Hire the muscle
              only. We load tight, unload and place, or do both ends — by the hour,
              with blankets and wrap included. No truck charge when you supply the
              vehicle. Full details on{" "}
              <Link href="/labor-only-moving">labor-only moving</Link>.
            </p>

            <h3 className="guide-h3">Full-service moving</h3>
            <p className="guide-p">
              Want the truck and crew together? Full-service covers loading,
              transport, unloading, and careful placement with our vehicle in the
              mix. Best when you do not want to drive a rental or juggle two
              vendors. Explore{" "}
              <Link href="/full-service-moving">full-service movers in Orlando</Link>
              .
            </p>

            <h3 className="guide-h3">Packing help</h3>
            <p className="guide-p">
              Need hands on boxes as well as furniture? Ask for packing time on
              your estimate — or review our{" "}
              <Link href="/packing-services">packing services</Link> options.
              Many customers pack clothes and kitchen non-breakables themselves and
              leave furniture, mattresses, and heavy pieces to the crew — which
              keeps hours (and cost) under control. Residential packing details
              also live on our{" "}
              <Link href="/residential-movers">residential movers</Link> page.
            </p>

            <h3 className="guide-h3">Commercial moving</h3>
            <p className="guide-p">
              Small offices, retail turnovers, and suite moves near Dr. Phillips
              and west Orlando corridors can be scheduled around your hours. Tell
              us dock access, elevator needs, and after-hours preferences.{" "}
              <Link href="/commercial-movers">Commercial movers</Link> details
              apply the same hourly model.
            </p>

            <div className="city-hero-cta" style={{ marginTop: 28 }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="windermere-services"
                className="btn btn-primary"
              >
                Get my free estimate
                <span className="arrow" aria-hidden />
              </a>
              <a href={PHONE_TEL} className="btn btn-outline">
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        {/* Cost */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">pricing</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              How much do movers cost in Windermere, FL?
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Windermere moving cost is almost always an hourly equation: crew
                size × hours on the job (after the minimum), plus whether a truck
                is included. A smaller home with easy driveway access finishes
                faster than a multi-bedroom house with a long gate-to-door carry
                and a packed garage. Stairs, elevators, and long carries add time,
                not a separate line-item fee.
              </p>
              <p className="guide-p">
                Preparation changes the bill more than people expect. Fully packed
                boxes, clear pathways, and cleared gate lists cut clock time.
                Unfinished packing when the crew arrives burns hours you pay for.
                For a deeper look at how{" "}
                <Link href="/blog/what-youre-paying-for-orlando-movers">
                  Orlando moving rates
                </Link>{" "}
                work — what is in the hourly rate vs what shady companies hide —
                read our rates guide and{" "}
                <Link href="/blog/hidden-moving-fees-orlando">
                  hidden moving fees
                </Link>{" "}
                checklist.
              </p>
              <p className="guide-p">
                Toro&rsquo;s model is simple: upfront hourly pricing, minimum hours
                disclosed, materials and basic assembly/disassembly included, no
                fuel surcharge, no stair fee, no material fee.
              </p>
              <p className="guide-p">
                <strong>
                  Typical factors that affect Windermere moving time:
                </strong>
              </p>
              <ul className="guide-list">
                <li>
                  A home with a short driveway may take less time than a gated
                  community with a long private drive
                </li>
                <li>
                  Gate clearance and reserved parking can reduce waiting and
                  long-carry time
                </li>
                <li>
                  Packed boxes and clear walkways can lower the final bill
                </li>
                <li>
                  Larger homes may be faster with three movers instead of two
                </li>
              </ul>
              <p className="guide-p">
                Crew size scales with the job: two movers for many smaller homes
                and lighter inventories, three or more when a larger house or heavy
                furniture load would otherwise drag. Adding a mover often lowers
                total hours enough to offset the higher hourly rate. We recommend a
                size when you share inventory and access — you are not guessing
                alone.
              </p>
              <p className="guide-p">
                Want a real number for your move? Send your addresses, home size,
                gate or driveway details, stairs or elevator notes, and move date.
                Toro will{" "}
                <Link href="/get-my-price">get the hourly rate</Link> and minimum
                to you before moving day — or call{" "}
                <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>.
              </p>
            </div>
          </div>
        </section>

        {/* Included */}
        <section className="block">
          <div className="block-inner city-two-col city-two-col--mb">
            <div>
              <div className="block-eyebrow">every move</div>
              <h2 className="block-h2">
                What is included with your Windermere move?
              </h2>
            </div>
            <div className="tier" style={{ margin: 0 }}>
              <ul className="tier-bullets">
                {INCLUDED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="svc-point-body" style={{ marginTop: 16 }}>
                Full-service adds our truck. Labor-only keeps your U-Haul, POD, or
                rental — same care either way.
              </p>
            </div>
          </div>
        </section>

        {/* Local vs franchise */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">why local</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Local Windermere movers without the franchise runaround
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                National brands often sound local until you book: call centers,
                subcontracted crews you have never spoken to, and quotes that
                change once the truck is half loaded. Toro is the opposite
                experience on purpose. We are family-owned in Central Florida. You
                talk to people who schedule real local jobs. The crew that quotes
                the day is the crew that shows up.
              </p>
              <p className="guide-p">
                Clear pricing matters more than a logo on a trailer. Upfront hourly
                rates, no fuel games, no stair “surcharges,” and materials already
                in the rate mean you can compare apples to apples. Background-checked
                movers and a bilingual team (Hablamos español) are standard — not
                upsells. Same-week scheduling exists because we work this metro full
                time, not because a franchise sold a lead to whoever is free.
              </p>
              <p className="guide-p">
                If you want{" "}
                <Link href="/orlando-movers">Orlando movers</Link> who also know
                Windermere&rsquo;s gated access and west Orange traffic patterns,
                you are in the right place.{" "}
                <Link href="/get-my-price">Get my free estimate</Link> and lock a
                date without the national phone tree.
              </p>
            </div>
          </div>
        </section>

        {/* Nearby areas */}
        <section className="block city-hoods-section">
          <div className="block-inner">
            <div className="city-two-col city-two-col--mb">
              <div>
                <div className="block-eyebrow">service area</div>
                <h2 className="block-h2">
                  Moving in Windermere and nearby areas
                </h2>
              </div>
              <p className="city-lead">
                We serve Windermere as a service area from our Central Florida
                operation — no invented storefront address. These are
                neighborhoods and neighboring cities our crews run regularly.
              </p>
            </div>
            <div className="city-hoods">
              {NEARBY.map((n) => (
                <div key={n.name} className="city-hood">
                  <span>
                    <strong>{n.name}</strong>
                    {" — "}
                    {n.note}
                  </span>
                </div>
              ))}
            </div>
            <p className="guide-p" style={{ marginTop: 24 }}>
              <Link href="/central-florida-movers">
                See all Central Florida moving service areas
              </Link>
            </p>
            <p className="guide-p" style={{ marginTop: 12 }}>
              Nearby city pages:{" "}
              <Link href="/winter-garden-movers">Winter Garden movers</Link>
              {" · "}
              <Link href="/orlando-movers">Orlando movers</Link>
              {" · "}
              <Link href="/central-florida-movers">Central Florida movers</Link>
            </p>
          </div>
        </section>

        <FaqSection
          items={FAQS}
          heading="Windermere movers — common questions."
        />

        {/* Local closing CTA only — no generic sitewide ClosingCta (avoids double “Ready when you are”) */}
        <section className="block">
          <div className="block-inner" style={{ textAlign: "center" }}>
            <h2 className="block-h2">Ready to move in Windermere?</h2>
            <p className="block-sub">
              Get your free estimate in about 60 seconds. Same-week dates may be
              available.
            </p>
            <div className="city-hero-cta" style={{ justifyContent: "center" }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="windermere-bottom"
                className="btn btn-primary"
              >
                Get my free estimate
                <span className="arrow" aria-hidden />
              </a>
              <a href={PHONE_TEL} className="btn btn-outline">
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
