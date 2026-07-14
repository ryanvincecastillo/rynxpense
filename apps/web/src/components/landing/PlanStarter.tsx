import { SearchWidget } from "./SearchWidget";

export function PlanStarter() {
  return (
    <section id="start" className="relative -mt-8 pb-6 sm:-mt-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="animate-fade-up rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 sm:p-6">
          <div className="mb-4 text-center sm:text-left">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">
              Start with where and how much
            </h2>
            <p className="mt-1 text-sm text-muted">
              Set destination, dates, and budget — AI builds your named plan in pesos.
            </p>
          </div>
          <SearchWidget />
        </div>
      </div>
    </section>
  );
}
