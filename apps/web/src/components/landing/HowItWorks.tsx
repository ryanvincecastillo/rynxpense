import Link from "next/link";
import { Wallet, Map, Scale, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Set destination & budget",
    description:
      "Tell us where you’re going, when, and how many pesos you have — no account needed.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Map,
    title: "Get a named plan",
    description:
      "AI builds a day-by-day itinerary with real stays, food spots, and activities in PHP.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Scale,
    title: "Reality check & track",
    description:
      "See if it fits (flights included). Track spending on the trip so nothing surprises you.",
    color: "bg-primary/10 text-primary",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Not another booking app
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
            From “can we afford it?” to a clear peso plan
          </h2>
          <p className="mt-3 text-muted">
            Klook sells tickets. Rynxpense answers the question before you book: does this
            trip fit your budget?
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="animate-fade-up relative overflow-hidden rounded-2xl bg-background p-8 ring-1 ring-border"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}
              >
                <step.icon className="h-7 w-7" />
              </div>
              <span className="mb-2 inline-block text-xs font-bold uppercase tracking-wider text-accent">
                Step {i + 1}
              </span>
              <h3 className="mb-2 font-display text-lg font-bold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark"
          >
            Plan my trip
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">
            What you get that booking apps skip
          </h2>
          <p className="mt-2 text-muted">
            A named plan, peso math, and a shareable inspiration board — before checkout.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <FeatureMock
            title="Named itinerary"
            accent="border-primary"
            items={[
              { time: "Day 1", name: "Senso-ji + Nakamise Street", cost: "₱800" },
              { time: "Stay", name: "Shinjuku Granbell Hotel", cost: "₱3,900" },
              { time: "Food", name: "Tsukiji Outer Market", cost: "₱650" },
            ]}
            isBudget
          />
          <FeatureMock
            title="Inspiration board"
            accent="border-accent"
            items={[
              { time: "AI pick", name: "Ichiran Ramen Shibuya", cost: "~₱450" },
              { time: "AI pick", name: "teamLab Borderless", cost: "~₱1,800" },
              { time: "AI pick", name: "Hotel Gracery Shinjuku", cost: "~₱4,200/night" },
            ]}
          />
          <FeatureMock
            title="Reality check"
            accent="border-warning"
            items={[
              { time: "Flights", name: "MNL → NRT round-trip", cost: "₱22,000" },
              { time: "Plan total", name: "Stay + food + activities", cost: "₱68,400" },
              { time: "Verdict", name: "Fits ₱80k budget", cost: "✓" },
            ]}
            isTracker
          />
        </div>
      </div>
    </section>
  );
}

function FeatureMock({
  title,
  items,
  isBudget,
  isTracker,
  accent,
}: {
  title: string;
  items: { time: string; name: string; cost: string }[];
  isBudget?: boolean;
  isTracker?: boolean;
  accent: string;
}) {
  return (
    <div
      className={`animate-fade-up overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 border-t-4 ${accent}`}
    >
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-display font-bold text-text">{title}</h3>
      </div>
      <div className="p-5">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between border-b border-border py-3 last:border-0"
          >
            <div>
              <p className="text-xs font-medium text-primary">{item.time}</p>
              <p className="text-sm font-medium">{item.name}</p>
            </div>
            <span
              className={`text-sm font-bold ${
                isTracker && item.time === "Verdict"
                  ? "text-success"
                  : isBudget
                    ? "text-primary"
                    : "text-text"
              }`}
            >
              {item.cost}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
