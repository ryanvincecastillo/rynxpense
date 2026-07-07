import { SearchWidget } from "./SearchWidget";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-8 pt-12">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=900&fit=crop')] bg-cover bg-center opacity-5" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
            AI Trip Budget Planner
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-text sm:text-5xl lg:text-6xl">
            Plan your trip.{" "}
            <span className="text-primary">Track every peso.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Tell us where you&apos;re going and your budget — get a day-by-day itinerary with
            estimated costs, then track spending on the go.
          </p>
        </div>
        <SearchWidget />
      </div>
    </section>
  );
}
