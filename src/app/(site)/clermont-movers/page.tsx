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
const HREF = "/clermont-movers";

const TITLE = "Clermont Movers | Local Moving Company | Toro Movers";
const DESCRIPTION =
  "Need movers in Clermont, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.";

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
    q: "How much do movers cost in Clermont, FL?",
    a: "Moving costs in Clermont depend on crew size, home size, access (hills, long driveways, stairs, gated entries), packing readiness, and how long the job takes. Larger Lake County homes often need three movers. Toro Movers uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees — so you know the rate and minimum before move day.",
  },
  {
    q: "Do you move larger homes and gated communities in Clermont?",
    a: "Yes. Single-family homes, master-planned neighborhoods, and gated or 55+ communities like Kings Ridge and Summit Greens are core Clermont job types. We plan for guard-gate check-ins, HOA arrival windows, and hilly or longer driveway access.",
  },
  {
    q: "Do you charge extra for stairs or elevators?",
    a: "No separate stair or elevator fee. Toro bills by the hour, so a walk-up, slow elevator, or long carry simply adds time on the clock. Furniture blankets, shrink wrap, and basic assembly/disassembly are included — no surprise material fees.",
  },
  {
    q: "Can you move me from Clermont to Orlando, Minneola, Groveland, or Winter Garden?",
    a: "Yes. Local and regional moves between Clermont and Orlando, Minneola, Groveland, Winter Garden, and the wider Central Florida corridor are a regular part of our week. Same upfront hourly pricing — we quote drive time honestly with no per-mile fee or fuel surcharge.",
  },
  {
    q: "Do you offer labor-only moving help in Clermont?",
    a: "Yes. If you already have a U-Haul, POD, rental truck, or storage container, Toro provides labor-only loading and unloading help by the hour — same background-checked, bilingual crew and included protection materials. Storage-to-home and home-to-storage moves are common in Lake County.",
  },
  {
    q: "How far in advance should I book movers in Clermont?",
    a: "Book one to two weeks ahead when you can, especially for weekends, month-end, gated community windows, and larger multi-bedroom homes. Same-week scheduling is often available — call (689) 600-2720 or request an estimate online and we’ll tell you what’s open.",
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
  { name: "Kings Ridge", note: "Gated 55+ community and HOA windows" },
  { name: "Legends", note: "Master-planned homes and local hops" },
  { name: "Summit Greens", note: "Gated community access and arrival timing" },
  { name: "Lost Lake", note: "Larger homes and neighborhood moves" },
  { name: "Greater Hills", note: "Rolling terrain and residential streets" },
  { name: "Minneola", note: "Neighbor city north of Clermont" },
  { name: "Groveland", note: "West Lake County homes and growth areas" },
  { name: "Winter Garden", note: "East corridor into west Orange County" },
  { name: "Downtown Clermont", note: "In-town apartments and shorter carries" },
  { name: "Orlando", note: "Metro moves via FL-50 and FL-429" },
  { name: "Hartwood Marsh", note: "Corridor communities and family homes" },
];

