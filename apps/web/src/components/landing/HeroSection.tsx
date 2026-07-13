import { SearchWidget } from "./SearchWidget";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-primary/[0.07] via-background to-accent/[0.06] pb-12 pt-16 sm:pb-16 sm:pt-20 lg:pb-20 lg:pt-24">
      {/* Decorative background — no image, no duplicate text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-10 text-center sm:mb-12">
          <span className="mb-5 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
            AI Trip Budget Planner
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight text-text sm:text-5xl lg:text-6xl">
            Plan your trip.{" "}
            <span className="text-primary">Track every peso.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted sm:mt-6">
            Tell us where you&apos;re going and your budget — get a day-by-day itinerary with
            estimated costs, then track spending on the go.
          </p>
        </div>
        <SearchWidget />
      </div>
    </section>
  );
}
