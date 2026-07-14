import { Header, Footer } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { PlanStarter } from "@/components/landing/PlanStarter";
import { TrustBar } from "@/components/landing/TrustBar";
import { DestinationMarquee } from "@/components/landing/DestinationMarquee";
import { HowItWorks, FeaturesSection } from "@/components/landing/HowItWorks";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <PlanStarter />
        <TrustBar />
        <DestinationMarquee />
        <HowItWorks />
        <FeaturesSection />
        <CtaBanner />
        <WaitlistForm />
      </main>
      <Footer />
    </>
  );
}
