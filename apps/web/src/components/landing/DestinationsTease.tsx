import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { popularDestinations } from "@rynxpense/ui-tokens";
import { formatCurrency } from "@rynxpense/shared";

export function DestinationsTease() {
  const picks = popularDestinations.slice(0, 6);

  return (
    <section className="border-y border-border/80 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Destinations
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Popular DIY trips
            </h2>
            <p className="mt-2 max-w-lg text-muted">
              Tap a peso template — or browse all destinations with filters.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
          >
            Browse all destinations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((dest) => (
            <Link
              key={dest.id}
              href={`/trips/new?destination=${encodeURIComponent(dest.name)}&budget=${dest.budgetFrom}`}
              className="group overflow-hidden rounded-2xl bg-[#FFF8F0] ring-1 ring-black/5 transition hover:-translate-y-0.5"
            >
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="font-display text-lg font-bold">{dest.name}</h3>
                  <p className="text-sm text-white/80">{dest.country}</p>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="line-clamp-1 text-xs text-muted">{dest.samplePlan}</p>
                <p className="mt-1 text-sm text-muted">
                  from{" "}
                  <span className="font-bold text-primary">
                    {formatCurrency(dest.budgetFrom)}
                  </span>
                  <span> / {dest.days} days</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
