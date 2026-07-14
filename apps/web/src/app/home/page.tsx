import { Header, Footer } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { PlanStarter } from "@/components/landing/PlanStarter";
import { DiyBeats } from "@/components/landing/DiyBeats";
import { DestinationsTease } from "@/components/landing/DestinationsTease";
import { ShareMoment } from "@/components/landing/ShareMoment";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

export default function HomePage() {
  return (
    <div className="bg-[#FFF8F0]">
      <Header />
      <main>
        <HeroSection />
        <PlanStarter />
        <DiyBeats />
        <DestinationsTease />
        <ShareMoment />
        <CtaBanner />
        <WaitlistForm />
      </main>
      <Footer />
    </div>
  );
}
