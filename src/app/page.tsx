import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { TrustBand } from "@/components/trust-band";
import { Services } from "@/components/services";
import { EditorialQuote } from "@/components/editorial-quote";
import { Process } from "@/components/process";
import { Areas } from "@/components/areas";
import { FeatureQuote } from "@/components/feature-quote";
import { Faq } from "@/components/faq";
import { ClosingCta } from "@/components/closing-cta";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <TrustBand />
      <Services />
      <EditorialQuote />
      <Process />
      <Areas />
      <FeatureQuote />
      <Faq />
      <ClosingCta />
      <Footer />
      <StickyCta />
    </>
  );
}
