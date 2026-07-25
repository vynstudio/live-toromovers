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
const HREF = "/lake-mary-movers";

const TITLE = "Lake Mary Movers | Local Moving Company | Toro Movers";
const DESCRIPTION =
  "Need movers in Lake Mary, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.";

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
    q: "How much do movers cost in Lake Mary, FL?",
    a: "Moving costs in Lake Mary depend on crew size, home size, access (stairs, long carries, gated entry), packing readiness, and how long the job takes. Toro Movers uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees — so you know the rate and minimum before move day.",
  },
  {
    q: "Do you move homes and townhomes in Lake Mary?",
    a: "Yes. Single-family homes and townhomes are a core job type across Lake Mary, Heathrow, Markham Woods, and nearby Seminole County streets. We plan for driveways, garage loads, and HOA or gated arrival windows when you share the rules ahead of time.",
  },
  {
    q: "Do you charge extra for stairs or elevators?",
    a: "No separate stair or elevator fee. Toro bills by the hour, so a walk-up, tight stairwell, or slow elevator simply adds time on the clock. Furniture blankets, shrink wrap, and basic assembly/disassembly are included — no surprise material fees.",
  },
  {
    q: "Can you move me from Lake Mary to Orlando?",
    a: "Yes. Local moves between Lake Mary and Orlando (and nearby cities like Sanford, Altamonte Springs, Longwood, and Winter Park) are a regular part of our week. Same upfront hourly pricing across Central Florida — including I-4 corridor hops.",
  },
  {
    q: "Do you offer labor-only moving help in Lake Mary?",
    a: "Yes. If you already have a U-Haul, POD, rental truck, or storage container, Toro provides labor-only loading and unloading help by the hour — same background-checked, bilingual crew and included protection materials.",
  },
  {
    q: "How far in advance should I book movers in Lake Mary?",
    a: "Book one to two weeks ahead when you can, especially for weekends, end-of-month dates, and HOA or gated communities that need advance notice. Same-week scheduling is often available — call (689) 600-2720 or request an estimate online and we’ll tell you what’s open.",
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
  { name: "Heathrow", note: "Gated communities and planned neighborhoods" },
  { name: "Markham Woods", note: "Residential streets and larger homes" },
  { name: "Timacuan", note: "HOA homes and local relocations" },
  { name: "Lake Mary Boulevard", note: "Corridors, townhomes, and suites" },
  { name: "Greenwood Lakes", note: "Neighborhood homes and short hops" },
  { name: "Sanford", note: "Neighbor city north on the corridor" },
  { name: "Longwood", note: "South corridor homes and offices" },
  { name: "Altamonte Springs", note: "Seminole County local moves south" },
  { name: "Orlando", note: "Metro moves on I-4 and 417" },
  { name: "Office parks", note: "Suite and small commercial turnovers" },
  { name: "Townhome communities", note: "Shared drives and tight parking" },
];

