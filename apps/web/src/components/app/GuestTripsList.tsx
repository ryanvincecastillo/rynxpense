"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Wallet } from "lucide-react";
import { formatCurrency } from "@rynxpense/shared";
import { listGuestTrips, type GuestTrip } from "@/lib/guest-trips";

function TripRow({ trip }: { trip: GuestTrip }) {
  const spent = trip.expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const budget = trip.totalEstimated ?? trip.budgetAmount;
  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="border-b border-border bg-primary/5 px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{trip.destination}</h2>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(trip.startDate).toLocaleDateString()} –{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {trip.status}
          </span>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted">
            <Wallet className="h-3.5 w-3.5" />
            {formatCurrency(spent)} of {formatCurrency(budget)}
          </span>
          <span className={pct > 100 ? "font-semibold text-error" : "text-muted"}>{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full transition-all ${
              pct > 100 ? "bg-error" : pct > 80 ? "bg-warning" : "bg-success"
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

export function GuestTripsList({ compact = false }: { compact?: boolean }) {
  const [trips, setTrips] = useState<GuestTrip[]>([]);

  useEffect(() => {
    setTrips(listGuestTrips());
  }, []);

  if (trips.length === 0) {
    if (compact) return null;
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-border">
        <MapPin className="mx-auto mb-4 h-12 w-12 text-muted" />
        <h2 className="mb-2 text-lg font-bold">No trips yet</h2>
        <p className="mb-6 text-muted">Plan your first AI-powered trip — no account needed</p>
        <Link
          href="/trips/new"
          className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white"
        >
          Plan a trip
        </Link>
      </div>
    );
  }

  if (compact) {
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
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" />
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <TripRow key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
