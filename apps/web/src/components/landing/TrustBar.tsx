import { Shield, Zap, UserX } from "lucide-react";

const items = [
  {
    icon: UserX,
    title: "No account needed",
    description: "Start planning instantly — sign in only if you want to sync across devices.",
  },
  {
    icon: Zap,
    title: "AI in seconds",
    description: "Get a full day-by-day itinerary with peso estimates in under a minute.",
  },
  {
    icon: Shield,
    title: "Free to use",
    description: "Plan trips, track expenses, and share — no credit card, no hidden fees.",
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-white py-8">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-3 sm:px-6">
        {items.map((item, i) => (
          <div
            key={item.title}
            className="animate-fade-up flex items-start gap-4"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-text">{item.title}</h3>
              <p className="mt-0.5 text-sm text-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
