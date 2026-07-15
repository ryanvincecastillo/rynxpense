import Image from "next/image";
import { Gauge, RefreshCw, Receipt } from "lucide-react";

const beats = [
  {
    icon: Gauge,
    title: "Feasibility first",
    description:
      "A 0–100 score with affordable / tight / over — engine math, not chatbot guesses.",
  },
  {
    icon: RefreshCw,
    title: "What-if + Make it fit",
    description:
      "Change budget, travelers, or days. Apply Tipid / Balanced and the plan rewrites.",
  },
  {
    icon: Receipt,
    title: "Estimated → spent",
    description:
      "Paste real prices, track expenses, then run a budget autopsy after the trip.",
  },
];

export function DiyBeats() {
  return (
    <section id="why" className="relative overflow-hidden py-16 sm:py-20">
      <div className="absolute inset-0">
        <Image
          src="/hero-siargao.png"
          alt=""
          fill
          className="object-cover object-[center_40%] opacity-[0.1]"
          sizes="100vw"
          aria-hidden
        />
        <div aria-hidden className="absolute inset-0 bg-white/90" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Why Rynxpense
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            A trip budget simulator for Filipino travelers
          </h2>
          <p className="mt-3 text-lg text-muted">
            Not another AI itinerary toy. Know if the pesos stretch — then reshape the trip
            until they do.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {beats.map((beat, i) => (
            <div
              key={beat.title}
              className="animate-fade-up rounded-2xl bg-white/95 p-7 shadow-sm ring-1 ring-border backdrop-blur"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <beat.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-text">{beat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{beat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