const AREA_SERVED = [
  { "@type": "City", name: "Clermont, FL" },
  { "@type": "AdministrativeArea", name: "Lake County, FL" },
  { "@type": "City", name: "Minneola, FL" },
  { "@type": "City", name: "Groveland, FL" },
  { "@type": "City", name: "Winter Garden, FL" },
  { "@type": "City", name: "Orlando, FL" },
  { "@type": "City", name: "Davenport, FL" },
  { "@type": "City", name: "Lakeland, FL" },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Service-area page — Orlando base address only (no invented Clermont office).
      "@type": ["MovingCompany", "LocalBusiness"],
      "@id": `${SITE_URL}${HREF}#business`,
      name: `${BUSINESS_NAME} — Clermont`,
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
        latitude: 28.5494,
        longitude: -81.7729,
      },
      knowsLanguage: ["en", "es"],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      name: "Clermont moving services",
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
          name: "Clermont Movers",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function ClermontMoversPage() {
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
            <p className="city-kicker">movers clermont fl · lake county</p>
            <h1 className="city-h1">Clermont Movers</h1>
            <p className="city-subline">
              Local, apartment, and full-service moving help in Clermont, FL, with
              upfront hourly pricing and no hidden fees.
            </p>
            <div className="city-hero-cta">
              <a
                href="/get-my-price"
                data-open-quote
                data-source="clermont-hero"
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
            <div className="block-eyebrow">local movers clermont</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Clermont movers with real Central Florida experience
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Toro Movers is a family-owned Central Florida moving company —{" "}
                {GOOGLE_RATING}-star rated on Google, background-checked, and
                bilingual (Hablamos español). We help with moves in and around
                Clermont every week: larger Lake County homes, master-planned
                neighborhoods, gated and 55+ communities, apartments near town,
                and local routes into{" "}
                <Link href="/orlando-movers">Orlando</Link>,{" "}
                <Link href="/winter-garden-movers">Winter Garden</Link>,
                Minneola, Groveland, and the wider metro. We are part of the same
                local network as our{" "}
                <Link href="/central-florida-movers">Central Florida movers</Link>{" "}
                service area — one crew, one hourly model across the region.
              </p>
              <p className="guide-p">
                We are a service-area mover based in the Orlando metro — not a
                national franchise with a fake storefront on every map pin. When
                you book Toro, you get clear hourly pricing, a crew that plans for
                hills, longer driveways, and HOA gates, and a simple path to{" "}
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
                Best for Clermont moves like:
              </h3>
              <ul className="tier-bullets">
                <li>
                  Larger single-family homes and master-planned communities
                </li>
                <li>
                  Clermont to Orlando, Minneola, Groveland, or Winter Garden
                </li>
                <li>
                  Gated and 55+ community moves with HOA arrival windows
                </li>
                <li>
                  Loading or unloading a U-Haul, POD, or storage unit
                </li>
                <li>Same-week local and regional moves when availability allows</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Built for local moves */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">what we move</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Clermont movers built for local moves
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Most Clermont jobs are local or short regional: one neighborhood to
                another, Clermont to Orlando on FL-50 or FL-429, or a hop into
                Minneola, Groveland, or{" "}
                <Link href="/winter-garden-movers">Winter Garden</Link>. We cover
                apartment moves, townhomes, larger single-family homes, storage
                unit loads, and full local moves between Lake County and the wider
                metro — including routes toward{" "}
                <Link href="/davenport-movers">Davenport</Link> and{" "}
                <Link href="/lakeland-movers">Lakeland</Link> when your plan
                stretches west or south.
              </p>
              <p className="guide-p">
                Clermont is known for rolling hills and roomier homes than many
                Orlando-core streets. That means more furniture volume, longer
                driveway carries, and careful planning for steep or narrow access.
                Home moves still get the same protection: blankets, careful
                carries, and basic bed and table disassembly when stairs or tight
                turns demand it. For apartment-style jobs in town, start with our{" "}
                <Link href="/apartment-movers-orlando-fl">
                  apartment movers in Orlando
                </Link>{" "}
                page for complex-specific detail, then book the same crew for
                Clermont. Household and{" "}
                <Link href="/residential-movers">residential movers</Link> work
                follows the same hourly model.
              </p>
              <p className="guide-p">
                Storage moves and labor-only days are common too: load a POD in a
                driveway, empty a unit before closing, or unload a U-Haul at a new
                address while you keep the truck contract. Local movers Clermont
                customers hire us for flexibility — full-service when you want the
                truck, labor-only when you already have one.
              </p>
              <p className="guide-p">
                We also handle partial moves: furniture only, a garage clean-out
                before a sale, or a second trip when a gated community only allows
                a short loading window. Tell us what has to go on day one versus
                what can wait. Upfront hourly pricing means you pay for the work
                you book — not a package that forces you into a bigger truck than
                you need.
              </p>
            </div>
          </div>
        </section>

        {/* Timing access parking */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">access &amp; logistics</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Moving in Clermont comes down to timing, access, and planning
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Clermont sits west of the Orlando metro on the Lake County hills.
                Traffic on FL-50, FL-27, and the Turnpike / FL-429 corridor shapes
                arrival windows. Morning starts usually beat afternoon congestion
                into Orange County, and weekend end-of-month days fill first because
                closings and lease turnovers stack up. Tell us your preferred date
                early so we can protect a realistic arrival window — not a vague
                “sometime tomorrow.”
              </p>
              <p className="guide-p">
                Gated and 55+ communities add another layer: guard-gate check-ins,
                HOA arrival windows, certificate-of-insurance requirements, and
                rules about where trucks can stage. A good estimate needs those
                details. When you request a quote, share gate codes or visitor
                procedures, driveway length or slope notes, stairs vs elevator, and
                any building or HOA paperwork so the hourly plan matches the real
                day.
              </p>
              <p className="guide-p">
                Longer driveway carries and hilly street parking can mean more
                time on the clock — priced in hours, not a mystery “access fee.”
                That is the opposite of the{" "}
                <Link href="/blog/hidden-moving-fees-orlando">
                  hidden moving fees
                </Link>{" "}
                some customers run into with padded flat quotes. Upfront hourly
                pricing keeps the math honest when access is tight or the haul from
                truck to door is long.
              </p>
              <p className="guide-p">
                Rain delays and Florida heat are real on outdoor carries up a long
                drive or into a breezeway. We bring blankets and wrap as standard so
                wood and fabric are protected while we work. If your community
                requires a named arrival window or COI, send those requirements
                when you request your estimate so we are not sorting paperwork at
                the gate.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">services</div>
            <h2 className="block-h2" style={{ marginBottom: 28 }}>
              Clermont moving services
            </h2>

            <h3 className="guide-h3">Local moving</h3>
            <p className="guide-p">
              Point A to point B inside Lake County or into Orange County —
              including Clermont to Orlando, Minneola, Groveland, and Winter Garden.
              Same crew, same hourly structure, same no-surprise fees. Ideal for
              larger homes, apartments, and mixed local itineraries across Central
              Florida routes.
            </p>

            <h3 className="guide-h3">Apartment moving</h3>
            <p className="guide-p">
              Elevators, stairs, breezeways, and move-in windows are everyday work
              for our Clermont movers when the job is a complex or condo. We
              coordinate with property managers when you give us the rules, protect
              walls and floors on tight turns, and keep the load moving so you stay
              inside your slot. See also{" "}
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
              vendors on a Clermont-to-Orlando hop. Explore{" "}
              <Link href="/full-service-moving">full-service movers in Orlando</Link>
              .
            </p>

            <h3 className="guide-h3">Packing help</h3>
            <p className="guide-p">
              Need hands on boxes as well as furniture? Ask for packing time on
              your estimate. Many customers pack clothes and kitchen non-breakables
              themselves and leave furniture, mattresses, and heavy pieces to the
              crew — which keeps hours (and cost) under control on larger Lake
              County homes.
            </p>

            <h3 className="guide-h3">Commercial moving</h3>
            <p className="guide-p">
              Small offices, retail turnovers, and suite moves around Clermont and
              the SR 50 corridor can be scheduled around your hours. Tell us dock
              access, elevator needs, and after-hours preferences.{" "}
              <Link href="/commercial-movers">Commercial movers</Link> details
              apply the same hourly model.
            </p>

            <div className="city-hero-cta" style={{ marginTop: 28 }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="clermont-services"
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
              How much do movers cost in Clermont, FL?
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Clermont moving cost is almost always an hourly equation: crew size
                × hours on the job (after the minimum), plus whether a truck is
                included. A one-bedroom apartment near town finishes faster than a
                four-bedroom house with a long driveway carry and a packed garage.
                Hills, stairs, and gated check-ins add time, not a separate
                line-item fee. Drive time on local and regional routes is quoted
                honestly up front — no per-mile charge and no fuel surcharge.
              </p>
              <p className="guide-p">
                Preparation changes the bill more than people expect. Fully packed
                boxes, clear pathways, reserved gate windows, and a ready elevator
                or clear driveway cut clock time. Unfinished packing when the crew
                arrives burns hours you pay for. For a deeper look at how{" "}
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
                  Typical factors that affect Clermont moving time:
                </strong>
              </p>
              <ul className="guide-list">
                <li>
                  A larger multi-bedroom home may take more time than a one-bedroom
                  apartment with short access
                </li>
                <li>
                  A long or steep driveway can increase carry time vs curb-close
                  parking
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
                stairs or driveway details, gate or HOA rules, and move date. Toro
                will{" "}
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
                What is included with your Clermont move?
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
              Local Clermont movers without the franchise runaround
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
                Clermont&rsquo;s hills, gated communities, and Lake County routes
                into Winter Garden and beyond, you are in the right place.{" "}
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
                  Moving in Clermont and nearby areas
                </h2>
              </div>
              <p className="city-lead">
                We serve Clermont as a service area from our Central Florida
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
              <Link href="/winter-garden-movers">Winter Garden movers</Link>
              {" · "}
              <Link href="/davenport-movers">Davenport movers</Link>
              {" · "}
              <Link href="/lakeland-movers">Lakeland movers</Link>
              {" · "}
              <Link href="/orlando-movers">Orlando movers</Link>
            </p>
          </div>
        </section>

        <FaqSection
          items={FAQS}
          heading="Clermont movers — common questions."
        />

        {/* Local closing CTA only — no generic sitewide ClosingCta (avoids double “Ready when you are”) */}
        <section className="block">
          <div className="block-inner" style={{ textAlign: "center" }}>
            <h2 className="block-h2">Ready to move in Clermont?</h2>
            <p className="block-sub">
              Get your free estimate in about 60 seconds. Same-week dates may be
              available.
            </p>
            <div className="city-hero-cta" style={{ justifyContent: "center" }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="clermont-bottom"
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
