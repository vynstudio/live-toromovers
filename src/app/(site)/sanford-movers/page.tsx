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
const HREF = "/sanford-movers";

const TITLE = "Sanford Movers | Local Moving Company | Toro Movers";
const DESCRIPTION =
  "Need movers in Sanford, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.";

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
    q: "How much do movers cost in Sanford, FL?",
    a: "Moving costs in Sanford depend on crew size, home size, access (stairs, elevators, brick-street parking, long carries), packing readiness, and how long the job takes. Toro Movers uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees — so you know the rate and minimum before move day.",
  },
  {
    q: "Do you move apartments in Sanford?",
    a: "Yes. Apartment and condo moves are a core job type around Sanford, Lake Monroe, and north Seminole County. We work with elevator windows, loading zones, parking rules, and property managers so move-in day stays on schedule.",
  },
  {
    q: "Can you move in Sanford’s historic district with brick streets?",
    a: "Yes. Historic downtown means brick streets, narrow lots, tight parking, and older homes that need floor and door-jamb protection. We plan truck access ahead of time and bring extra blankets and pads so century-old floors and moldings stay protected.",
  },
  {
    q: "Can you move me from Sanford to Orlando?",
    a: "Yes. Sanford to Orlando relocations — and hops to Lake Mary, Oviedo, Winter Springs, Longwood, and the rest of the metro — are a regular part of our week. Same upfront hourly pricing across Central Florida.",
  },
  {
    q: "Do you offer labor-only moving help in Sanford?",
    a: "Yes. If you already have a U-Haul, POD, rental truck, or storage container, Toro provides labor-only loading and unloading help by the hour — same background-checked, bilingual crew and included protection materials.",
  },
  {
    q: "How far in advance should I book movers in Sanford?",
    a: "Book one to two weeks ahead when you can, especially for weekends, month-end lease turnovers, and apartment move-in windows. Same-week scheduling is often available — call (689) 600-2720 or request an estimate online and we’ll tell you what’s open.",
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
  { name: "Historic Downtown Sanford", note: "Brick streets, older homes, tight truck access" },
  { name: "Lake Monroe", note: "Waterfront homes and lakeside communities" },
  { name: "Mayfair", note: "Residential streets and local hops" },
  { name: "Riverview", note: "Homes near the river corridor" },
  { name: "Heron Ridge", note: "Neighborhood homes and garages" },
  { name: "Celery Estates", note: "Family homes and driveways" },
  { name: "Lake Mary", note: "Neighbor city south — HOA & gated moves" },
  { name: "Oviedo", note: "East Seminole homes and apartments" },
  { name: "Longwood", note: "Corridor moves toward I-4" },
  { name: "Winter Springs", note: "Residential and townhome access" },
  { name: "Orlando", note: "Metro relocations via I-4 and 417" },
];

