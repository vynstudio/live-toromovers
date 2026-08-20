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
const HREF = "/winter-park-movers";

const TITLE = "Winter Park Movers | Local Moving Company | Toro Movers";
const DESCRIPTION =
  "Need movers in Winter Park, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing and no hidden fees.";

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
    q: "How much do movers cost in Winter Park, FL?",
    a: "Winter Park moving cost depends on crew size, home or apartment size, access (narrow streets, stairs, elevators, long carries), packing readiness, and how long the job takes. Toro Movers uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees — so you know the rate and minimum before move day.",
  },
  {
    q: "Do you move apartments in Winter Park?",
    a: "Yes. Apartment and condo moves are common near Rollins College, along Aloma, and in newer mixed-use pockets. We plan around elevator windows, loading zones, tight breezeways, and property-manager rules so move-in day stays on schedule.",
  },
  {
    q: "Do you charge extra for stairs or elevators?",
    a: "No separate stair or elevator fee. Toro bills by the hour, so a walk-up, slow elevator, or long carry simply adds time on the clock. Furniture blankets, shrink wrap, and basic assembly/disassembly are included — no surprise material fees.",
  },
  {
    q: "Can you move me from Winter Park to Orlando?",
    a: "Yes. Local moves between Winter Park and Orlando (and nearby cities like Maitland, Fern Park, Altamonte Springs, and Baldwin Park) are a regular part of our week. Same upfront hourly pricing across Central Florida.",
  },
  {
    q: "Do you offer labor-only moving help in Winter Park?",
    a: "Yes. If you already have a U-Haul, POD, rental truck, or storage container, Toro provides labor-only loading and unloading help by the hour — same background-checked, bilingual crew and included protection materials.",
  },
  {
    q: "How do you handle older Winter Park homes and tight streets?",
    a: "Many Winter Park streets near Park Avenue and older residential blocks are narrow, with limited driveway depth and brick or uneven approaches. We plan truck placement and carries ahead of time, pad floors and doorways, and move furniture deliberately through tight turns — careful handling without the franchise upsell language.",
  },
  {
    q: "How far in advance should I book movers in Winter Park?",
    a: `Book one to two weeks ahead when you can, especially for weekends, month-end lease turnovers, and apartment move-in windows near campus. Same-week scheduling is often available — call ${PHONE_DISPLAY} or request an estimate online and we’ll tell you what’s open.`,
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
  { name: "Park Avenue", note: "Downtown core — tight streets, careful carries" },
  { name: "Rollins College area", note: "Student and faculty apartment turnovers" },
  { name: "Olde Winter Park", note: "Older homes, narrow streets, brick approaches" },
  { name: "Hannibal Square", note: "Local homes and short in-city hops" },
  { name: "Aloma corridor", note: "East-side apartments and family homes" },
  { name: "Baldwin Park", note: "Neighbor community — short local moves" },
  { name: "Maitland", note: "Neighbor city west of Winter Park" },
  { name: "Fern Park", note: "17-92 corridor moves north" },
  { name: "Orlando", note: "Metro moves on I-4 and local arterials" },
  { name: "Altamonte Springs", note: "Seminole County hops north" },
  { name: "Casselberry", note: "East Seminole local moves" },
];

