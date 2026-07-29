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
const HREF = "/kissimmee-movers";

const TITLE = "Kissimmee Movers | Local Moving Company | Toro Movers";
const DESCRIPTION =
  "Need movers in Kissimmee, FL? Toro Movers handles local moves, apartments, packing, and labor-only moving with upfront hourly pricing.";

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
    q: "How much do movers cost in Kissimmee, FL?",
    a: "Moving costs in Kissimmee depend on crew size, home size, access (stairs, elevators, HOA gates, long carries), packing readiness, and how long the job takes. Toro Movers uses upfront hourly pricing with no fuel surcharges, stair fees, or material fees — so you know the rate and minimum before move day.",
  },
  {
    q: "Do you move apartments in Kissimmee?",
    a: "Yes. Apartment and condo moves are a core job type around downtown Kissimmee, Buenaventura Lakes, Storey Lake, and the US-192 corridor. We work with elevator windows, loading zones, parking rules, and property managers so move-in day stays on schedule.",
  },
  {
    q: "Do you charge extra for stairs or elevators?",
    a: "No separate stair or elevator fee. Toro bills by the hour, so a walk-up or slow elevator simply adds time on the clock. Furniture blankets, shrink wrap, and basic assembly/disassembly are included — no surprise material fees.",
  },
  {
    q: "Can you move me from Kissimmee to Orlando?",
    a: "Yes. Local moves between Kissimmee and Orlando (and nearby areas like Hunters Creek, St. Cloud, Davenport, and Celebration) are a regular part of our week. Same upfront hourly pricing across Central Florida.",
  },
  {
    q: "Do you offer labor-only moving help in Kissimmee?",
    a: "Yes. If you already have a U-Haul, POD, rental truck, or storage container, Toro provides labor-only loading and unloading help by the hour — same background-checked, bilingual crew and included protection materials.",
  },
  {
    q: "¿Tienen cuadrilla bilingüe en Kissimmee?",
    a: "Sí — our Kissimmee crews are fully bilingual (English / Spanish). We can quote, schedule, and run your whole move in either language. Hablamos español.",
  },
  {
    q: "Can you handle vacation-rental or furnished-home turnovers near the parks?",
    a: "Yes. Kissimmee has a high volume of short-term and furnished rentals near the theme-park corridor. We handle fast turnovers on furnished homes as carefully as a family move — by the hour, with blankets and wrap included.",
  },
  {
    q: "How far in advance should I book movers in Kissimmee?",
    a: "Book one to two weeks ahead when you can, especially for weekends, month-end lease turnovers, and peak tourist-season days when parking near US-192 is tight. Same-week scheduling is often available — call (689) 600-2720 or request an estimate online and we’ll tell you what’s open.",
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
  { name: "Downtown Kissimmee", note: "Apartments, older streets, tight parking" },
  { name: "Buenaventura Lakes", note: "Family homes and local apartment moves" },
  { name: "Celebration", note: "HOA gates, planned community access rules" },
  { name: "Poinciana", note: "Longer local hops and growing neighborhoods" },
  { name: "Storey Lake", note: "Resort-style communities and rentals" },
  { name: "US-192 corridor", note: "Condos, hotels, and short-term rentals" },
  { name: "Hunters Creek", note: "Neighbor corridor toward south Orlando" },
  { name: "St. Cloud", note: "East Osceola homes and local moves" },
  { name: "Davenport", note: "West corridor growth and resort homes" },
  { name: "Orlando", note: "Metro moves on I-4, Turnpike, and 417" },
  { name: "Lake Tohopekaliga area", note: "Lakeside homes and residential access" },
];

