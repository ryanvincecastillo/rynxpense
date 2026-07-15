import { Header, Footer } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { PlanStarter } from "@/components/landing/PlanStarter";
import { SimulatorStory } from "@/components/landing/SimulatorStory";
import { DiyBeats } from "@/components/landing/DiyBeats";
import { HowSimulatorWorks } from "@/components/landing/HowSimulatorWorks";
import { DestinationsTease } from "@/components/landing/DestinationsTease";
import { ShareMoment } from "@/components/landing/ShareMoment";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Rynxpense — Trip Budget Simulator for Filipino travelers",
  description:
    "Can you afford the trip? Get a peso feasibility score, run what-ifs, make the plan fit, then track estimated vs spent. Free — no account needed.",
  path: "/home",
  image: "/og-banner.png",
  absoluteTitle: true,
});

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Trip budget simulator for Filipino travelers — feasibility score, what-ifs, and make-it-fit plans in pesos.",
  inLanguage: "en-PH",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/trips/new?destination={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const appLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "TravelApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "PHP",
  },
  url: absoluteUrl("/home"),
  description:
    "Free trip budget simulator for Filipino travelers. Feasibility score, scenarios, and peso plans you can share.",
};

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/icon.png"),
  email: "hello@rynxpense.com",
  sameAs: [],
};

export default function HomePage() {
  return (
    <div className="bg-white">
      <JsonLd data={[websiteLd, appLd, orgLd]} />
      <Header />
      <main>
        <HeroSection />
        <PlanStarter />
        <SimulatorStory />
        <HowSimulatorWorks />
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
