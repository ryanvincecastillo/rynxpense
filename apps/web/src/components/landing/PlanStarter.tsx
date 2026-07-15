import { SearchWidget } from "./SearchWidget";

export function PlanStarter() {
  return (
    <section id="start" className="relative -mt-10 pb-4 sm:-mt-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="animate-fade-up overflow-visible rounded-2xl bg-white/95 p-5 shadow-xl ring-1 ring-black/5 backdrop-blur sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-xl font-bold tracking-tight text-text sm:text-2xl">
              Check if the pesos will stretch
            </h2>
            <p className="mt-1 text-sm text-muted">
              Destination + budget → feasibility score, what-ifs, and a plan you can reshape.
            </p>
          </div>
          <SearchWidget />
        </div>
      </div>
    </section>
  );
}
