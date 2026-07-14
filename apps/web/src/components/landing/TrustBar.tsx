import { Map, Scale, Sparkles } from "lucide-react";

const items = [
  {
    icon: Map,
    title: "Named peso plan",
    description:
      'Real hotels, restaurants, and activities — priced in PHP, not generic "sightseeing."',
  },
  {
    icon: Scale,
    title: "Budget reality check",
    description:
      "See if the trip fits before you book — flights and hotels included in the math.",
  },
  {
    icon: Sparkles,
    title: "Inspiration from the plan",
    description:
      "AI curates a shareable mood board from your itinerary — stays, food, and spots.",
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-white py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3 sm:px-6">
        {items.map((item, i) => (
          <div
            key={item.title}
            className="animate-fade-up flex items-start gap-4"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-text">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
