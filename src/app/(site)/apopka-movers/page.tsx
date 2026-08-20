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
const HREF = "/apopka-movers";

const TITLE = "Apopka Movers | Local Moving Company | Toro Movers";
const DESCRIPTION =
  "Need movers in Apopka, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.";

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
    q: "How much do movers cost in Apopka, FL?",
    a: "Moving costs in Apopka depend on crew size, home size, access (stairs, long driveways, HOA gates), packing readiness, and how long the job takes. Toro Movers uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees — so you know the rate and minimum before move day.",
  },
  {
    q: "Do you move single-family homes and apartments in Apopka?",
    a: "Yes. Single-family homes along the growth corridor, townhomes, and apartment moves are everyday work for our Apopka crews. Larger homes with bigger garages and longer driveways are fine — we plan access and crew size so the day stays efficient.",
  },
  {
    q: "Do you charge extra for stairs or long carries?",
    a: "No separate stair or access fee. Toro bills by the hour, so a long driveway, walk-up, or gated community simply adds time on the clock. Furniture blankets, shrink wrap, and basic assembly/disassembly are included — no surprise material fees.",
  },
  {
    q: "Can you move me from Apopka to Orlando, Winter Garden, or Altamonte Springs?",
    a: "Yes. Local moves between Apopka and Orlando, Winter Garden, Altamonte Springs, Wekiva, Zellwood, and the wider Central Florida metro are a regular part of our week. Same upfront hourly pricing across the region.",
  },
  {
    q: "Do you offer labor-only and storage moves in Apopka?",
    a: "Yes. If you already have a U-Haul, POD, rental truck, or storage container, Toro provides labor-only loading and unloading help by the hour — same background-checked, bilingual crew and included protection materials. Storage unit loads and empties are common Apopka jobs too.",
  },
  {
    q: "How far in advance should I book movers in Apopka?",
    a: `Book one to two weeks ahead when you can, especially for weekends, month-end, and same-week family moves. Same-week scheduling is often available — call ${PHONE_DISPLAY} or request an estimate online and we’ll tell you what’s open.`,
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
  { name: "Errol Estates", note: "Established homes and golf-community access" },
  { name: "Rock Springs Ridge", note: "Larger single-family homes and driveways" },
  { name: "Wekiva / Wekiwa Springs", note: "Homes near parks and west-side corridors" },
  { name: "Sweetwater Country Club", note: "HOA communities and residential moves" },
  { name: "Kelly Park area", note: "North Apopka homes and short local hops" },
  { name: "Zellwood", note: "North corridor homes and rural-edge access" },
  { name: "Winter Garden", note: "West metro moves via 429 and local roads" },
  { name: "Altamonte Springs", note: "East corridor apartments and homes" },
  { name: "Orlando", note: "Metro moves on 429, 441, and I-4 connectors" },
  { name: "Ocoee", note: "Neighbor city west toward the turnpike" },
  { name: "Forest City", note: "South-east hops toward Seminole County" },
];

