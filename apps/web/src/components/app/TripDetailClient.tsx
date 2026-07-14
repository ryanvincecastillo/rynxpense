"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Wallet,
  Share2,
  Receipt,
  Lightbulb,
  Cloud,
} from "lucide-react";
import {
  formatCurrency,
  computeBudgetTally,
  computeRealityCheck,
} from "@rynxpense/shared";
import type { Activity } from "@rynxpense/shared";
import type { InspirationItem } from "@rynxpense/shared";
import type { ApiTrip } from "@/lib/types";
import { getGuestTrip } from "@/lib/guest-trips";
import { listTripInspiration } from "@/lib/inspiration";
import { extractInspirationFromTrip } from "@/lib/inspiration-from-plan";
import { InspirationBoard } from "@/components/app/InspirationBoard";
import { BudgetTallyBar } from "@/components/app/BudgetTallyBar";
import { RealityCheckButton } from "@/components/app/RealityCheckModal";
import { TripHero } from "@/components/app/TripHero";

export function TripDetailClient({ tripId }: { tripId: string }) {
  const [trip, setTrip] = useState<ApiTrip | null>(null);
  const [inspiration, setInspiration] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const guest = getGuestTrip(tripId);
    if (guest) {
      setTrip(guest);
      setIsGuest(true);
      const saved = listTripInspiration(tripId);
      setInspiration(saved.length ? saved : extractInspirationFromTrip(guest));
      setLoading(false);
      return;
    }

    fetch(`/api/trips/${tripId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setTrip(data);
          const saved = listTripInspiration(tripId);
          setInspiration(saved.length ? saved : extractInspirationFromTrip(data));
        }
      })
      .finally(() => setLoading(false));
  }, [tripId]);

  const tally = useMemo(() => {
    if (!trip) return null;
    const spent = trip.expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
    return computeBudgetTally({
      budgetAmount: trip.budgetAmount,
      totalEstimated: trip.totalEstimated,
      inspirationItems: inspiration,
      itineraryTotal: trip.totalEstimated ?? trip.budgetAmount,
      spent,
    });
  }, [trip, inspiration]);

  const realityCheck = useMemo(() => {
    if (!trip) return null;
    return computeRealityCheck({
      budgetAmount: trip.budgetAmount,
      budgetBreakdown: trip.budgetBreakdown,
      totalEstimated: trip.totalEstimated,
      destination: trip.destination,
      travelers: trip.travelers,
    });
  }, [trip]);

  if (loading) {
    return <div className="py-12 text-center text-muted">Loading your trip...</div>;
  }

  if (!trip) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">Trip not found</p>
        <Link href="/trips/new" className="mt-4 inline-block text-primary">
          Plan a new trip
        </Link>
      </div>
    );
  }

  const spent = trip.expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const budget = trip.totalEstimated ?? trip.budgetAmount;
  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const breakdown = trip.budgetBreakdown;
  const tips = trip.tips ?? [];

  return (
    <div className="space-y-6">
      <TripHero destination={trip.destination} />

      {isGuest && (
        <div className="flex items-start gap-3 rounded-xl bg-primary/5 px-4 py-3 ring-1 ring-primary/15">
          <Cloud className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-semibold text-text">Saved on this device</p>
            <p className="text-muted">
              No account needed.{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>{" "}
              to sync trips across devices.
            </p>
          </div>
        </div>
      )}

      {tally && <BudgetTallyBar tally={tally} />}

      <InspirationBoard items={inspiration} />

      <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mt-1 flex flex-wrap gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(trip.startDate).toLocaleDateString()} –{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {trip.travelers} travelers
                </span>
              </div>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              {trip.status}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                {formatCurrency(spent)} spent of {formatCurrency(budget)}
              </span>
              <span>{pct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border p-4">
          <Link
            href={`/trips/${trip.id}/expenses`}
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            <Receipt className="h-4 w-4" />
            Track expenses
          </Link>
          {realityCheck && <RealityCheckButton result={realityCheck} />}
          {trip.shareLink && (
            <Link
              href={`/trip/${trip.shareLink.slug}`}
              className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm font-semibold text-accent"
            >
              <Share2 className="h-4 w-4" />
              Share trip
            </Link>
          )}
        </div>
      </div>

      {breakdown && (
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-border">
          <h2 className="mb-4 font-bold">Budget breakdown</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-background p-3">
                <p className="text-xs capitalize text-muted">{key}</p>
                <p className="font-bold text-primary">{formatCurrency(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-bold">Itinerary</h2>
        <div className="space-y-4">
          {trip.itineraryDays?.map((day) => {
            const activities = day.activities as Activity[];
            return (
              <div
                key={day.id}
                className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border"
              >
                <div className="flex items-center justify-between border-b border-border bg-primary/5 px-5 py-3">
                  <div>
                    <span className="text-xs font-bold text-primary">Day {day.dayNumber}</span>
                    <h3 className="font-bold">{day.title}</h3>
                  </div>
                  <span className="font-bold text-primary">
                    {formatCurrency(day.estimatedCost)}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {activities.map((activity, i) => (
                    <div key={i} className="flex gap-4 px-5 py-3">
                      <span className="w-12 shrink-0 text-xs font-medium text-muted">
                        {activity.time}
                      </span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{activity.title}</p>
                          {activity.source === "ai_pick" && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted">{activity.description}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">
                        {formatCurrency(activity.estimatedCost)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {tips.length > 0 && (
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-border">
          <h2 className="mb-3 flex items-center gap-2 font-bold">
            <Lightbulb className="h-5 w-5 text-warning" />
            Travel tips
          </h2>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted">
                <span className="text-accent">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
