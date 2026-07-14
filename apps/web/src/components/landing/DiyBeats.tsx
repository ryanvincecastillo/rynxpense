import { Map, Scale, Share2 } from "lucide-react";

const beats = [
  {
    icon: Map,
    title: "Named DIY plan",
    description:
      "Real hotels, restaurants, and activities — not generic “sightseeing” — priced in PHP.",
  },
  {
    icon: Scale,
    title: "Peso reality check",
    description:
      "See if the trip fits before you book. Flights and hotels included in the math.",
  },
  {
    icon: Share2,
    title: "Share to socials",
    description:
      "Post your plan to FB, X, or group chats. Friends can open the link — no new social network.",
  },
];

export function DiyBeats() {
  return (
    <section id="why" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Why DIY on Rynxpense
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            You plan it. We do the peso math.
          </h2>
          <p className="mt-3 text-lg text-muted">
            Klook sells tickets. Reddit debates vibes. Rynxpense is where DIY travelers turn
            a budget into a real day-by-day plan.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {beats.map((beat, i) => (
            <div
              key={beat.title}
              className="animate-fade-up rounded-2xl bg-white p-7 ring-1 ring-border"
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
