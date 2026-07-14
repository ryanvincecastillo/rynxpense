import { Pin, Scale, Sparkles } from "lucide-react";

const items = [
  {
    icon: Pin,
    title: "Save from social",
    description:
      "Paste TikTok, IG, Reddit, or Facebook links — build a mood board before you book anything.",
  },
  {
    icon: Scale,
    title: "Peso reality check",
    description:
      "See if that viral itinerary actually fits your budget — flights and hotels included.",
  },
  {
    icon: Sparkles,
    title: "Named recommendations",
    description:
      "Real venues for stays, food, and activities — not generic \"lunch\" or \"sightseeing.\"",
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