const AREA_SERVED = [
  { "@type": "City", name: "Lake Mary, FL" },
  { "@type": "AdministrativeArea", name: "Seminole County, FL" },
  { "@type": "City", name: "Sanford, FL" },
  { "@type": "City", name: "Longwood, FL" },
  { "@type": "City", name: "Altamonte Springs, FL" },
  { "@type": "City", name: "Heathrow, FL" },
  { "@type": "City", name: "Orlando, FL" },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Service-area page — Orlando base address only (no invented Lake Mary office).
      "@type": ["MovingCompany", "LocalBusiness"],
      "@id": `${SITE_URL}${HREF}#business`,
      name: `${BUSINESS_NAME} — Lake Mary`,
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
        latitude: 28.7589,
        longitude: -81.3178,
      },
      knowsLanguage: ["en", "es"],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      name: "Lake Mary moving services",
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
          name: "Lake Mary Movers",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function LakeMaryMoversPage() {
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
            <p className="city-kicker">movers lake mary fl · seminole county</p>
            <h1 className="city-h1">Lake Mary Movers</h1>
            <p className="city-subline">
              Professional household, office, and planned relocation moving help
              in Lake Mary, FL, with upfront hourly pricing and no hidden fees.
            </p>
            <div className="city-hero-cta">
              <a
                href="/get-my-price"
                data-open-quote
                data-source="lake-mary-hero"
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
            <div className="block-eyebrow">local movers lake mary</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Lake Mary movers with real Central Florida experience
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Toro Movers is a family-owned Central Florida moving company —{" "}
                {GOOGLE_RATING}-star rated on Google, background-checked, and
                bilingual (Hablamos español). We help with moves in and around Lake
                Mary every week: single-family homes near Markham Woods, townhomes
                off Lake Mary Boulevard, Heathrow-area relocations, office parks
                along the I-4 corridor, and local hops toward{" "}
                <Link href="/orlando-movers">Orlando movers</Link>,{" "}
                <Link href="/sanford-movers">Sanford</Link>,{" "}
                <Link href="/altamonte-springs-movers">Altamonte Springs</Link>,
                Longwood, and the wider metro. We are part of the same local
                network as our{" "}
                <Link href="/central-florida-movers">Central Florida movers</Link>{" "}
                service area — one crew, one hourly model across the metro.
              </p>
              <p className="guide-p">
                We are a service-area mover based in the Orlando metro — not a
                national franchise with a fake storefront on every map pin. When
                you book Toro, you get clear hourly pricing, a crew prepared for
                HOA and gated arrival windows when you share the rules, and a
                simple path to{" "}
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
                Best for Lake Mary moves like:
              </h3>
              <ul className="tier-bullets">
                <li>
                  Household moves in Heathrow, Markham Woods, and nearby HOAs
                </li>
                <li>
                  Local moves between Lake Mary and Orlando on I-4
                </li>
                <li>
                  Office park and small suite relocations
                </li>
                <li>
                  Single-family home and townhome moves
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
              Lake Mary movers built for household and planned relocations
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Most Lake Mary jobs are local and intentional: a family home to a
                new address in Seminole County, a townhome swap, Orlando to Lake
                Mary for a job change, or a planned office suite move near the
                business parks. We cover single-family homes, townhomes, apartments
                and condos where they sit, storage unit loads, and full local moves
                between Lake Mary and the wider metro.
              </p>
              <p className="guide-p">
                Homes and townhomes dominate a lot of Lake Mary work — garages full
                of tools, multi-room furniture sets, and driveways that need a clear
                truck path. We plan for long carries when street parking is the only
                option and protect floors and corners on tight turns. Office and
                suite moves get the same discipline: label what moves first, protect
                desks and tech, and work inside the access hours you give us. See{" "}
                <Link href="/commercial-movers">commercial movers</Link> for
                business-focused detail, then book the same local crew for Lake
                Mary.
              </p>
              <p className="guide-p">
                Storage moves and labor-only days are common too: load a POD in a
                driveway, empty a unit before closing, or unload a U-Haul at a new
                address while you keep the truck contract. Local movers Lake Mary
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
              Moving in Lake Mary comes down to timing, access, and parking
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Lake Mary sits on the I-4 corridor north of Orlando, with Lake Mary
                Boulevard and nearby connectors feeding homes, townhomes, and office
                parks. Traffic windows matter. Morning starts usually beat afternoon
                congestion, and weekend end-of-month days fill first because lease
                and closing calendars stack up. Tell us your preferred date early so
                we can protect a realistic arrival window — not a vague “sometime
                tomorrow.”
              </p>
              <p className="guide-p">
                Many communities around Heathrow, Markham Woods, Timacuan, and
                similar neighborhoods have HOA or gated rules: advance notice,
                specific truck arrival windows, or check-in at a gate. We do not
                invent special “HOA packages” — we simply need the rules you are
                given so we can plan the day. Share gate codes or visitor
                instructions, preferred arrival times, and any paperwork your
                community asks for when you request a quote.
              </p>
              <p className="guide-p">
                Parking access on townhome streets, cul-de-sacs, and office-park lots
                can mean a longer carry. We price that in time, not a mystery
                “access fee.” That is the opposite of the{" "}
                <Link href="/blog/hidden-moving-fees-orlando">
                  hidden moving fees
                </Link>{" "}
                some customers run into with padded flat quotes. Upfront hourly
                pricing keeps the math honest when access is tight.
              </p>
              <p className="guide-p">
                Rain delays and Florida heat are real on outdoor carries from the
                truck to a second-story townhome or across a long driveway. We bring
                blankets and wrap as standard so wood and fabric are protected while
                we work. If your building or community requires a certificate of
                insurance or a named arrival window, send those requirements when
                you request your estimate so we are not sorting paperwork on the
                curb.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">services</div>
            <h2 className="block-h2" style={{ marginBottom: 28 }}>
              Lake Mary moving services
            </h2>

            <h3 className="guide-h3">Local moving</h3>
            <p className="guide-p">
              Point A to point B inside Seminole County or into Orange County —
              including Lake Mary to Orlando on I-4. Same crew, same hourly
              structure, same no-surprise fees. Ideal for homes, townhomes, and
              mixed local itineraries across the north corridor.
            </p>

            <h3 className="guide-h3">Household &amp; residential moving</h3>
            <p className="guide-p">
              Professional household moves are the backbone of our Lake Mary work:
              rooms packed or ready, furniture protected, and careful placement at
              the new address. Stairs, long carries, and multi-stop days are
              handled by the hour — no stair surcharge. Apartments and condos get
              the same care when elevators or breezeways are in the mix.
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
              your estimate. Many customers pack clothes and kitchen non-breakables
              themselves and leave furniture, mattresses, and heavy pieces to the
              crew — which keeps hours (and cost) under control.
            </p>

            <h3 className="guide-h3">Office &amp; commercial moving</h3>
            <p className="guide-p">
              Small offices, suite turnovers, and planned business relocations near
              Lake Mary office parks can be scheduled around your hours. Tell us
              dock or elevator access, after-hours preferences, and what must stay
              live until the last minute.{" "}
              <Link href="/commercial-movers">Commercial movers</Link> details
              apply the same hourly model.
            </p>

            <div className="city-hero-cta" style={{ marginTop: 28 }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="lake-mary-services"
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
              How much do movers cost in Lake Mary, FL?
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Lake Mary moving cost is almost always an hourly equation: crew size
                × hours on the job (after the minimum), plus whether a truck is
                included. A one-bedroom townhome with a short driveway finishes
                faster than a four-bedroom house with a packed garage and a long
                carry from street parking. Stairs and tight access add time, not a
                separate line-item fee.
              </p>
              <p className="guide-p">
                Preparation changes the bill more than people expect. Fully packed
                boxes, clear pathways, and confirmed gate or HOA windows cut clock
                time. Unfinished packing when the crew arrives burns hours you pay
                for. For a deeper look at how{" "}
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
                  Typical factors that affect Lake Mary moving time:
                </strong>
              </p>
              <ul className="guide-list">
                <li>
                  A townhome with driveway access may take less time than a
                  gated community with a long carry from the street
                </li>
                <li>
                  Confirmed HOA or gate windows can reduce idle waiting time
                </li>
                <li>
                  Packed boxes and clear walkways can lower the final bill
                </li>
                <li>
                  Larger homes may be faster with three movers instead of two
                </li>
              </ul>
              <p className="guide-p">
                Crew size scales with the job: two movers for many studios and
                one-bedrooms, three or more when a house or heavy furniture load
                would otherwise drag. Adding a mover often lowers total hours
                enough to offset the higher hourly rate. We recommend a size when
                you share inventory and access — you are not guessing alone.
              </p>
              <p className="guide-p">
                Want a real number for your move? Send your addresses, home size,
                stairs or gate details, and move date. Toro will{" "}
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
                What is included with your Lake Mary move?
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
              Local Lake Mary movers without the franchise runaround
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
                Lake Mary&rsquo;s I-4 corridor, office parks, and community access
                patterns, you are in the right place.{" "}
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
                  Moving in Lake Mary and nearby areas
                </h2>
              </div>
              <p className="city-lead">
                We serve Lake Mary as a service area from our Central Florida
                operation — no invented storefront address. These are neighborhoods
                and neighboring cities our crews run regularly.
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
              <Link href="/sanford-movers">Sanford movers</Link>
              {" · "}
              <Link href="/altamonte-springs-movers">Altamonte Springs movers</Link>
              {" · "}
              <Link href="/orlando-movers">Orlando movers</Link>
              {" · "}
              <Link href="/central-florida-movers">Central Florida movers</Link>
            </p>
          </div>
        </section>

        <FaqSection
          items={FAQS}
          heading="Lake Mary movers — common questions."
        />

        {/* Local closing CTA only — no generic sitewide ClosingCta (avoids double “Ready when you are”) */}
        <section className="block">
          <div className="block-inner" style={{ textAlign: "center" }}>
            <h2 className="block-h2">Ready to move in Lake Mary?</h2>
            <p className="block-sub">
              Get your free estimate in about 60 seconds. Same-week dates may be
              available.
            </p>
            <div className="city-hero-cta" style={{ justifyContent: "center" }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="lake-mary-bottom"
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
