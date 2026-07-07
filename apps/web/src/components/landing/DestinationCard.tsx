import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { popularDestinations } from "@rynxpense/ui-tokens";
import { formatCurrency } from "@rynxpense/shared";

export function DestinationCard({
  destination,
}: {
  destination: (typeof popularDestinations)[number];
}) {
  return (
    <Link
      href={`/app/trips/new?destination=${encodeURIComponent(destination.name)}&budget=${destination.budgetFrom}`}
      className="group shrink-0 overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg"
      style={{ width: "260px" }}
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="260px"
        />
        {destination.badge && (
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-white">
            {destination.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-text">{destination.name}</h3>
            <p className="text-sm text-muted">{destination.country}</p>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="font-medium">{destination.rating}</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          from{" "}
          <span className="font-bold text-primary">
            {formatCurrency(destination.budgetFrom)}
          </span>{" "}
          / {destination.days} days
        </p>
      </div>
    </Link>
  );
}

export function DiscoverSection() {
  return (
    <section id="discover" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text sm:text-3xl">
              Popular destinations
            </h2>
            <p className="mt-1 text-muted">
              AI-curated trip budgets to get you started
            </p>
          </div>
          <Link href="/app" className="hidden text-sm font-semibold text-primary hover:underline sm:block">
            View all →
          </Link>
        </div>
        <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-4">
          {popularDestinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      </div>
    </section>
  );
}
