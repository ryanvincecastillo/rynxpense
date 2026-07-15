"use client";

import type { ApiExpense, ApiTrip } from "@/lib/types";
import type { GuestTrip } from "@/lib/build-guest-trip";

export type { GuestTrip };

const STORAGE_KEY = "rynxpense_guest_trips";

function readAll(): GuestTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GuestTrip[]) : [];
  } catch {
    return [];
  }
}

function writeAll(trips: GuestTrip[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function listGuestTrips(): GuestTrip[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getGuestTrip(id: string): GuestTrip | null {
  return readAll().find((t) => t.id === id) ?? null;
}

export function saveGuestTrip(trip: GuestTrip) {
  const trips = readAll().filter((t) => t.id !== trip.id);
  trips.unshift(trip);
  writeAll(trips.slice(0, 20));
}

export function deleteGuestTrip(id: string) {
  writeAll(readAll().filter((t) => t.id !== id));
}

export function addGuestExpense(
  tripId: string,
  expense: Omit<ApiExpense, "id" | "tripId" | "createdAt" | "updatedAt">,
): GuestTrip | null {
  const trip = getGuestTrip(tripId);
  if (!trip) return null;

  const now = new Date().toISOString();
  const newExpense: ApiExpense = {
    id: crypto.randomUUID(),
    tripId,
    ...expense,
    createdAt: now,
    updatedAt: now,
  };

  const updated: GuestTrip = {
    ...trip,
    expenses: [newExpense, ...(trip.expenses ?? [])],
    updatedAt: now,
  };
  saveGuestTrip(updated);
  return updated;
}

export function removeGuestExpense(tripId: string, expenseId: string): GuestTrip | null {
  const trip = getGuestTrip(tripId);
  if (!trip) return null;

  const updated: GuestTrip = {
    ...trip,
    expenses: (trip.expenses ?? []).filter((e) => e.id !== expenseId),
    updatedAt: new Date().toISOString(),
  };
  saveGuestTrip(updated);
  return updated;
}

export function isGuestTripId(id: string): boolean {
  return getGuestTrip(id) !== null;
}

/** Apply a mutated itinerary + budget to a guest trip (Make It Fit). */
export function updateGuestTripPlan(
  tripId: string,
  patch: Partial<
    Pick<
      GuestTrip,
      | "budgetAmount"
      | "travelers"
      | "endDate"
      | "totalEstimated"
      | "budgetBreakdown"
      | "tips"
      | "itineraryDays"
    >
  >,
): GuestTrip | null {
  const trip = getGuestTrip(tripId);
  if (!trip) return null;
  const updated: GuestTrip = {
    ...trip,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  saveGuestTrip(updated);
  return updated;
}
