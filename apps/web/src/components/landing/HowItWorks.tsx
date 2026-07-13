import Link from "next/link";
import { Map, Receipt, Share2, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Map,
    title: "Plan with AI",
    description:
      "Enter your destination, dates, and budget. Our AI builds a day-by-day itinerary with estimated costs.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Receipt,
    title: "Track spending",
    description:
      "Log expenses during your trip and see how you're doing against your planned budget in real time.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Share2,
    title: "Share your trip",
    description:
      "Send a link to friends or family so they can see your itinerary and budget breakdown.",
    color: "bg-primary/10 text-primary",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Simple as 1-2-3
          </span>
          <h2 className="mt-2 text-2xl font-bold text-text sm:text-3xl">How it works</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Three steps to a stress-free trip — start instantly, no account needed
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
                aria-hidden
                className="absolute -right-4 -top-4 text-7xl font-black text-primary/[0.04]"
              >
                {i + 1}
              </div>
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${step.color} transition group-hover:scale-110`}
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
            Try it now — it&apos;s free
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
            Everything you need for trip budgeting
          </h2>
          <p className="mt-2 text-muted">Built for real travelers, priced in pesos</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <FeatureMock
            title="Day-by-day itinerary"
            accent="border-primary"
            items={[
              { time: "09:00", name: "Senso-ji Temple", cost: "₱500" },
              { time: "12:00", name: "Ramen lunch in Asakusa", cost: "₱800" },
              { time: "15:00", name: "Tokyo Skytree", cost: "₱1,200" },
            ]}
          />
          <FeatureMock
            title="Budget breakdown"
            accent="border-accent"
            items={[
              { time: "Flights", name: "Round trip estimate", cost: "₱25,000" },
              { time: "Hotel", name: "4 nights", cost: "₱18,000" },
              { time: "Food & activities", name: "Daily average", cost: "₱22,000" },
            ]}
            isBudget
          />
          <FeatureMock
            title="Expense tracking"
            accent="border-success"
            items={[
              { time: "Spent", name: "Day 1 total", cost: "₱4,200" },
              { time: "Remaining", name: "Of ₱80,000 budget", cost: "₱75,800" },
              { time: "Status", name: "On track", cost: "✓" },
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
                isTracker && item.time === "Status"
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