const AREA_SERVED = [
  { "@type": "City", name: "Sanford, FL" },
  { "@type": "AdministrativeArea", name: "Seminole County, FL" },
  { "@type": "City", name: "Lake Mary, FL" },
  { "@type": "City", name: "Oviedo, FL" },
  { "@type": "City", name: "Longwood, FL" },
  { "@type": "City", name: "Winter Springs, FL" },
  { "@type": "City", name: "Orlando, FL" },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Service-area page — Orlando base address only (no invented Sanford office).
      "@type": ["MovingCompany", "LocalBusiness"],
      "@id": `${SITE_URL}${HREF}#business`,
      name: `${BUSINESS_NAME} — Sanford`,
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
        latitude: 28.8117,
        longitude: -81.2731,
      },
      knowsLanguage: ["en", "es"],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      name: "Sanford moving services",
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
          name: "Sanford Movers",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function SanfordMoversPage() {
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
            <p className="city-kicker">movers sanford fl · seminole county</p>
            <h1 className="city-h1">Sanford Movers</h1>
            <p className="city-subline">
              Local, apartment, and full-service moving help in Sanford, FL, with
              upfront hourly pricing and no hidden fees.
            </p>
            <div className="city-hero-cta">
              <a
                href="/get-my-price"
                data-open-quote
                data-source="sanford-hero"
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
            <div className="block-eyebrow">local movers sanford</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Sanford movers with real Central Florida experience
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Toro Movers is a family-owned Central Florida moving company —{" "}
                {GOOGLE_RATING}-star rated on Google, background-checked, and
                bilingual (Hablamos español). We help with moves in and around
                Sanford every week: historic downtown bungalows, Lake Monroe
                waterfront homes, apartments and condos, storage loads, and
                Sanford-to-Orlando relocations toward{" "}
                <Link href="/lake-mary-movers">Lake Mary</Link>,{" "}
                <Link href="/oviedo-movers">Oviedo</Link>, Longwood, Winter
                Springs, and{" "}
                <Link href="/orlando-movers">Orlando movers</Link>. We are part of
                the same local network as our{" "}
                <Link href="/central-florida-movers">Central Florida movers</Link>{" "}
                service area — one crew, one hourly model across the metro.
              </p>
              <p className="guide-p">
                We are a service-area mover based in the Orlando metro — not a
                national franchise with a fake Sanford storefront on every map pin.
                When you book Toro, you get clear hourly pricing, a crew that plans
                for brick streets and tight downtown parking, and a simple path to{" "}
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
                Best for Sanford moves like:
              </h3>
              <ul className="tier-bullets">
                <li>
                  Historic downtown homes on brick streets near Lake Monroe
                </li>
                <li>
                  Apartment and condo moves with elevators or walk-ups
                </li>
                <li>
                  Sanford to Orlando relocations on I-4 or SR 417
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
              Sanford movers built for apartments, storage, and Sanford-to-Orlando
              moves
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Most Sanford jobs are local: one neighborhood to another, a
                waterfront home to a newer subdivision, or a Sanford to Orlando
                relocation on I-4 or the 417. We cover apartment moves, condo
                moves, townhomes, single-family homes, storage unit loads, and full
                local moves between Sanford and the wider{" "}
                <Link href="/central-florida-movers">Central Florida</Link> metro.
              </p>
              <p className="guide-p">
                Apartment and garden-style complexes around Sanford and the Lake
                Monroe corridor need elevator reservations, tight breezeways, and
                property-manager windows. Historic homes near downtown still get the
                same protection — blankets, careful carries through narrow
                doorways, and basic bed and table disassembly when stairs and
                porch turns demand it. Home moves and apartment moves run on the
                same honest hourly model.
              </p>
              <p className="guide-p">
                Storage moves and labor-only days are common too: load a POD in a
                complex lot, empty a unit before lease end, or unload a U-Haul at a
                new address while you keep the truck contract. Sanford customers
                hire us for flexibility — full-service when you want the truck,
                labor-only when you already have one. See{" "}
                <Link href="/labor-only-moving">labor-only moving</Link> for how
                that works.
              </p>
              <p className="guide-p">
                We also handle partial moves: furniture only, a garage clean-out
                before a sale, or a second trip when a complex only allows a short
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
              Moving in Sanford comes down to timing, access, and historic-district
              parking
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Sanford sits north of Lake Mary along I-4 and the 417, with Lake
                Monroe framing the waterfront. Traffic windows matter on end-of-month
                weekends and when downtown events tighten First Street and the
                brick grid. Morning starts usually beat afternoon congestion. Tell
                us your preferred date early so we can protect a realistic arrival
                window — not a vague “sometime tomorrow.”
              </p>
              <p className="guide-p">
                Historic downtown adds another layer: brick streets, narrow lots,
                limited truck staging, and century-old floors that need pads before
                the first cart rolls in. A good estimate needs those details. When
                you request a quote, share floor number, elevator vs walk-up,
                driveway or street-only parking, and any HOA or building paperwork
                so the hourly plan matches the real day.
              </p>
              <p className="guide-p">
                Lake Monroe and neighborhood streets can mean a longer carry from a
                safe truck position. We price that in time, not a mystery “access
                fee.” That is the opposite of the{" "}
                <Link href="/blog/hidden-moving-fees-orlando">
                  hidden moving fees
                </Link>{" "}
                some customers run into with padded flat quotes. Upfront hourly
                pricing keeps the math honest when access is tight.
              </p>
              <p className="guide-p">
                Rain delays and Florida heat are real on outdoor carries from the
                truck to a third-floor breezeway or a long waterfront walkway. We
                bring blankets and wrap as standard so wood and fabric are
                protected while we work. If your complex or HOA requires a
                certificate of insurance or a named arrival window, send those
                requirements when you request your estimate so we are not sorting
                paperwork on the curb.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">services</div>
            <h2 className="block-h2" style={{ marginBottom: 28 }}>
              Sanford moving services
            </h2>

            <h3 className="guide-h3">Local moving</h3>
            <p className="guide-p">
              Point A to point B inside Seminole County or into Orange County —
              including Sanford to Orlando on I-4 or SR 417. Same crew, same hourly
              structure, same no-surprise fees. Ideal for apartments, houses, and
              mixed local itineraries across{" "}
              <Link href="/central-florida-movers">Central Florida</Link>.
            </p>

            <h3 className="guide-h3">Apartment moving</h3>
            <p className="guide-p">
              Elevators, stairs, breezeways, and move-in windows are everyday work
              for our Sanford movers. We coordinate with property managers when you
              give us the rules, protect walls and floors on tight turns, and keep
              the load moving so you stay inside your slot.
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
              vendors — especially on Sanford to Orlando days when one coordinated
              crew saves a second trip.
            </p>

            <h3 className="guide-h3">Packing help</h3>
            <p className="guide-p">
              Need hands on boxes as well as furniture? Ask for packing time on
              your estimate. Many customers pack clothes and kitchen non-breakables
              themselves and leave furniture, mattresses, and heavy pieces to the
              crew — which keeps hours (and cost) under control.
            </p>

            <h3 className="guide-h3">Storage moves</h3>
            <p className="guide-p">
              Moving into or out of storage is a frequent Sanford job type — lease
              gaps, downsizing, or staging a house for sale. We load storage units
              tight, protect furniture for short-term storage, and unload when you
              are ready. Same hourly model whether the unit is near town or across
              the metro.
            </p>

            <div className="city-hero-cta" style={{ marginTop: 28 }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="sanford-services"
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
              How much do movers cost in Sanford, FL?
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Sanford moving cost is almost always an hourly equation: crew size ×
                hours on the job (after the minimum), plus whether a truck is
                included. A one-bedroom apartment finishes faster than a historic
                three-bedroom with a packed garage, brick-street parking, and a long
                carry. Stairs and elevators add time, not a separate line-item fee.
              </p>
              <p className="guide-p">
                Preparation changes the bill more than people expect. Fully packed
                boxes, clear pathways, and reserved elevators cut clock time.
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
                  Typical factors that affect Sanford moving time:
                </strong>
              </p>
              <ul className="guide-list">
                <li>
                  A one-bedroom apartment with elevator access may take less time
                  than a third-floor walk-up
                </li>
                <li>
                  Brick-street parking or a long carry from Lake Monroe can add
                  clock time
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
                stairs or elevator details, and move date. Toro will{" "}
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
                What is included with your Sanford move?
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
              Local Sanford movers without the franchise runaround
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
                Sanford&rsquo;s historic core, Lake Monroe access, and north
                Seminole traffic patterns, you are in the right place.{" "}
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
                  Moving in Sanford and nearby areas
                </h2>
              </div>
              <p className="city-lead">
                We serve Sanford as a service area from our Central Florida
                operation — no invented Sanford office address. These are
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
              <Link href="/lake-mary-movers">Lake Mary movers</Link>
              {" · "}
              <Link href="/oviedo-movers">Oviedo movers</Link>
              {" · "}
              <Link href="/orlando-movers">Orlando movers</Link>
            </p>
          </div>
        </section>

        <FaqSection
          items={FAQS}
          heading="Sanford movers — common questions."
        />

        {/* Local closing CTA only — no generic sitewide ClosingCta (avoids double “Ready when you are”) */}
        <section className="block">
          <div className="block-inner" style={{ textAlign: "center" }}>
            <h2 className="block-h2">Ready to move in Sanford?</h2>
            <p className="block-sub">
              Get your free estimate in about 60 seconds. Same-week dates may be
              available.
            </p>
            <div className="city-hero-cta" style={{ justifyContent: "center" }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="sanford-bottom"
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
