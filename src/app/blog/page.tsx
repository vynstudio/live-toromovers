import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ClosingCta } from "@/components/closing-cta";
import { GUIDES } from "@/lib/guides";

const TITLE = "Orlando Moving Guides";
const DESCRIPTION =
  "Practical local moving guides for Orlando and Central Florida — how to prepare, what to pack, and what to expect on move day. From Toro Movers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "en_US" },
};

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <section className="city-hero">
          <div className="city-hero-inner">
            <p className="city-kicker">guides</p>
            <h1 className="city-h1">Orlando Moving Guides</h1>
            <p className="city-subline">
              Straight, local advice for moving in Orlando and Central Florida —
              from a family-owned crew that does it every week.
            </p>
          </div>
        </section>

        <section className="block">
          <div className="block-inner">
            <p className="block-lead">
              Moving in Central Florida comes with its own rules — summer heat,
              hurricane season, HOA and elevator reservations, and apartment
              complexes with tight move-in windows. These guides come straight
              from the Toro Movers crew, who load and unload across Orlando,
              Kissimmee, Clermont, Sanford, and the surrounding counties every
              week. Each one is written to help you plan ahead, pack smarter,
              avoid the common surprises that blow up a moving-day budget, and
              walk into your quote already knowing what to expect — no upsells,
              just the same honest, up-front advice we give our own customers on
              the phone.
            </p>
            <div className="city-others">
              {GUIDES.map((g) => (
                <Link key={g.slug} href={g.href} className="city-other">
                  <span className="city-other-url">{g.readMins} min read</span>
                  <h2 className="city-other-name">{g.h1}</h2>
                  <p className="city-other-desc">{g.metadata.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ClosingCta />
        <Footer />
      </main>
    </>
  );
}
