import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/landing/Header";
import { DestinationCatalog } from "@/components/discover/DestinationCatalog";

export default function DiscoverPage() {
  return (
    <div className="bg-white">
      <Header variant="solid" />
      <main>
        <section className="relative overflow-hidden border-b border-border bg-[#062018] text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-55"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(2,131,223,0.4), transparent 42%), radial-gradient(circle at 85% 75%, rgba(255,87,34,0.25), transparent 38%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-[#A7F3D0]">
              Destinations
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Browse DIY trips. Pick a peso budget.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
              Filter by style, region, and budget — then start a named plan you can share.
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
