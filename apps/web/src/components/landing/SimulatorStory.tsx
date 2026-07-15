import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gauge, ShoppingBag, Wand2 } from "lucide-react";

const pillars = [
  {
    icon: Gauge,
    title: "Breathing room",
    body: "Plan-level health in pesos — not a vibes score. Know if the trip still fits.",
  },
  {
    icon: ShoppingBag,
    title: "Can I afford this?",
    body: "Check a purchase before you swipe. See free-to-spend and daily allowance change.",
  },
  {
    icon: Wand2,
    title: "Find money to cut",
    body: "When it doesn’t fit, get deterministic cost-line tradeoffs — then rebuild the plan.",
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
              Travel budget decision engine
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              ChatGPT can write an itinerary. Rynxpense answers: what happens if I buy this?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Free to spend is honest — optional plans are never silently sacrificed. When you
              need a tradeoff, we show the cost-line cuts first.
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
              Check my trip
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-accent/15 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0B1F2A] p-6 text-white shadow-2xl ring-1 ring-white/10 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                Tokyo · ₱100,000 · 5 days
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Breathing room
                  </p>
                  <p className="font-display text-5xl font-bold tabular-nums">₱10,000</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-300">SAFE</p>
                </div>
                <div className="text-right text-sm text-white/70">
                  <p>
                    Free to spend <span className="font-bold text-white">₱10,000</span>
                  </p>
                  <p>
                    Daily <span className="font-bold text-white">₱2,000</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-white/5 px-4 py-3 text-sm">
                <p className="font-semibold text-orange-200">
                  ¥18,000 shoes · rate 0.38 → ₱6,840
                </p>
                <p className="mt-1 text-white/75">
                  FITS. Free to spend ₱10,000 → ₱3,160. No plans auto-sacrificed.
                </p>
                <p className="mt-2 text-xs text-white/50">
                  Kaya yan. Basta wag ka lang magastos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
