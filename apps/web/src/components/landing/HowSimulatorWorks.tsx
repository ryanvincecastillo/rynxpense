import Link from "next/link";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Set destination & pesos",
    body: "Where, when, from which city, and your total budget in ₱.",
  },
  {
    n: "02",
    title: "See breathing room",
    body: "Plan-level health + free-to-spend. Optional plans are never silently sacrificed.",
  },
  {
    n: "03",
    title: "Check purchases & cut",
    body: "Ask “can I afford this?” before you buy. Tradeoffs show cost-line cuts first.",
  },
];

export function HowSimulatorWorks() {
  return (
    <section className="border-y border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            From “can I afford this?” to a decision you can defend
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl bg-white p-7 ring-1 ring-border"
            >
              <span className="font-display text-3xl font-bold text-primary/25">{s.n}</span>
              <h3 className="mt-3 font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>

        <Link
          href="/trips/new"
          className="mt-10 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark"
        >
          Check my trip
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
