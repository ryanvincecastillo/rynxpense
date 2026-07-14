import Link from "next/link";
import { Pin, Map, Receipt, Share2, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Pin,
    title: "Save your inspo",
    description:
      "Paste TikTok, Instagram, Reddit, or Facebook links — or type what you saw. Build your mood board in one place.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Map,
    title: "Get a peso plan",
    description:
      "AI turns your saves into a day-by-day plan with named hotels, restaurants, and activities — priced in PHP.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Receipt,
    title: "Reality check & track",
    description:
      "See if the plan fits your budget (flights included). Track spending during the trip so nothing surprises you.",
    color: "bg-primary/10 text-primary",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Not another booking app
          </span>
          <h2 className="mt-2 text-2xl font-bold text-text sm:text-3xl">
            From scattered saves to one clear plan
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-muted">
            Klook sells tickets. Rynxpense answers: &quot;We saw it on TikTok — can we afford it?&quot;
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="group animate-fade-up relative overflow-hidden rounded-2xl bg-background p-8 ring-1 ring-border transition hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}
              >
                <step.icon className="h-7 w-7" />
              </div>
              <span className="mb-2 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                Step {i + 1}
              </span>
              <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-md transition hover:bg-primary-dark"
          >
            Start with your saves
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
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">
            What you get that Klook doesn&apos;t
          </h2>
          <p className="mt-2 text-muted">Your inspiration, your budget, your peso math</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <FeatureMock
            title="Inspiration inbox"
            accent="border-accent"
            items={[
              { time: "TikTok", name: "Ichiran Ramen Shibuya", cost: "~₱450" },
              { time: "IG", name: "teamLab Borderless", cost: "~₱1,800" },
              { time: "Reddit", name: "Hotel Gracery Shinjuku", cost: "~₱4,200/night" },
            ]}
          />
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
            title="Reality check"
            accent="border-warning"
            items={[
              { time: "Flights", name: "MNL → NRT round-trip", cost: "₱22,000" },
              { time: "Plan total", name: "Inspo + itinerary", cost: "₱68,400" },
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
      className={`animate-fade-up overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl border-t-4 ${accent}`}
    >
      <div className="border-b border-border bg-gradient-to-r from-primary/[0.04] to-transparent px-5 py-4">
        <h3 className="font-bold text-text">{title}</h3>
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
