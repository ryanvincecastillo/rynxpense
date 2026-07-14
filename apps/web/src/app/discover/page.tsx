import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/landing/Header";
import { DestinationCatalog } from "@/components/discover/DestinationCatalog";

export default function DiscoverPage() {
  return (
    <>
      <Header variant="solid" />
      <main>
        <section className="relative overflow-hidden border-b border-border bg-[#041824] text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(2,131,223,0.45), transparent 40%), radial-gradient(circle at 85% 70%, rgba(255,87,34,0.28), transparent 35%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              Destinations
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-5xl">
              Browse trips. Pick a budget. Get a named plan.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
              Same Rynxpense flow as home — filter destinations by style, region, and
              peso budget, then start planning.
            </p>
            <Link
              href="/trips/new"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7DD3FC] transition hover:text-white"
            >
              Or plan any destination freeform
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="bg-background py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <DestinationCatalog />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
