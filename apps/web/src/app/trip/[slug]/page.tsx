import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Users, Wallet } from "lucide-react";
import { formatCurrency } from "@rynxpense/shared";
import { prisma } from "@/lib/prisma";
import type { Activity } from "@rynxpense/shared";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getSharedTrip(slug: string) {
  const shareLink = await prisma.shareLink.findUnique({
    where: { slug },
    include: {
      trip: {
        include: {
          itineraryDays: { orderBy: { dayNumber: "asc" } },
        },
      },
    },
  });
  if (!shareLink?.isPublic) return null;
  return shareLink.trip;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getSharedTrip(slug);
  if (!trip) return { title: "Trip not found" };

  const budget = trip.totalEstimated ?? trip.budgetAmount;
  return {
    title: `${trip.destination} Trip Plan — Rynxpense`,
    description: `AI-planned ${trip.destination} trip with an estimated budget of ${formatCurrency(budget)}. View the full itinerary.`,
    openGraph: {
      title: `${trip.destination} Trip — ${formatCurrency(budget)} budget`,
      description: `Day-by-day itinerary for ${trip.destination}`,
      type: "website",
      url: `https://rynxpense.com/trip/${slug}`,
    },
  };
}

export default async function ShareTripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await getSharedTrip(slug);
  if (!trip) notFound();

  const budget = trip.totalEstimated ?? trip.budgetAmount;
  const breakdown = trip.budgetBreakdown as Record<string, number> | null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              R
            </div>
            <span className="font-bold">Rynxpense</span>
          </Link>
          <Link
            href="/app/trips/new"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Plan your trip
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-8 text-white">
          <p className="mb-1 text-sm text-white/70">Shared trip plan</p>
          <h1 className="text-3xl font-bold">{trip.destination}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(trip.startDate).toLocaleDateString()} –{" "}
              {new Date(trip.endDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {trip.travelers} travelers
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              Est. {formatCurrency(budget)}
            </span>
          </div>
        </div>

        {breakdown && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-border">
                <p className="text-xs capitalize text-muted">{key}</p>
                <p className="font-bold text-primary">{formatCurrency(value)}</p>
              </div>
            ))}
          </div>
        )}

        <h2 className="mb-4 text-xl font-bold">Itinerary</h2>
        <div className="space-y-4">
          {trip.itineraryDays.map((day) => {
            const activities = day.activities as Activity[];
            return (
              <div key={day.id} className="rounded-xl bg-white shadow-sm ring-1 ring-border">
                <div className="border-b border-border px-5 py-3">
                  <span className="text-xs font-bold text-primary">Day {day.dayNumber}</span>
                  <h3 className="font-bold">{day.title}</h3>
                </div>
                <div className="divide-y divide-border">
                  {activities.map((a, i) => (
                    <div key={i} className="flex gap-4 px-5 py-3 text-sm">
                      <span className="w-12 shrink-0 text-muted">{a.time}</span>
                      <div className="flex-1">
                        <p className="font-medium">{a.title}</p>
                        <p className="text-muted">{a.description}</p>
                      </div>
                      <span className="font-semibold">{formatCurrency(a.estimatedCost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl bg-accent/10 p-6 text-center">
          <p className="mb-3 font-semibold">Want your own AI trip plan?</p>
          <Link
            href="/app/trips/new"
            className="inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-white"
          >
            Start planning free
          </Link>
        </div>
      </main>
    </div>
  );
}
