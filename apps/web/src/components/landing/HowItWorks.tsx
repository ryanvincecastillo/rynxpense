import { Map, Receipt, Share2 } from "lucide-react";

const steps = [
  {
    icon: Map,
    title: "Plan with AI",
    description:
      "Enter your destination, dates, and budget. Our AI builds a day-by-day itinerary with estimated costs.",
  },
  {
    icon: Receipt,
    title: "Track spending",
    description:
      "Log expenses during your trip and see how you're doing against your planned budget in real time.",
  },
  {
    icon: Share2,
    title: "Share your trip",
    description:
      "Send a link to friends or family so they can see your itinerary and budget breakdown.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">How it works</h2>
          <p className="mt-2 text-muted">Three steps to a stress-free trip</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="mb-2 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                Step {i + 1}
              </span>
              <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
              <p className="text-sm text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">
            Everything you need for trip budgeting
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <FeatureMock
            title="Day-by-day itinerary"
            items={[
              { time: "09:00", name: "Senso-ji Temple", cost: "₱500" },
              { time: "12:00", name: "Ramen lunch in Asakusa", cost: "₱800" },
              { time: "15:00", name: "Tokyo Skytree", cost: "₱1,200" },
            ]}
          />
          <FeatureMock
            title="Budget breakdown"
            items={[
              { time: "Flights", name: "Round trip estimate", cost: "₱25,000" },
              { time: "Hotel", name: "4 nights", cost: "₱18,000" },
              { time: "Food & activities", name: "Daily average", cost: "₱22,000" },
            ]}
            isBudget
          />
          <FeatureMock
            title="Expense tracking"
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
}: {
  title: string;
  items: { time: string; name: string; cost: string }[];
  isBudget?: boolean;
  isTracker?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
      <div className="border-b border-border bg-primary/5 px-5 py-4">
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
