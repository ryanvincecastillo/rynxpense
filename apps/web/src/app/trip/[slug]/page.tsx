import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Users, Wallet } from "lucide-react";
import { formatCurrency } from "@rynxpense/shared";
import type { Activity } from "@rynxpense/shared";
import { createClient } from "@/lib/supabase/server";
import { fetchSharedTripBySlug } from "@/lib/trips";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ShareButtons } from "@/components/share/ShareButtons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isSupabaseConfigured()) return { title: "Trip not found" };

  const supabase = await createClient();
  const trip = await fetchSharedTripBySlug(supabase, slug);
  if (!trip) return { title: "Trip not found" };

  const budget = trip.totalEstimated ?? trip.budgetAmount;
  const title = `${trip.destination} · ${formatCurrency(budget)} DIY plan`;
  const description = `Day-by-day DIY itinerary for ${trip.destination} with a peso budget of ${formatCurrency(budget)}. Named stays, food, and activities — planned on Rynxpense.`;
  const url = `https://rynxpense.com/trip/${slug}`;

  return {
    title: `${title} — Rynxpense`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "Rynxpense",
      locale: "en_PH",
      images: [
        {
          url: "https://rynxpense.com/hero-tropical.png",
          width: 1200,
          height: 675,
          alt: `${trip.destination} DIY trip plan`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rynxpense.com/hero-tropical.png"],
    },
  };
}

export default async function ShareTripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const trip = await fetchSharedTripBySlug(supabase, slug);
  if (!trip) notFound();

  const budget = trip.totalEstimated ?? trip.budgetAmount;
  const breakdown = trip.budgetBreakdown;
  const shareUrl = `https://rynxpense.com/trip/${slug}`;
  const shareTitle = `${trip.destination} · ${formatCurrency(budget)} DIY plan`;
  const shareText = `Check out this ${trip.destination} DIY trip plan — about ${formatCurrency(budget)}.`;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <BrandLogo />
          <Link
            href="/trips/new"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Plan my trip
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 overflow-hidden rounded-2xl bg-[#062018] p-8 text-white">
          <p className="mb-1 text-sm text-[#A7F3D0]">Shared DIY trip plan</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {trip.destination}
          </h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/85">
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

        <div className="mb-8 rounded-2xl bg-white p-5 ring-1 ring-border">
          <p className="mb-3 text-sm font-medium text-muted">Share this plan</p>
          <ShareButtons url={shareUrl} title={shareTitle} text={shareText} />
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

        <h2 className="mb-4 font-display text-xl font-bold">Itinerary</h2>
        <div className="space-y-4">
          {trip.itineraryDays?.map((day) => {
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
      </main>
    </div>
  );
}
