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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.com";
const HREF = "/davenport-movers";

const TITLE = "Davenport Movers | Local Moving Company | Toro Movers";
const DESCRIPTION =
  "Need movers in Davenport, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.";

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
    images: [{ url: "https://toromovers.com/og/default.jpg", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const FAQS = [
  {
    q: "How much do movers cost in Davenport, FL?",
    a: "Moving costs in Davenport depend on crew size, home size, access (HOA gates, long driveway carries, stairs), packing readiness, and how long the job takes. Toro Movers uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees — so you know the rate and minimum before move day.",
  },
  {
    q: "Do you serve ChampionsGate, Reunion, and Four Corners?",
    a: "Yes. ChampionsGate, Reunion, Providence, Solterra, Ridgewood Lakes, and the wider Four Corners area are core Davenport service areas. We coordinate guard-gate check-ins and HOA arrival windows so move-in day is not held up at the gate.",
  },
  {
    q: "Do you charge extra for stairs or elevators?",
    a: "No separate stair or elevator fee. Toro bills by the hour, so a walk-up or slow elevator simply adds time on the clock. Furniture blankets, shrink wrap, and basic assembly/disassembly are included — no surprise material fees.",
  },
  {
    q: "Can you move me from Orlando or Kissimmee to Davenport?",
    a: "Yes. Families relocating from Orlando or Kissimmee into Davenport’s newer neighborhoods are a regular part of our week. Same upfront hourly pricing across Central Florida — we quote drive time honestly, with no per-mile fee or fuel surcharge.",
  },
  {
    q: "Do you offer labor-only moving help in Davenport?",
    a: "Yes. If you already have a U-Haul, POD, rental truck, or storage container, Toro provides labor-only loading and unloading help by the hour — same background-checked, bilingual crew and included protection materials.",
  },
  {
    q: "How far in advance should I book movers in Davenport?",
    a: "Book one to two weeks ahead when you can, especially for weekends, builder possession days, HOA gate windows, and end-of-month rental turnovers. Same-week scheduling is often available — call (689) 600-2720 or request an estimate online and we’ll tell you what’s open.",
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
  { name: "ChampionsGate", note: "Gated communities, new builds, HOA windows" },
  { name: "Reunion", note: "Resort-style homes and gate access" },
  { name: "Providence", note: "Family homes and growing subdivisions" },
  { name: "Ridgewood Lakes", note: "Residential lakeside neighborhoods" },
  { name: "Solterra Resort", note: "Short-term rentals and fast turnovers" },
  { name: "Four Corners", note: "Polk / Osceola / Orange / Lake crossroads" },
  { name: "Bella Trae", note: "Townhomes and community access rules" },
  { name: "Loma del Sol", note: "Local homes and short hops" },
  { name: "Kissimmee", note: "East corridor family and apartment moves" },
  { name: "Orlando", note: "Metro moves on I-4 and US-27" },
  { name: "Winter Haven", note: "Polk County hops south and east" },
];

const AREA_SERVED = [
  { "@type": "City", name: "Davenport, FL" },
  { "@type": "AdministrativeArea", name: "Polk County, FL" },
  { "@type": "City", name: "Kissimmee, FL" },
  { "@type": "City", name: "Orlando, FL" },
  { "@type": "City", name: "Lakeland, FL" },
  { "@type": "City", name: "Winter Haven, FL" },
  { "@type": "Place", name: "ChampionsGate, FL" },
  { "@type": "Place", name: "Four Corners, FL" },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Service-area page — Orlando base address only (no invented Davenport office).
      "@type": ["MovingCompany", "LocalBusiness"],
      "@id": `${SITE_URL}${HREF}#business`,
      name: `${BUSINESS_NAME} — Davenport`,
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
        latitude: 28.1614,
        longitude: -81.6015,
      },
      knowsLanguage: ["en", "es"],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      name: "Davenport moving services",
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
          name: "Davenport Movers",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function DavenportMoversPage() {
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
            <p className="city-kicker">movers davenport fl · polk county</p>
            <h1 className="city-h1">Davenport Movers</h1>
            <p className="city-subline">
              Local, apartment, and full-service moving help in Davenport, FL,
              with upfront hourly pricing and no hidden fees.
            </p>
            <div className="city-hero-cta">
              <a
                href="/get-my-price"
                data-open-quote
                data-source="davenport-hero"
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
            <div className="block-eyebrow">local movers davenport</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Davenport movers with real Central Florida experience
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Toro Movers is a family-owned Central Florida moving company —{" "}
                {GOOGLE_RATING}-star rated on Google, background-checked, and
                bilingual (Hablamos español). We help with moves in and around
                Davenport every week: new-construction homes in ChampionsGate and
                Providence, rentals near Four Corners, gated communities around
                Reunion, and families relocating from{" "}
                <Link href="/orlando-movers">Orlando</Link> or{" "}
                <Link href="/kissimmee-movers">Kissimmee</Link>. We also run Polk
                County hops toward{" "}
                <Link href="/lakeland-movers">Lakeland</Link> and{" "}
                <Link href="/winter-haven-movers">Winter Haven</Link>. We are part
                of the same local network as our{" "}
                <Link href="/central-florida-movers">Central Florida movers</Link>{" "}
                service area — one crew, one hourly model across the metro.
              </p>
              <p className="guide-p">
                We are a service-area mover based in the Orlando metro — not a
                national franchise with a fake storefront on every map pin. When
                you book Toro, you get clear hourly pricing, a crew that shows up
                prepared for HOA gates and long driveway carries, and a simple
                path to{" "}
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
                Best for Davenport moves like:
              </h3>
              <ul className="tier-bullets">
                <li>
                  New-home move-ins in ChampionsGate, Providence, or Reunion
                </li>
                <li>
                  Families relocating from Orlando or Kissimmee into Davenport
                </li>
                <li>
                  Apartment and rental moves around Four Corners
                </li>
                <li>
                  Loading or unloading a U-Haul, POD, or storage unit
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
              Davenport movers built for growth-area moves
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Davenport is a fast-growing corridor of new homes, rental
                properties, and families choosing more space west of Kissimmee.
                Most jobs here are local: a first-day move into a brand-new
                build, a townhome or single-family hop inside Polk County, or a
                full local move from Orlando or Kissimmee into a gated community.
                We cover apartments, condos, townhomes, single-family homes,
                storage unit loads, and furnished rental turnovers.
              </p>
              <p className="guide-p">
                New construction and HOA communities dominate ChampionsGate,
                Providence, and Reunion — so we plan for builder possession
                timing, guard-gate check-ins, and community rules about truck
                size and parking. Home moves still get the same protection:
                blankets, careful carries, and basic bed and table disassembly
                when stairs or narrow hallways demand it. If you&rsquo;re comparing
                options, start with our{" "}
                <Link href="/apartment-movers-orlando-fl">
                  apartment movers in Orlando
                </Link>{" "}
                page for complex-specific detail, then book the same crew for
                Davenport.
              </p>
              <p className="guide-p">
                Storage moves and labor-only days are common too: load a POD in a
                driveway, empty a unit before a lease end, or unload a U-Haul at a
                new address while you keep the truck contract. Local movers
                Davenport customers hire us for flexibility — full-service when
                you want the truck, labor-only when you already have one.
              </p>
              <p className="guide-p">
                We also handle partial moves: furniture only, a garage clean-out
                before a sale, or a second trip when an HOA only allows a short
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
              Moving in Davenport comes down to timing, access, and parking
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Davenport sits near the I-4 and US-27 corridors, with traffic that
                spikes when park-area volume and weekend travel stack up. That is
                logistics, not sightseeing: morning starts usually beat afternoon
                congestion on the routes between Davenport, Kissimmee, and
                Orlando. Weekend end-of-month days fill first because lease
                turnovers and builder closings stack up. Tell us your preferred
                date early so we can protect a realistic arrival window — not a
                vague &ldquo;sometime tomorrow.&rdquo;
              </p>
              <p className="guide-p">
                Gated communities add another layer: guest-list names, gate codes,
                truck height limits, and HOA windows that only allow loading for a
                short stretch of the day. Long driveway carries and unfinished
                landscaping at new builds can slow the path from curb to front
                door. A good estimate needs those details. When you request a
                quote, share gate rules, driveway length, stairs vs elevator, and
                any community paperwork so the hourly plan matches the real day.
              </p>
              <p className="guide-p">
                Parking access on townhome streets and resort-style communities can
                mean a longer carry. We price that in time, not a mystery
                &ldquo;access fee.&rdquo; That is the opposite of the{" "}
                <Link href="/blog/hidden-moving-fees-orlando">
                  hidden moving fees
                </Link>{" "}
                some customers run into with padded flat quotes. Upfront hourly
                pricing keeps the math honest when access is tight.
              </p>
              <p className="guide-p">
                Rain delays and Florida heat are real on outdoor carries from the
                truck to a second-story townhome. We bring blankets and wrap as
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
              Davenport moving services
            </h2>

            <h3 className="guide-h3">Local moving</h3>
            <p className="guide-p">
              Point A to point B inside Polk County or into Osceola and Orange —
              including Davenport to Orlando or Kissimmee on I-4 and US-27. Same
              crew, same hourly structure, same no-surprise fees. Ideal for new
              homes, rentals, and mixed local itineraries.
            </p>

            <h3 className="guide-h3">Apartment moving</h3>
            <p className="guide-p">
              Elevators, stairs, breezeways, and move-in windows are everyday work
              for our Davenport movers. We coordinate with property managers when
              you give us the rules, protect walls and floors on tight turns, and
              keep the load moving so you stay inside your slot. See also{" "}
              <Link href="/apartment-movers-orlando-fl">
                apartment movers in Orlando
              </Link>
              .
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

            <h3 className="guide-h3">Commercial moving</h3>
            <p className="guide-p">
              Small offices, retail turnovers, and suite moves along US-27 and near
              Four Corners can be scheduled around your hours. Tell us dock access,
              elevator needs, and after-hours preferences.{" "}
              <Link href="/commercial-movers">Commercial movers</Link> details
              apply the same hourly model.
            </p>

            <div className="city-hero-cta" style={{ marginTop: 28 }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="davenport-services"
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
              How much do movers cost in Davenport, FL?
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Davenport moving cost is almost always an hourly equation: crew
                size × hours on the job (after the minimum), plus whether a truck
                is included. A one-bedroom rental near Four Corners finishes faster
                than a four-bedroom new build with a long driveway carry and a
                packed garage. Stairs, gates, and unfinished yards add time, not a
                separate line-item fee.
              </p>
              <p className="guide-p">
                Preparation changes the bill more than people expect. Fully packed
                boxes, clear pathways, and confirmed gate access cut clock time.
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
                fuel surcharge, no stair fee, no material fee. Drive time between
                Orlando, Kissimmee, and Davenport is quoted honestly — no padded
                flat rate and no per-mile surprise.
              </p>
              <p className="guide-p">
                <strong>
                  Typical factors that affect Davenport moving time:
                </strong>
              </p>
              <ul className="guide-list">
                <li>
                  A one-bedroom apartment with elevator access may take less time
                  than a multi-story townhome with a long carry
                </li>
                <li>
                  Confirmed HOA gate access and a clear driveway reduce wait time
                </li>
                <li>
                  Packed boxes and clear walkways can lower the final bill
                </li>
                <li>
                  Larger new homes may be faster with three movers instead of two
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
                What is included with your Davenport move?
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
              Local Davenport movers without the franchise runaround
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
                rates, no fuel games, no stair &ldquo;surcharges,&rdquo; and
                materials already in the rate mean you can compare apples to
                apples. Background-checked movers and a bilingual team (Hablamos
                español) are standard — not upsells. Same-week scheduling exists
                because we work this metro full time, not because a franchise sold
                a lead to whoever is free.
              </p>
              <p className="guide-p">
                If you want{" "}
                <Link href="/orlando-movers">Orlando movers</Link> who also know
                Davenport&rsquo;s HOA gates, new-build access, and I-4 / US-27
                traffic patterns, you are in the right place.{" "}
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
                  Moving in Davenport and nearby areas
                </h2>
              </div>
              <p className="city-lead">
                We serve Davenport as a service area from our Central Florida
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
              <Link href="/kissimmee-movers">Kissimmee movers</Link>
              {" · "}
              <Link href="/lakeland-movers">Lakeland movers</Link>
              {" · "}
              <Link href="/winter-haven-movers">Winter Haven movers</Link>
              {" · "}
              <Link href="/orlando-movers">Orlando movers</Link>
            </p>
          </div>
        </section>

        <FaqSection
          items={FAQS}
          heading="Davenport movers — common questions."
        />

        {/* Local closing CTA only — no generic sitewide ClosingCta (avoids double “Ready when you are”) */}
        <section className="block">
          <div className="block-inner" style={{ textAlign: "center" }}>
            <h2 className="block-h2">Ready to move in Davenport?</h2>
            <p className="block-sub">
              Get your free estimate in about 60 seconds. Same-week dates may be
              available.
            </p>
            <div className="city-hero-cta" style={{ justifyContent: "center" }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="davenport-bottom"
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
