"use client";

import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { formatCurrency } from "@rynxpense/shared";
import type { ApiTrip } from "@/lib/types";
import { ShareButtons } from "@/components/share/ShareButtons";

type Props = {
  trip: ApiTrip;
  isGuest?: boolean; // reserved for future guest-only UX
};

function appOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://rynxpense.com";
}

export function TripSharePanel({ trip, isGuest }: Props) {
  const [url, setUrl] = useState<string | null>(() => {
    if (trip.shareLink?.slug) return `${appOrigin()}/trip/${trip.shareLink.slug}`;
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(Boolean(trip.shareLink?.slug));

  const budget = trip.totalEstimated ?? trip.budgetAmount;
  const title = `${trip.destination} · ${formatCurrency(budget)} DIY plan`;
  const text = `Check out my ${trip.destination} DIY trip plan on Rynxpense — about ${formatCurrency(budget)}.`;

  const ensureLink = async () => {
    if (url) {
      setOpen(true);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/share/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          budgetAmount: trip.budgetAmount,
          currency: trip.currency,
          travelers: trip.travelers,
          totalEstimated: trip.totalEstimated,
          budgetBreakdown: trip.budgetBreakdown,
          tips: trip.tips,
          itineraryDays: (trip.itineraryDays ?? []).map((d) => ({
            dayNumber: d.dayNumber,
            title: d.title,
            activities: d.activities,
            estimatedCost: d.estimatedCost,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create share link");
      setUrl(data.url as string);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Share failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-border">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display font-bold text-text">
            <Share2 className="h-4 w-4 text-accent" />
            Share to socials
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Copy a link or post to Facebook &amp; X — no new app for friends to join.
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={ensureLink}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Create share link
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
      {open && url && (
        <div className="mt-4 space-y-2">
          <p className="truncate rounded-lg bg-background px-3 py-2 text-xs text-muted ring-1 ring-border">
            {url}
          </p>
          <ShareButtons url={url} title={title} text={text} />
        </div>
      )}
    </div>
  );
}
