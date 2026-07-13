"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useMergedTrips } from "@/hooks/useMergedTrips";
import { TripCard } from "@/components/app/TripCard";

export function MyTripsList() {
  const { trips, loading } = useMergedTrips();

  if (loading) {
    return <div className="py-12 text-center text-muted">Loading your trips...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="text-muted">
            {trips.length} trip{trips.length !== 1 ? "s" : ""}
            {trips.length > 0 && " · no account needed"}
          </p>
        </div>
        <Link
          href="/trips/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-accent-dark"
        >
          + New trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-border">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-muted" />
          <h2 className="mb-2 text-lg font-bold">No trips yet</h2>
          <p className="mb-6 text-muted">
            Plan your first AI-powered trip — free, no sign-up required
          </p>
          <Link
            href="/trips/new"
            className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-md transition hover:bg-primary-dark"
          >
            Plan a trip
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
