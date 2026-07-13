"use client";

import Link from "next/link";
import { Calendar, Wallet, Cloud } from "lucide-react";
import { formatCurrency } from "@rynxpense/shared";
import type { ApiTrip } from "@/lib/types";

export function TripCard({ trip }: { trip: ApiTrip }) {
  const spent = trip.expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const budget = trip.totalEstimated ?? trip.budgetAmount;
  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const isGuest = (trip as ApiTrip & { guest?: boolean }).guest === true;

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="border-b border-border bg-primary/5 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{trip.destination}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(trip.startDate).toLocaleDateString()} –{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </span>
              {isGuest && (
                <span className="flex items-center gap-1 text-primary">
                  <Cloud className="h-3.5 w-3.5" />
                  On this device
                </span>
              )}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              trip.status === "ACTIVE"
                ? "bg-success/10 text-success"
                : trip.status === "COMPLETED"
                  ? "bg-muted/10 text-muted"
                  : "bg-primary/10 text-primary"
            }`}
          >
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
          <span className={pct > 100 ? "font-semibold text-error" : "text-muted"}>
            {pct}%
          </span>
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
