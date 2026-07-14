import Link from "next/link";
import { Header, Footer } from "@/components/landing/Header";
import { DestinationCatalog } from "@/components/discover/DestinationCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { popularDestinations } from "@rynxpense/ui-tokens";
import { formatCurrency } from "@rynxpense/shared";
import { buildMetadata, absoluteUrl } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Discover DIY trip destinations & peso budgets",
  description:
    "Browse Philippines and Asia DIY trip ideas with sample peso budgets — El Nido, Boracay, Tokyo, Seoul, Bali, and more. Tap a destination to build a shareable plan.",
  path: "/discover",
  image: "/hero-elnido.png",
});

const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Rynxpense DIY destination catalog",
  itemListElement: popularDestinations.map((dest, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: `${dest.name}, ${dest.country}`,
    url: absoluteUrl(
      `/trips/new?destination=${encodeURIComponent(dest.name)}&budget=${dest.budgetFrom}`,
    ),
    description: dest.blurb,
  })),
};

export default function DiscoverPage() {
  return (
    <div className="bg-white">
      <JsonLd data={itemListLd} />
      <Header variant="solid" />
      <main>
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Destination catalog
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-text sm:text-5xl">
              Browse DIY trips like a travel brochure — pick a peso budget and start
              planning.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Philippines favorites and Asia classics for DIY travelers. Tap any destination
              to generate a named plan you can share.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <DestinationCatalog />
          </div>
        </section>

        {/* Server-rendered for crawlers + internal links (catalog is client-filtered) */}
        <section className="border-t border-border bg-background/60 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
              All destinations
            </h2>
            <p className="mt-2 max-w-2xl text-muted">
              Quick links to start a DIY plan with a sample peso budget.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {popularDestinations.map((dest) => (
                <li key={dest.id}>
                  <Link
                    href={`/trips/new?destination=${encodeURIComponent(dest.name)}&budget=${dest.budgetFrom}`}
                    className="block rounded-xl bg-white px-4 py-3 ring-1 ring-border transition hover:ring-primary/40"
                  >
                    <span className="font-display font-semibold text-text">
                      {dest.name}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {dest.country} · from {formatCurrency(dest.budgetFrom)} / {dest.days}{" "}
                      days
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
