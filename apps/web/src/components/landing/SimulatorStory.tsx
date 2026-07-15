import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gauge, SlidersHorizontal, Wand2 } from "lucide-react";

const pillars = [
  {
    icon: Gauge,
    title: "Feasibility score",
    body: "Not vibes — deterministic peso math with a clear affordable / tight / over verdict.",
  },
  {
    icon: SlidersHorizontal,
    title: "What-if simulator",
    body: "Drop the budget, add a traveler, shorten days. Score updates instantly.",
  },
  {
    icon: Wand2,
    title: "Make it fit",
    body: "Apply Comfortable, Balanced, or Tipid — the plan rewrites to your pesos.",
  },
];

export function SimulatorStory() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-0">
        <Image
          src="/hero-tokyo.png"
          alt=""
          fill
          className="object-cover object-center opacity-[0.14]"
          sizes="100vw"
          aria-hidden
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-white via-white/92 to-white"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Trip budget simulator
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              ChatGPT can write an itinerary. Rynxpense answers: can you afford it?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Set destination and pesos. Get a feasibility score, pressure-test scenarios,
              then rebuild the trip until it fits — before you book.
            </p>
            <ul className="mt-8 space-y-5">
              {pillars.map((p) => (
                <li key={p.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <p.icon className="h-5 w-5 text-primary" />
                  </span>
                  <span>
                    <span className="block font-display font-bold text-text">{p.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">{p.body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/trips/new"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              Check my trip budget
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Product mock */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-accent/15 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0B1F2A] p-6 text-white shadow-2xl ring-1 ring-white/10 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                Tokyo · 5 days · from Manila
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-6xl font-bold tabular-nums">82</p>
                  <p className="text-sm font-semibold text-emerald-300">
                    Yes — you can afford this trip
                  </p>
                </div>
                <div className="text-right text-sm text-white/70">
                  <p>
                    Projected <span className="font-bold text-white">₱64,800</span>
                  </p>
                  <p>
                    Budget <span className="font-bold text-white">₱70,000</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {[
                  { label: "Flights", status: "watch", amt: "₱29,400" },
                  { label: "Stay", status: "ok", amt: "₱13,800" },
                  { label: "Activities", status: "over", amt: "₱9,850" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-sm"
                  >
                    <span className="text-white/80">{row.label}</span>
                    <span className="font-semibold">{row.amt}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-accent/20 px-4 py-3 text-sm ring-1 ring-accent/30">
                <p className="font-semibold text-orange-200">What if budget → ₱50,000?</p>
                <p className="mt-1 text-white/75">
                  Score drops to 41. Tipid mode shortens to 4 days and cuts 2 paid attractions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