const AREA_SERVED = [
  { "@type": "City", name: "Apopka, FL" },
  { "@type": "AdministrativeArea", name: "Orange County, FL" },
  { "@type": "City", name: "Orlando, FL" },
  { "@type": "City", name: "Winter Garden, FL" },
  { "@type": "City", name: "Altamonte Springs, FL" },
  { "@type": "City", name: "Zellwood, FL" },
  { "@type": "City", name: "Ocoee, FL" },
  { "@type": "City", name: "Maitland, FL" },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Service-area page — Orlando base address only (no invented Apopka office).
      "@type": ["MovingCompany", "LocalBusiness"],
      "@id": `${SITE_URL}${HREF}#business`,
      name: `${BUSINESS_NAME} — Apopka`,
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
        latitude: 28.6776,
        longitude: -81.5106,
      },
      knowsLanguage: ["en", "es"],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      name: "Apopka moving services",
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
          name: "Apopka Movers",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function ApopkaMoversPage() {
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
            <p className="city-kicker">movers apopka fl · orange county</p>
            <h1 className="city-h1">Apopka Movers</h1>
            <p className="city-subline">
              Local, apartment, and full-service moving help in Apopka, FL, with
              upfront hourly pricing and no hidden fees.
            </p>
            <div className="city-hero-cta">
              <a
                href="/get-my-price"
                data-open-quote
                data-source="apopka-hero"
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
            <div className="block-eyebrow">local movers apopka</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Apopka movers with real Central Florida experience
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Toro Movers is a family-owned Central Florida moving company —{" "}
                {GOOGLE_RATING}-star rated on Google, background-checked, and
                bilingual (Hablamos español). We help with affordable local moves
                in and around Apopka every week: single-family homes in Errol
                Estates and Rock Springs Ridge, apartments and townhomes near the
                growth corridor, storage loads, and hops to{" "}
                <Link href="/orlando-movers">Orlando movers</Link>,{" "}
                <Link href="/winter-garden-movers">Winter Garden</Link>,{" "}
                <Link href="/altamonte-springs-movers">Altamonte Springs</Link>,
                Wekiva, and Zellwood. We are part of the same local network as our{" "}
                <Link href="/central-florida-movers">Central Florida movers</Link>{" "}
                service area — one crew, one hourly model across the metro.
              </p>
              <p className="guide-p">
                We are a service-area mover based in the Orlando metro — not a
                national franchise with a fake storefront on every map pin. When
                you book Toro, you get clear hourly pricing, a crew that shows up
                ready for larger homes and longer driveways, and a simple path to{" "}
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
                Best for Apopka moves like:
              </h3>
              <ul className="tier-bullets">
                <li>
                  Affordable local moves within Apopka and north Orange County
                </li>
                <li>
                  Single-family home moves and upsizing along the growth corridor
                </li>
                <li>
                  Storage unit loads, POD days, and U-Haul labor-only help
                </li>
                <li>
                  Apopka to Orlando, Winter Garden, Altamonte Springs, or Wekiva
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
              Apopka movers built for local moves
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Most Apopka jobs are local: one neighborhood to another, a short
                hop to Zellwood or Wekiva, or a full local move into Orlando or
                Winter Garden. We cover single-family homes, townhomes, apartments,
                storage unit loads, and mixed itineraries across north Orange
                County without turning a simple day into a franchise runaround.
              </p>
              <p className="guide-p">
                Apopka has grown hard along the SR-429 corridor, so many customers
                are trading apartments for larger homes with bigger garages, longer
                driveways, and more furniture. That is fine — larger homes are a
                normal part of our week. We size the crew to the inventory, protect
                floors and doorways on tight turns, and handle basic bed and table
                disassembly when stairs or hallways demand it. If you&rsquo;re
                comparing apartment options, start with our{" "}
                <Link href="/apartment-movers-orlando-fl">
                  apartment movers in Orlando
                </Link>{" "}
                page for complex-specific detail, then book the same crew for
                Apopka.
              </p>
              <p className="guide-p">
                Storage moves and labor-only days are common too: load a POD in a
                driveway, empty a storage unit before closing, or unload a U-Haul
                at a new address while you keep the truck contract. Local movers
                Apopka customers hire us for flexibility — full-service when you
                want the truck, labor-only when you already have one.
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
              Moving in Apopka comes down to timing, access, and planning
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Apopka sits on the west-northwest edge of the Orlando metro, with
                traffic funnels on US-441, SR-429, and connectors toward I-4.
                Morning starts usually beat afternoon congestion, and weekend
                end-of-month days fill first because family moves and lease
                turnovers stack up. Tell us your preferred date early so we can
                protect a realistic arrival window — not a vague “sometime
                tomorrow.” Same-week scheduling is often available when the calendar
                allows.
              </p>
              <p className="guide-p">
                Single-family communities add their own layer: HOA gate codes,
                long driveway carries, cul-de-sac parking, and rules about where a
                truck can sit. Apartment and townhome complexes may need elevator
                windows or short loading slots. A good estimate needs those
                details. When you request a quote, share home size, stairs vs
                ground floor, gate or parking notes, and any HOA paperwork so the
                hourly plan matches the real day.
              </p>
              <p className="guide-p">
                Parking access on new-construction streets and older neighborhoods
                can mean a longer carry from the truck. We price that in time, not
                a mystery “access fee.” That is the opposite of the{" "}
                <Link href="/blog/hidden-moving-fees-orlando">
                  hidden moving fees
                </Link>{" "}
                some customers run into with padded flat quotes. Upfront hourly
                pricing keeps the math honest when access is tight.
              </p>
              <p className="guide-p">
                Rain delays and Florida heat are real on outdoor carries from a
                long driveway to a second-floor landing. We bring blankets and wrap
                as standard so wood and fabric are protected while we work. If your
                community requires a certificate of insurance or a named arrival
                window, send those requirements when you request your estimate so
                we are not sorting paperwork on the curb.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">services</div>
            <h2 className="block-h2" style={{ marginBottom: 28 }}>
              Apopka moving services
            </h2>

            <h3 className="guide-h3">Local moving</h3>
            <p className="guide-p">
              Point A to point B inside north Orange County or into the wider metro
              — including Apopka to Orlando, Winter Garden, Altamonte Springs,
              Wekiva, and Zellwood. Same crew, same hourly structure, same
              no-surprise fees. Ideal for single-family homes, apartments, and
              mixed local itineraries.
            </p>

            <h3 className="guide-h3">Apartment moving</h3>
            <p className="guide-p">
              Elevators, stairs, breezeways, and move-in windows are everyday work
              for our Apopka movers. We coordinate with property managers when you
              give us the rules, protect walls and floors on tight turns, and keep
              the load moving so you stay inside your slot. See also{" "}
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
              Small offices, retail turnovers, and suite moves near downtown
              Apopka and the 441 corridor can be scheduled around your hours. Tell
              us dock access, elevator needs, and after-hours preferences.{" "}
              <Link href="/commercial-movers">Commercial movers</Link> details
              apply the same hourly model.
            </p>

            <div className="city-hero-cta" style={{ marginTop: 28 }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="apopka-services"
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
              How much do movers cost in Apopka, FL?
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Apopka moving cost is almost always an hourly equation: crew size ×
                hours on the job (after the minimum), plus whether a truck is
                included. A one-bedroom apartment finishes faster than a
                three-bedroom house with a long driveway, packed garage, and heavy
                furniture. Stairs and long carries add time, not a separate
                line-item fee.
              </p>
              <p className="guide-p">
                Preparation changes the bill more than people expect. Fully packed
                boxes, clear pathways, and reserved HOA or elevator windows cut
                clock time. Unfinished packing when the crew arrives burns hours
                you pay for. For a deeper look at how{" "}
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
                fuel surcharge, no stair fee, no material fee. That keeps local
                Apopka moves affordable and predictable without invented flat-rate
                padding.
              </p>
              <p className="guide-p">
                <strong>
                  Typical factors that affect Apopka moving time:
                </strong>
              </p>
              <ul className="guide-list">
                <li>
                  A one-bedroom apartment may take less time than a larger
                  single-family home with a long driveway
                </li>
                <li>
                  Reserved HOA gate access or a clear loading area can reduce
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
                Crew size scales with the job: two movers for many studios and
                one-bedrooms, three or more when a house or heavy furniture load
                would otherwise drag. Adding a mover often lowers total hours
                enough to offset the higher hourly rate. We recommend a size when
                you share inventory and access — you are not guessing alone.
              </p>
              <p className="guide-p">
                Want a real number for your move? Send your addresses, home size,
                stairs or driveway details, and move date. Toro will{" "}
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
                What is included with your Apopka move?
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
              Local Apopka movers without the franchise runaround
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
                upsells — and that bilingual support fits Apopka households that
                want the whole move in English or Spanish. Same-week scheduling
                exists because we work this metro full time, not because a
                franchise sold a lead to whoever is free.
              </p>
              <p className="guide-p">
                If you want{" "}
                <Link href="/orlando-movers">Orlando movers</Link> who also know
                Apopka&rsquo;s growth-corridor homes, 441 traffic, and west-side
                hops to{" "}
                <Link href="/winter-garden-movers">Winter Garden</Link> and{" "}
                <Link href="/altamonte-springs-movers">Altamonte Springs</Link>,
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
                  Moving in Apopka and nearby areas
                </h2>
              </div>
              <p className="city-lead">
                We serve Apopka as a service area from our Central Florida
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
              <Link href="/orlando-movers">Orlando movers</Link>
              {" · "}
              <Link href="/winter-garden-movers">Winter Garden movers</Link>
              {" · "}
              <Link href="/altamonte-springs-movers">
                Altamonte Springs movers
              </Link>
              {" · "}
              <Link href="/central-florida-movers">Central Florida movers</Link>
            </p>
          </div>
        </section>

        <FaqSection
          items={FAQS}
          heading="Apopka movers — common questions."
        />

        {/* Local closing CTA only — no generic sitewide ClosingCta (avoids double “Ready when you are”) */}
        <section className="block">
          <div className="block-inner" style={{ textAlign: "center" }}>
            <h2 className="block-h2">Ready to move in Apopka?</h2>
            <p className="block-sub">
              Get your free estimate in about 60 seconds. Same-week dates may be
              available.
            </p>
            <div className="city-hero-cta" style={{ justifyContent: "center" }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="apopka-bottom"
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
