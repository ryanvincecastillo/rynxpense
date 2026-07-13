"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@rynxpense/shared";
import { useMergedTrips } from "@/hooks/useMergedTrips";

export function RecentTripsSection() {
  const { trips, loading } = useMergedTrips();

  if (loading) return null;
  if (trips.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold">Your recent trips</h2>
        <Link href="/trips" className="text-sm font-semibold text-primary">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {trips.slice(0, 3).map((trip) => (
          <Link
            key={trip.id}
            href={`/trips/${trip.id}`}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-border transition hover:shadow-md"
          >
            <div>
              <p className="font-semibold">{trip.destination}</p>
              <p className="text-sm text-muted">
                {formatCurrency(trip.budgetAmount)} · {trip.status.toLowerCase()}
                {"guest" in trip && (trip as { guest?: boolean }).guest
                  ? " · saved locally"
                  : ""}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted" />
          </Link>
        ))}
      </div>
    </section>
  );
}
