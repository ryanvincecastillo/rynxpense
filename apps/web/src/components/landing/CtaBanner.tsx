import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-dark px-8 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/30 blur-3xl"
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold sm:text-4xl">
              Your next trip starts here
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/85">
              Open the planner, enter your destination and budget, and let AI build your
              itinerary. No account. No friction. Just travel smarter.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-accent-dark"
              >
                Start planning free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-8 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/25"
              >
                Explore the app
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
