import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { EditorialQuote } from "@/components/editorial-quote";
import { Services } from "@/components/services";
import { Process } from "@/components/process";
import { Areas } from "@/components/areas";
import { FeatureQuote } from "@/components/feature-quote";
import { Faq } from "@/components/faq";
import { ClosingCta } from "@/components/closing-cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Marquee />
      <EditorialQuote />
      <Services />
      <Process />
      <Areas />
      <FeatureQuote />
      <Faq />
      <ClosingCta />
      <Footer />
    </>
  );
}
