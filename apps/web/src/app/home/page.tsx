import { Header, Footer } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { PlanStarter } from "@/components/landing/PlanStarter";
import { DiyBeats } from "@/components/landing/DiyBeats";
import { DestinationsTease } from "@/components/landing/DestinationsTease";
import { ShareMoment } from "@/components/landing/ShareMoment";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Rynxpense — DIY trip planner in pesos for Filipino travelers",
  description:
    "Plan the trip yourself and know the pesos before you book. Free AI DIY itineraries with named stays, food, and activities — shareable to Facebook, X, and chats.",
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
    "DIY trip planner for Filipino travelers with peso budgets and shareable itineraries.",
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
    "Free DIY trip budget planner for Filipino travelers. Destination + peso budget in, named plan out.",
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
