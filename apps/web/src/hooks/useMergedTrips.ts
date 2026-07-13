"use client";

import { useEffect, useState } from "react";
import { listGuestTrips } from "@/lib/guest-trips";
import type { ApiTrip } from "@/lib/types";

export function useMergedTrips() {
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const guest = listGuestTrips();

    fetch("/api/trips")
      .then(async (res) => {
        if (!res.ok) return guest;
        const server = (await res.json()) as ApiTrip[];
        const guestIds = new Set(guest.map((g) => g.id));
        return [
          ...guest,
          ...server.filter((t) => !guestIds.has(t.id)),
        ].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      })
      .catch(() => guest)
      .then(setTrips)
      .finally(() => setLoading(false));
  }, []);

  return { trips, loading };
}
