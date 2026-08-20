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
const HREF = "/fern-park-movers";

const TITLE = "Fern Park Movers | Local Moving Company | Toro Movers";
const DESCRIPTION =
  "Need movers in Fern Park, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.";

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
    q: "How much do movers cost in Fern Park, FL?",
    a: "Fern Park moving costs depend on crew size, home or apartment size, access (stairs, elevators, long carries), packing readiness, and how long the job takes. Most Fern Park jobs are short local hops along the 17-92 corridor, so hourly pricing tends to stay affordable. Toro Movers uses upfront hourly rates with no fuel surcharges, stair fees, or material fees — so you know the rate and minimum before move day.",
  },
  {
    q: "Do you move apartments in Fern Park?",
    a: "Yes. Apartment and condo moves are one of our strongest job types along the 17-92 corridor. We work with elevator windows, loading zones, parking rules, and property managers so move-in day stays on schedule — whether you are in Fern Park, English Estates, or a complex near Casselberry or Maitland.",
  },
  {
    q: "Do you charge extra for stairs or elevators?",
    a: "No separate stair or elevator fee. Toro bills by the hour, so a walk-up or slow elevator simply adds time on the clock. Furniture blankets, shrink wrap, and basic assembly/disassembly are included — no surprise material fees.",
  },
  {
    q: "Can you move me from Fern Park to Orlando or Winter Park?",
    a: "Yes. Local moves between Fern Park and Orlando, Winter Park, Maitland, Casselberry, Altamonte Springs, and the rest of the metro are a regular part of our week. Same upfront hourly pricing across Central Florida.",
  },
  {
    q: "Do you offer labor-only moving help in Fern Park?",
    a: "Yes — and Fern Park is a strong fit for labor-only. If you already have a U-Haul, POD, rental truck, or storage container, Toro provides loading and unloading help by the hour — same background-checked, bilingual crew and included protection materials. Ideal for short corridor moves when you want affordable help without booking a full truck.",
  },
  {
    q: "How far in advance should I book movers in Fern Park?",
    a: `Book one to two weeks ahead when you can, especially for weekends, month-end lease turnovers, and apartment move-in windows. Same-week scheduling is often available — call ${PHONE_DISPLAY} or request an estimate online and we’ll tell you what’s open.`,
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
  { name: "English Estates", note: "Homes and local apartment hops" },
  { name: "US 17-92 corridor", note: "Quick-win local and labor-only moves" },
  { name: "Casselberry", note: "Neighbor east along the corridor" },
  { name: "Maitland", note: "Neighbor south — short local hops" },
  { name: "Winter Park", note: "Residential and historic-area access" },
  { name: "Altamonte Springs", note: "North corridor apartments and condos" },
  { name: "Longwood", note: "North Seminole homes and offices" },
  { name: "Lake Mary", note: "HOA and gated communities north" },
  { name: "Orlando", note: "Metro moves on I-4 and 17-92" },
  { name: "Forest City", note: "West corridor short hops" },
];

