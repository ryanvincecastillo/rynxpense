import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { popularDestinations, categories } from "@rynxpense/ui-tokens";
import { formatCurrency } from "@rynxpense/shared";
import { SearchWidget } from "@/components/landing/SearchWidget";

async function getTrips() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/trips`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DiscoverPage() {
  const trips = await getTrips();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Discover your next trip</h1>
        <p className="text-muted">AI-powered itineraries within your budget</p>
      </div>

      <SearchWidget />

      <section>
        <h2 className="mb-3 font-bold">Browse by style</h2>
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/trips/new?category=${cat.id}`}
              className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-border hover:ring-primary/30"
            >
              {cat.emoji} {cat.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Popular destinations</h2>
          <Link href="/trips/new" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {popularDestinations.slice(0, 4).map((dest) => (
            <Link
              key={dest.id}
              href={`/trips/new?destination=${encodeURIComponent(dest.name)}&budget=${dest.budgetFrom}`}
              className="group overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5"
            >
              <div className="relative h-36">
                <Image src={dest.image} alt={dest.name} fill className="object-cover" sizes="400px" />
                {dest.badge && (
                  <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                    {dest.badge}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold">{dest.name}</h3>
                <p className="text-sm text-muted">
                  from {formatCurrency(dest.budgetFrom)} / {dest.days} days
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {trips.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Your recent trips</h2>
            <Link href="/trips" className="text-sm font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {trips.slice(0, 3).map((trip: { id: string; destination: string; budgetAmount: number; status: string }) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-border"
              >
                <div>
                  <p className="font-semibold">{trip.destination}</p>
                  <p className="text-sm text-muted">
                    {formatCurrency(trip.budgetAmount)} · {trip.status.toLowerCase()}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <Link
        href="/trips/new"
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark p-5 text-white shadow-lg"
      >
        <Sparkles className="h-5 w-5" />
        <span className="font-semibold">Create AI trip plan</span>
      </Link>
    </div>
  );
}
