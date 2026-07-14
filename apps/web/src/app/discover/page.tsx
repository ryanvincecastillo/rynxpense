import { Header, Footer } from "@/components/landing/Header";
import { DestinationCatalog } from "@/components/discover/DestinationCatalog";

export default function DiscoverPage() {
  return (
    <div className="bg-white">
      <Header variant="solid" />
      <main>
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Destination catalog
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-text sm:text-5xl">
              Browse trips like a travel brochure — pick a peso budget and start planning.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Philippines favorites and Asia classics for DIY travelers. Tap any destination to
              generate a named plan you can share.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <DestinationCatalog />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
