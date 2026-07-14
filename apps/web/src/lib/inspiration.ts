"use client";

import type { InspirationItem } from "@rynxpense/shared";

const PENDING_KEY = "rynxpense_pending_inspiration";
const tripKey = (tripId: string) => `rynxpense_inspiration_${tripId}`;

function read(key: string): InspirationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as InspirationItem[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, items: InspirationItem[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function listPendingInspiration(): InspirationItem[] {
  return read(PENDING_KEY);
}

export function savePendingInspiration(items: InspirationItem[]) {
  write(PENDING_KEY, items);
}

export function clearPendingInspiration() {
  localStorage.removeItem(PENDING_KEY);
}

export function listTripInspiration(tripId: string): InspirationItem[] {
  return read(tripKey(tripId));
}

export function saveTripInspiration(tripId: string, items: InspirationItem[]) {
  write(tripKey(tripId), items);
}

export function addTripInspiration(tripId: string, item: InspirationItem): InspirationItem[] {
  const items = listTripInspiration(tripId);
  const withId = { ...item, id: item.id ?? crypto.randomUUID() };
  const next = [withId, ...items];
  saveTripInspiration(tripId, next);
  return next;
}

export function removeTripInspiration(tripId: string, itemId: string): InspirationItem[] {
  const next = listTripInspiration(tripId).filter((i) => i.id !== itemId);
  saveTripInspiration(tripId, next);
  return next;
}

export function movePendingToTrip(tripId: string) {
  const pending = listPendingInspiration();
  if (!pending.length) return;
  const existing = listTripInspiration(tripId);
  saveTripInspiration(tripId, [
    ...pending.map((i) => ({ ...i, id: i.id ?? crypto.randomUUID() })),
    ...existing,
  ]);
  clearPendingInspiration();
}