const AREA_SERVED = [
  { "@type": "City", name: "Fern Park, FL" },
  { "@type": "AdministrativeArea", name: "Seminole County, FL" },
  { "@type": "City", name: "Casselberry, FL" },
  { "@type": "City", name: "Maitland, FL" },
  { "@type": "City", name: "Winter Park, FL" },
  { "@type": "City", name: "Altamonte Springs, FL" },
  { "@type": "City", name: "Orlando, FL" },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Service-area page — Orlando base address only (no invented Fern Park office).
      "@type": ["MovingCompany", "LocalBusiness"],
      "@id": `${SITE_URL}${HREF}#business`,
      name: `${BUSINESS_NAME} — Fern Park`,
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
        latitude: 28.6492,
        longitude: -81.3409,
      },
      knowsLanguage: ["en", "es"],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      name: "Fern Park moving services",
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
          name: "Fern Park Movers",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function FernParkMoversPage() {
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
            <p className="city-kicker">movers fern park fl · seminole county</p>
            <h1 className="city-h1">Fern Park Movers</h1>
            <p className="city-subline">
              Local, apartment, and labor-only moving help in Fern Park, FL, with
              upfront hourly pricing and no hidden fees.
            </p>
            <div className="city-hero-cta">
              <a
                href="/get-my-price"
                data-open-quote
                data-source="fern-park-hero"
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
            <div className="block-eyebrow">local movers fern park</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Fern Park movers with real Central Florida experience
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Toro Movers is a family-owned Central Florida moving company —{" "}
                {GOOGLE_RATING}-star rated on Google, background-checked, and
                bilingual (Hablamos español). We help with moves in and around
                Fern Park every week: apartments along the US Highway 17-92
                corridor, English Estates homes, labor-only U-Haul and POD days,
                and short hops into Casselberry and{" "}
                <Link href="/maitland-movers">Maitland</Link>, plus{" "}
                <Link href="/winter-park-movers">Winter Park</Link>,{" "}
                <Link href="/altamonte-springs-movers">Altamonte Springs</Link>,
                and{" "}
                <Link href="/orlando-movers">Orlando movers</Link>. We are part
                of the same local network as our{" "}
                <Link href="/central-florida-movers">Central Florida movers</Link>{" "}
                service area — one crew, one hourly model across the metro.
              </p>
              <p className="guide-p">
                We are a service-area mover based in the Orlando metro — not a
                national franchise with a fake Fern Park storefront on every map
                pin. When you book Toro, you get clear hourly pricing, a crew that
                shows up ready for tight corridor parking and apartment loading
                zones, and a simple path to{" "}
                <Link href="/get-my-price">get my free estimate</Link> or call{" "}
                <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>.
              </p>
              <p className="guide-p">
                Same-week scheduling is often available. Furniture blankets, shrink
                wrap, dollies, equipment, and basic assembly/disassembly are
                included. No fuel surcharges. No stair fees. No material fees. The
                clock starts when we work — and stops when the job is done. That
                model fits Fern Park especially well, where many moves stay local
                and affordable instead of turning into long-haul franchise quotes.
              </p>
            </div>

            <div className="tier" style={{ marginTop: 28 }}>
              <h3 className="tier-title" style={{ marginBottom: 12 }}>
                Best for Fern Park moves like:
              </h3>
              <ul className="tier-bullets">
                <li>
                  Apartment moves along the 17-92 corridor near Casselberry or
                  Maitland
                </li>
                <li>
                  Affordable local hops between Fern Park and neighboring cities
                </li>
                <li>
                  Loading or unloading a U-Haul, POD, or storage unit
                  (labor-only)
                </li>
                <li>
                  Condo, townhome, and English Estates home moves
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
              Fern Park movers built for apartments, labor-only, and local hops
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Most Fern Park jobs are local and efficient: one complex to another,
                a studio or one-bedroom down the 17-92 corridor, English Estates to
                Casselberry, or a short drive into Maitland or Winter Park. We cover
                apartment moves, condo moves, townhomes, single-family homes,
                storage unit loads, and full local moves between Fern Park and the
                wider metro.
              </p>
              <p className="guide-p">
                Garden-style and mid-rise apartments dominate much of this stretch
                — so we plan for elevator reservations when they exist, breezeway
                carries, visitor-lot long hauls, and property-manager move-in
                windows. Home moves still get the same protection: blankets,
                careful carries, and basic bed and table disassembly when the
                stairs demand it. If you&rsquo;re comparing options, start with our{" "}
                <Link href="/apartment-movers-orlando-fl">
                  apartment movers in Orlando
                </Link>{" "}
                page for complex-specific detail, then book the same crew for Fern
                Park.
              </p>
              <p className="guide-p">
                Labor-only is a standout here. Load a POD in a complex lot, empty a
                unit before lease end, or unload a U-Haul at a new address while you
                keep the truck contract. Fern Park customers often want affordable
                muscle for a half-day job — not a padded flat rate built for a
                three-bedroom cross-state move. Full-service is available when you
                want our truck; labor-only when you already have one. Details on{" "}
                <Link href="/labor-only-moving">labor-only moving</Link>.
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
              Moving in Fern Park comes down to timing, corridor access, and
              parking
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Fern Park sits on the US Highway 17-92 corridor in Seminole County,
                between Casselberry and the Maitland / Winter Park edge. Traffic
                windows matter on 17-92 and nearby connectors. Morning starts usually
                beat afternoon congestion, and weekend end-of-month days fill first
                because lease turnovers stack up. Tell us your preferred date early
                so we can protect a realistic arrival window — not a vague
                “sometime tomorrow.”
              </p>
              <p className="guide-p">
                Apartment complexes add another layer: elevator booking slots when
                available, loading zones that only hold a truck for a short window,
                long carries from visitor parking, and rules about where pads and
                carts can go. A good estimate needs those details. When you request
                a quote, share floor number, elevator vs walk-up, and any building
                paperwork so the hourly plan matches the real day.
              </p>
              <p className="guide-p">
                Strip-center edge lots and older side streets off 17-92 can mean a
                longer carry. We price that in time, not a mystery “access fee.”
                That is the opposite of the{" "}
                <Link href="/blog/hidden-moving-fees-orlando">
                  hidden moving fees
                </Link>{" "}
                some customers run into with padded flat quotes. Upfront hourly
                pricing keeps the math honest when access is tight — and keeps
                Fern Park local moves affordable when the hop is short.
              </p>
              <p className="guide-p">
                Rain delays and Florida heat are real on outdoor carries from the
                truck to a second- or third-floor breezeway. We bring blankets and
                wrap as standard so wood and fabric are protected while we work. If
                your complex requires a certificate of insurance or a named arrival
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
              Fern Park moving services
            </h2>

            <h3 className="guide-h3">Local moving</h3>
            <p className="guide-p">
              Point A to point B inside Seminole County or into Orange County —
              including Fern Park to Orlando, Maitland, Winter Park, Casselberry,
              and Altamonte Springs. Same crew, same hourly structure, same
              no-surprise fees. Ideal for apartments, houses, and mixed local
              itineraries along the 17-92 corridor.
            </p>

            <h3 className="guide-h3">Apartment moving</h3>
            <p className="guide-p">
              Elevators, stairs, breezeways, and move-in windows are everyday work
              for our Fern Park movers. We coordinate with property managers when
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
              only. Labor-only is a Fern Park sweet spot — short corridor distance,
              affordable hourly help, blankets and wrap included. We load tight,
              unload and place, or do both ends. No truck charge when you supply
              the vehicle. Full details on{" "}
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
              crew — which keeps hours (and cost) under control on smaller Fern
              Park apartments.
            </p>

            <h3 className="guide-h3">Commercial moving</h3>
            <p className="guide-p">
              Small offices, retail turnovers, and suite moves along 17-92 can be
              scheduled around your hours. Tell us dock access, elevator needs, and
              after-hours preferences.{" "}
              <Link href="/commercial-movers">Commercial movers</Link> details
              apply the same hourly model.
            </p>

            <div className="city-hero-cta" style={{ marginTop: 28 }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="fern-park-services"
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
              How much do movers cost in Fern Park, FL?
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Fern Park moving cost is almost always an hourly equation: crew size
                × hours on the job (after the minimum), plus whether a truck is
                included. A studio or one-bedroom along 17-92 finishes faster than
                a three-bedroom house with a long carry and a packed garage. Stairs
                and elevators add time, not a separate line-item fee. Short corridor
                hops keep drive time low — which is why Fern Park is often an
                affordable local move compared with longer metro routes.
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
                  Typical factors that affect Fern Park moving time:
                </strong>
              </p>
              <ul className="guide-list">
                <li>
                  A one-bedroom apartment with elevator access may take less time
                  than a third-floor walk-up
                </li>
                <li>
                  A reserved loading area on the 17-92 corridor can reduce
                  long-carry time
                </li>
                <li>
                  Packed boxes and clear walkways can lower the final bill
                </li>
                <li>
                  Larger homes may be faster with three movers instead of two
                </li>
                <li>
                  Short hops to Casselberry or Maitland keep drive time low vs
                  longer metro routes
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
                What is included with your Fern Park move?
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
              Local Fern Park movers without the franchise runaround
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                National brands often sound local until you book: call centers,
                subcontracted crews you have never spoken to, and quotes that
                change once the truck is half loaded. Toro is the opposite
                experience on purpose. We are family-owned in Central Florida. You
                talk to people who schedule real local jobs along the 17-92
                corridor. The crew that quotes the day is the crew that shows up.
              </p>
              <p className="guide-p">
                Clear pricing matters more than a logo on a trailer. Upfront hourly
                rates, no fuel games, no stair “surcharges,” and materials already
                in the rate mean you can compare apples to apples — especially on
                the smaller apartments and labor-only days that define many Fern
                Park moves. Background-checked movers and a bilingual team
                (Hablamos español) are standard — not upsells. Same-week scheduling
                exists because we work this metro full time, not because a franchise
                sold a lead to whoever is free.
              </p>
              <p className="guide-p">
                If you want{" "}
                <Link href="/orlando-movers">Orlando movers</Link> who also know
                Fern Park&rsquo;s corridor parking and apartment rules, you are in
                the right place.{" "}
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
                  Moving in Fern Park and nearby areas
                </h2>
              </div>
              <p className="city-lead">
                We serve Fern Park as a service area from our Central Florida
                operation — no invented storefront address. These are neighborhoods
                and neighboring cities our crews run regularly along 17-92 and into
                the metro.
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
              <Link href="/maitland-movers">Maitland movers</Link>
              {" · "}
              <Link href="/winter-park-movers">Winter Park movers</Link>
              {" · "}
              <Link href="/altamonte-springs-movers">Altamonte Springs movers</Link>
              {" · "}
              <Link href="/orlando-movers">Orlando movers</Link>
            </p>
          </div>
        </section>

        <FaqSection
          items={FAQS}
          heading="Fern Park movers — common questions."
        />

        {/* Local closing CTA only — no generic sitewide ClosingCta (avoids double “Ready when you are”) */}
        <section className="block">
          <div className="block-inner" style={{ textAlign: "center" }}>
            <h2 className="block-h2">Ready to move in Fern Park?</h2>
            <p className="block-sub">
              Get your free estimate in about 60 seconds. Same-week dates may be
              available.
            </p>
            <div className="city-hero-cta" style={{ justifyContent: "center" }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="fern-park-bottom"
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