const AREA_SERVED = [
  { "@type": "City", name: "Winter Park, FL" },
  { "@type": "AdministrativeArea", name: "Orange County, FL" },
  { "@type": "City", name: "Orlando, FL" },
  { "@type": "City", name: "Maitland, FL" },
  { "@type": "City", name: "Fern Park, FL" },
  { "@type": "City", name: "Baldwin Park, FL" },
  { "@type": "City", name: "Altamonte Springs, FL" },
  { "@type": "City", name: "Casselberry, FL" },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Service-area page — Orlando base address only (no invented Winter Park office).
      "@type": ["MovingCompany", "LocalBusiness"],
      "@id": `${SITE_URL}${HREF}#business`,
      name: `${BUSINESS_NAME} — Winter Park`,
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
        latitude: 28.5999,
        longitude: -81.3392,
      },
      knowsLanguage: ["en", "es"],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      name: "Winter Park moving services",
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
          name: "Winter Park Movers",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function WinterParkMoversPage() {
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
            <p className="city-kicker">movers winter park fl · orange county</p>
            <h1 className="city-h1">Winter Park Movers</h1>
            <p className="city-subline">
              Local, apartment, and full-service moving help in Winter Park, FL,
              with upfront hourly pricing and no hidden fees.
            </p>
            <div className="city-hero-cta">
              <a
                href="/get-my-price"
                data-open-quote
                data-source="winter-park-hero"
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
            <div className="block-eyebrow">local movers winter park</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Winter Park movers with real Central Florida experience
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Toro Movers is a family-owned Central Florida moving company —{" "}
                {GOOGLE_RATING}-star rated on Google, background-checked, and
                bilingual (Hablamos español). We help with moves in and around
                Winter Park every week: older homes near Park Avenue, apartments
                around Rollins College, residential blocks toward Aloma, and short
                hops into{" "}
                <Link href="/orlando-movers">Orlando movers</Link>,{" "}
                <Link href="/maitland-movers">Maitland</Link>,{" "}
                <Link href="/fern-park-movers">Fern Park</Link>, Baldwin Park,
                and{" "}
                <Link href="/altamonte-springs-movers">Altamonte Springs</Link>.
                We are part of the same local network as our{" "}
                <Link href="/central-florida-movers">Central Florida movers</Link>{" "}
                service area — one crew, one hourly model across the metro.
              </p>
              <p className="guide-p">
                We are a service-area mover based in the Orlando metro — not a
                national franchise with a fake storefront on every map pin. When
                you book Toro, you get careful furniture handling, clear hourly
                pricing, a crew that plans for narrow streets and older homes, and
                a simple path to{" "}
                <Link href="/get-my-price">get my free estimate</Link> or call{" "}
                <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>. No fake luxury pitch —
                just professional local service that treats your home and pieces
                with respect.
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
                Best for Winter Park moves like:
              </h3>
              <ul className="tier-bullets">
                <li>
                  Older homes near Park Avenue with careful furniture handling
                </li>
                <li>
                  Apartment moves around Rollins College and Aloma
                </li>
                <li>
                  Local moves between Winter Park and Orlando or Baldwin Park
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
              Winter Park movers built for local moves
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Most Winter Park jobs stay local: one neighborhood to another, a
                move to Orlando proper, or a short hop into Maitland or Fern Park.
                We cover single-family homes, older residences with tight
                staircases, apartments and condos, townhomes, storage loads, and
                full local moves across the metro.
              </p>
              <p className="guide-p">
                Older homes are part of what makes Winter Park distinct — hardwood
                floors, original trim, narrow hallways, and furniture that has
                lived in the house for years. Those moves reward patience: pad
                floors and jambs, take doors off when needed, and carry pieces the
                careful way rather than forcing a corner. Apartment moves still
                get the same discipline — elevator reservations, breezeway turns,
                and loading windows planned before the truck arrives. For
                complex-specific detail, see our{" "}
                <Link href="/apartment-movers-orlando-fl">
                  apartment movers in Orlando
                </Link>{" "}
                page; the same crew covers Winter Park.
              </p>
              <p className="guide-p">
                Storage and labor-only days show up often too: load a POD on a
                narrow street, empty a unit near campus before lease end, or unload
                a U-Haul while you keep the rental contract. Local Winter Park
                customers hire us for flexibility — full-service when they want
                the truck, labor-only when they already have one.
              </p>
              <p className="guide-p">
                Partial moves fit well here as well: furniture only for a
                downsizing, a garage clean-out before listing, or a second trip
                when a complex only allows a short dock window. Tell us what must
                go on day one. Upfront hourly pricing means you pay for the work
                you book — not a package that forces a bigger truck than the job
                needs.
              </p>
            </div>
          </div>
        </section>

        {/* Timing access planning */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">access &amp; logistics</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Moving in Winter Park comes down to timing, access, and parking
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Winter Park sits between I-4, Fairbanks, Aloma, and the surface
                streets that feed Park Avenue. Traffic and event days matter.
                Morning starts usually beat mid-afternoon congestion, and
                weekends near month-end fill first when lease turnovers stack with
                residential closings. Share your preferred date early so we can
                protect a realistic arrival window — not a vague “sometime
                tomorrow.”
              </p>
              <p className="guide-p">
                Access is the real differentiator. Many blocks near Park Avenue
                and Olde Winter Park are narrow, with limited truck staging and
                longer carries from legal parking. Brick driveways and older
                approaches need careful foot traffic. Apartments add elevator
                slots, loading zones with short windows, and property paperwork.
                A good estimate needs those details: stairs vs elevator, street
                width, and any HOA or building rules.
              </p>
              <p className="guide-p">
                We price tight access in time, not a mystery “access fee.” That is
                the opposite of the{" "}
                <Link href="/blog/hidden-moving-fees-orlando">
                  hidden moving fees
                </Link>{" "}
                some customers see with padded flat quotes. Upfront hourly pricing
                keeps the math honest when the carry is longer or the doorway is
                tighter than average.
              </p>
              <p className="guide-p">
                Florida heat and summer storms are real on outdoor carries from
                truck to porch. We bring blankets and wrap as standard so wood and
                fabric stay protected. If your building or HOA needs a certificate
                of insurance or a named arrival window, send those requirements
                when you request your estimate so paperwork is not sorted on the
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
              Winter Park moving services
            </h2>

            <h3 className="guide-h3">Local moving</h3>
            <p className="guide-p">
              Point A to point B inside Winter Park or into neighboring Orlando,
              Maitland, Fern Park, and Baldwin Park. Same crew, same hourly
              structure, same no-surprise fees. Ideal for homes, apartments, and
              mixed local itineraries. Broader coverage is on our{" "}
              <Link href="/central-florida-movers">Central Florida movers</Link>{" "}
              page.
            </p>

            <h3 className="guide-h3">Apartment moving</h3>
            <p className="guide-p">
              Elevators, stairs, breezeways, and move-in windows are everyday work
              for Winter Park movers — especially around campus-adjacent rentals
              and multi-story buildings. We coordinate with property managers when
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
              Small offices, retail turnovers, and suite moves near Park Avenue
              and local commercial strips can be scheduled around your hours. Tell
              us dock access, elevator needs, and after-hours preferences.{" "}
              <Link href="/commercial-movers">Commercial movers</Link> details
              apply the same hourly model.
            </p>

            <div className="city-hero-cta" style={{ marginTop: 28 }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="winter-park-services"
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
              How much do movers cost in Winter Park, FL?
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Winter Park moving cost is almost always an hourly equation: crew
                size × hours on the job (after the minimum), plus whether a truck
                is included. A one-bedroom apartment near campus finishes faster
                than a multi-story older home with a long carry and a packed
                garage. Stairs, elevators, and narrow-street staging add time, not
                a separate line-item fee.
              </p>
              <p className="guide-p">
                Preparation changes the bill more than people expect. Fully packed
                boxes, clear pathways, reserved elevators, and planned truck
                placement cut clock time. Unfinished packing when the crew arrives
                burns hours you pay for. For a deeper look at how{" "}
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
                  Typical factors that affect Winter Park moving time:
                </strong>
              </p>
              <ul className="guide-list">
                <li>
                  A one-bedroom apartment with elevator access may take less time
                  than a third-floor walk-up near campus
                </li>
                <li>
                  Narrow streets near Park Avenue can mean a longer carry from
                  legal parking
                </li>
                <li>
                  Packed boxes and clear walkways can lower the final bill
                </li>
                <li>
                  Larger older homes may be faster with three movers instead of two
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
                stairs or elevator details, street access notes, and move date.
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
                What is included with your Winter Park move?
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
                rental — same careful handling either way.
              </p>
            </div>
          </div>
        </section>

        {/* Local vs franchise */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">why local</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Local Winter Park movers without the franchise runaround
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
                Winter Park&rsquo;s narrow streets, older homes, and apartment
                windows — without the fake boutique language — you are in the right
                place.{" "}
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
                  Moving in Winter Park and nearby areas
                </h2>
              </div>
              <p className="city-lead">
                We serve Winter Park as a service area from our Central Florida
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
              <Link href="/maitland-movers">Maitland movers</Link>
              {" · "}
              <Link href="/fern-park-movers">Fern Park movers</Link>
              {" · "}
              <Link href="/altamonte-springs-movers">Altamonte Springs movers</Link>
            </p>
          </div>
        </section>

        <FaqSection
          items={FAQS}
          heading="Winter Park movers — common questions."
        />

        {/* Local closing CTA only — no generic sitewide ClosingCta (avoids double “Ready when you are”) */}
        <section className="block">
          <div className="block-inner" style={{ textAlign: "center" }}>
            <h2 className="block-h2">Ready to move in Winter Park?</h2>
            <p className="block-sub">
              Get your free estimate in about 60 seconds. Same-week dates may be
              available.
            </p>
            <div className="city-hero-cta" style={{ justifyContent: "center" }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="winter-park-bottom"
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
