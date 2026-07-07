import { Header, Footer } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { DiscoverSection } from "@/components/landing/DestinationCard";
import { HowItWorks, FeaturesSection } from "@/components/landing/HowItWorks";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <DiscoverSection />
        <HowItWorks />
        <FeaturesSection />
        <WaitlistForm />
      </main>
      <Footer />
    </>
  );
}