const AREA_SERVED = [
  { "@type": "City", name: "Kissimmee, FL" },
  { "@type": "AdministrativeArea", name: "Osceola County, FL" },
  { "@type": "City", name: "St. Cloud, FL" },
  { "@type": "City", name: "Davenport, FL" },
  { "@type": "City", name: "Orlando, FL" },
  { "@type": "City", name: "Celebration, FL" },
  { "@type": "City", name: "Poinciana, FL" },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Service-area page — Orlando base address only (no invented Kissimmee office).
      "@type": ["MovingCompany", "LocalBusiness"],
      "@id": `${SITE_URL}${HREF}#business`,
      name: `${BUSINESS_NAME} — Kissimmee`,
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
        latitude: 28.292,
        longitude: -81.4076,
      },
      knowsLanguage: ["en", "es"],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      name: "Kissimmee moving services",
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
          name: "Kissimmee Movers",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function KissimmeeMoversPage() {
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
            <p className="city-kicker">movers kissimmee fl · osceola county</p>
            <h1 className="city-h1">Kissimmee Movers</h1>
            <p className="city-subline">
              Local, apartment, vacation-rental, and full-service moving help in
              Kissimmee, FL, with upfront hourly pricing and no hidden fees.
            </p>
            <div className="city-hero-cta">
              <a
                href="/get-my-price"
                data-open-quote
                data-source="kissimmee-hero"
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
            <div className="block-eyebrow">local movers kissimmee</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              Kissimmee movers with real Central Florida experience
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Toro Movers is a family-owned Central Florida moving company —{" "}
                {GOOGLE_RATING}-star rated on Google, background-checked, and
                bilingual (Hablamos español). We help with moves in and around
                Kissimmee every week: downtown apartments, Buenaventura Lakes
                homes, Celebration HOAs, Poinciana growth neighborhoods, Storey
                Lake and US-192 vacation rentals, and Osceola-to-metro hops toward{" "}
                <Link href="/orlando-movers">Orlando movers</Link>,{" "}
                <Link href="/st-cloud-movers">St. Cloud</Link>,{" "}
                <Link href="/davenport-movers">Davenport</Link>, and Hunters
                Creek. We are part of the same local network as our{" "}
                <Link href="/central-florida-movers">Central Florida movers</Link>{" "}
                service area — one crew, one hourly model across the metro.
              </p>
              <p className="guide-p">
                Kissimmee is not a one-type town. Long-time families, Spanish-speaking
                households, theme-park corridor rentals, and new-build communities all
                move on different calendars. A bilingual crew that already knows gate
                codes, loading zones, and 192 traffic is the difference between a clean
                day and a job that burns hours at the curb. When you book Toro, you get
                clear hourly pricing, a crew that shows up prepared, and a simple path
                to{" "}
                <Link href="/get-my-price">get my free estimate</Link> or call{" "}
                <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>.
              </p>
              <p className="guide-p">
                We are a service-area mover based in the Orlando metro — not a
                national franchise with a fake storefront on every map pin. Same-week
                scheduling is often available. Furniture blankets, shrink wrap,
                dollies, equipment, and basic assembly/disassembly are included. No
                fuel surcharges. No stair fees. No material fees. The clock starts when
                we work — and stops when the job is done.
              </p>
            </div>

            <div className="tier" style={{ marginTop: 28 }}>
              <h3 className="tier-title" style={{ marginBottom: 12 }}>
                Best for Kissimmee moves like:
              </h3>
              <ul className="tier-bullets">
                <li>
                  Apartment and condo moves near downtown or the 192 corridor
                </li>
                <li>
                  Family home moves between Kissimmee and Orlando
                </li>
                <li>
                  Vacation-rental and furnished-home turnovers near the parks
                </li>
                <li>
                  Loading or unloading a U-Haul, POD, or storage unit
                </li>
                <li>
                  Moves to or from St. Cloud, Davenport, Hunters Creek, and
                  Celebration
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
              Kissimmee movers built for apartments, rentals, storage, and family
              homes
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Most Kissimmee jobs are local: one community to another, Kissimmee
                to Orlando, or a short Osceola hop into St. Cloud or toward Davenport.
                We cover apartment moves, condo moves, townhomes, single-family homes,
                vacation-rental turnovers, storage unit loads, and full local moves
                between Kissimmee and the wider metro.
              </p>
              <p className="guide-p">
                Apartments and mid-rise buildings along the tourist corridor and near
                downtown add elevator reservations, tight breezeways, and property-manager
                windows. Garden-style complexes still mean long carries from visitor
                lots when loading zones fill up. Home moves still get the same
                protection: blankets, careful carries, and basic bed and table
                disassembly when the stairs demand it. If you&rsquo;re comparing
                options, start with our{" "}
                <Link href="/apartment-movers-orlando-fl">
                  apartment movers in Orlando
                </Link>{" "}
                page for complex-specific detail, then book the same crew for
                Kissimmee.
              </p>
              <p className="guide-p">
                Vacation rentals and short-term furnished homes near the parks are a
                Kissimmee specialty demand — not a side note. Fast turnovers, dense
                furniture loads, and HOA or management check-in rules require a crew
                that works clean and stays on the clock honestly. Families relocating
                Kissimmee ↔ Orlando get the same bilingual coordination: inventory,
                access notes, and a realistic arrival window in English or Spanish.
              </p>
              <p className="guide-p">
                Storage moves and labor-only days are common too: load a POD in a
                complex lot, empty a unit before lease end, stage furniture into
                self-storage while a home closes, or unload a U-Haul at a new address
                while you keep the truck contract. Local movers Kissimmee customers
                hire us for flexibility — full-service when you want the truck,
                labor-only when you already have one.
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
              Moving in Kissimmee comes down to timing, access, and parking
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Kissimmee sits at the crossroads of US-192, Florida&rsquo;s Turnpike,
                and easy links to I-4 and SR 417. Traffic windows matter — especially
                near the theme-park corridor and weekend tourist peaks. Morning starts
                usually beat afternoon congestion, and month-end lease turnovers fill
                first. Tell us your preferred date early so we can protect a realistic
                arrival window — not a vague &ldquo;sometime tomorrow.&rdquo;
              </p>
              <p className="guide-p">
                Apartment complexes add another layer: elevator booking slots, loading
                zones that only hold a truck for a short window, long carries from
                visitor parking, and rules about where pads and carts can go. Celebration
                and other planned communities add HOA gates and guest-list rules.
                Vacation rentals may need management notice or a narrow check-in
                window. A good estimate needs those details. When you request a quote,
                share floor number, elevator vs walk-up, gate instructions, and any
                building paperwork so the hourly plan matches the real day.
              </p>
              <p className="guide-p">
                Parking access on townhome streets, resort-style drives, and strip-center
                edge lots can mean a longer carry. We price that in time, not a mystery
                &ldquo;access fee.&rdquo; That is the opposite of the{" "}
                <Link href="/blog/hidden-moving-fees-orlando">
                  hidden moving fees
                </Link>{" "}
                some customers run into with padded flat quotes. Upfront hourly
                pricing keeps the math honest when access is tight.
              </p>
              <p className="guide-p">
                Rain delays and Florida heat are real on outdoor carries from the
                truck to a third-floor breezeway or a long resort driveway. We bring
                blankets and wrap as standard so wood and fabric are protected while
                we work. If your complex or HOA requires a certificate of insurance or
                a named arrival window, send those requirements when you request your
                estimate so we are not sorting paperwork on the curb.
              </p>
              <p className="guide-p">
                Moves between Kissimmee and Hunters Creek, south Orlando, St. Cloud, or
                Davenport are routine local work — not &ldquo;long distance&rdquo;
                theater. Share both addresses and any stop at a storage unit so we
                staff the right crew size the first time.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">services</div>
            <h2 className="block-h2" style={{ marginBottom: 28 }}>
              Kissimmee moving services
            </h2>

            <h3 className="guide-h3">Local moving</h3>
            <p className="guide-p">
              Point A to point B inside Osceola County or into Orange County —
              including Kissimmee to Orlando on I-4, the Turnpike, or 417. Same
              crew, same hourly structure, same no-surprise fees. Ideal for
              apartments, houses, vacation rentals, and mixed local itineraries.
            </p>

            <h3 className="guide-h3">Apartment moving</h3>
            <p className="guide-p">
              Elevators, stairs, breezeways, and move-in windows are everyday work
              for our Kissimmee movers. We coordinate with property managers when you
              give us the rules, protect walls and floors on tight turns, and keep
              the load moving so you stay inside your slot. See also{" "}
              <Link href="/apartment-movers-orlando-fl">
                apartment movers in Orlando
              </Link>
              .
            </p>

            <h3 className="guide-h3">Vacation rental &amp; furnished moves</h3>
            <p className="guide-p">
              Short-term rentals near the parks need speed without sloppy handling.
              We load dense furniture sets, protect mattresses and wood, and work
              within turnover windows when you share the schedule. Same bilingual
              crew and hourly model as a standard residential move.
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
              Small offices, retail turnovers, and suite moves along US-192 and near
              downtown can be scheduled around your hours. Tell us dock access,
              elevator needs, and after-hours preferences.{" "}
              <Link href="/commercial-movers">Commercial movers</Link> details
              apply the same hourly model.
            </p>

            <div className="city-hero-cta" style={{ marginTop: 28 }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="kissimmee-services"
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
              How much do movers cost in Kissimmee, FL?
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Kissimmee moving cost is almost always an hourly equation: crew
                size × hours on the job (after the minimum), plus whether a truck is
                included. A studio walk-up near downtown finishes faster than a
                three-bedroom house in Buenaventura Lakes with a packed garage and a
                long driveway. Stairs, elevators, HOA gates, and long carries add
                time, not a separate line-item fee.
              </p>
              <p className="guide-p">
                Preparation changes the bill more than people expect. Fully packed
                boxes, clear pathways, reserved elevators, and ready gate codes cut
                clock time. Unfinished packing when the crew arrives burns hours you
                pay for. For a deeper look at how{" "}
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
                  Typical factors that affect Kissimmee moving time:
                </strong>
              </p>
              <ul className="guide-list">
                <li>
                  A one-bedroom apartment with elevator access may take less time
                  than a third-floor walk-up
                </li>
                <li>
                  A reserved loading area can reduce long-carry time on busy
                  complexes and resort streets
                </li>
                <li>
                  Packed boxes and clear walkways can lower the final bill
                </li>
                <li>
                  Larger homes and dense vacation-rental furniture sets may be
                  faster with three movers instead of two
                </li>
                <li>
                  HOA gate delays or missing COI paperwork can add idle time
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
                stairs or elevator details, gate or HOA notes, and move date. Toro
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
                What is included with your Kissimmee move?
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
              Local Kissimmee movers without the franchise runaround
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
                rates, no fuel games, no stair &ldquo;surcharges,&rdquo; and materials
                already in the rate mean you can compare apples to apples.
                Background-checked movers and a bilingual team (Hablamos español) are
                standard — not upsells. In Kissimmee, bilingual support is everyday
                service for families and rental managers who prefer Spanish end to
                end. Same-week scheduling exists because we work this metro full time,
                not because a franchise sold a lead to whoever is free.
              </p>
              <p className="guide-p">
                If you want{" "}
                <Link href="/orlando-movers">Orlando movers</Link> who also know
                Kissimmee&rsquo;s apartment rules, 192 traffic, Celebration gates,
                and St. Cloud / Davenport corridors, you are in the right place.{" "}
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
                  Moving in Kissimmee and nearby areas
                </h2>
              </div>
              <p className="city-lead">
                We serve Kissimmee as a service area from our Central Florida
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
              <Link href="/orlando-movers">Orlando movers</Link>
              {" · "}
              <Link href="/st-cloud-movers">St. Cloud movers</Link>
              {" · "}
              <Link href="/davenport-movers">Davenport movers</Link>
            </p>
          </div>
        </section>

        <FaqSection
          items={FAQS}
          heading="Kissimmee movers — common questions."
        />

        {/* Local closing CTA only — no generic sitewide ClosingCta (avoids double “Ready when you are”) */}
        <section className="block">
          <div className="block-inner" style={{ textAlign: "center" }}>
            <h2 className="block-h2">Ready to move in Kissimmee?</h2>
            <p className="block-sub">
              Get your free estimate in about 60 seconds. Same-week dates may be
              available. Hablamos español.
            </p>
            <div className="city-hero-cta" style={{ justifyContent: "center" }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="kissimmee-bottom"
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
