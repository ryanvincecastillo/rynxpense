import Link from "next/link";
import { Calendar, MapPin, Wallet } from "lucide-react";
import { formatCurrency } from "@rynxpense/shared";

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

export default async function MyTripsPage() {
  const trips = await getTrips();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="text-muted">{trips.length} trip{trips.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/trips/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          + New trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-border">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-muted" />
          <h2 className="mb-2 text-lg font-bold">No trips yet</h2>
          <p className="mb-6 text-muted">Plan your first AI-powered trip budget</p>
          <Link
            href="/trips/new"
            className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white"
          >
            Plan a trip
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map(
            (trip: {
              id: string;
              destination: string;
              startDate: string;
              endDate: string;
              budgetAmount: number;
              status: string;
              totalEstimated: number | null;
              _count?: { expenses: number };
              expenses?: { amount: number }[];
            }) => {
              const spent =
                trip.expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
              const budget = trip.totalEstimated ?? trip.budgetAmount;
              const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;

              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="block overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5 transition hover:shadow-lg"
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
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
            },
          )}
        </div>
      )}
    </div>
  );
}
