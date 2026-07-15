"use client";

export type MoneyEventType =
  | "price_found"
  | "committed"
  | "paid"
  | "expense"
  | "purchase_check"
  | "cut_applied"
  | "budget_changed";

export interface MoneyEvent {
  id: string;
  at: string;
  type: MoneyEventType;
  category?: string | null;
  amount?: number | null;
  meta?: Record<string, unknown>;
}

const key = (tripId: string) => `rynxpense_money_events_${tripId}`;

export function loadGuestMoneyEvents(tripId: string): MoneyEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key(tripId));
    return raw ? (JSON.parse(raw) as MoneyEvent[]) : [];
  } catch {
    return [];
  }
}

export function saveGuestMoneyEvents(tripId: string, events: MoneyEvent[]) {
  localStorage.setItem(key(tripId), JSON.stringify(events.slice(0, 200)));
}

export function appendGuestMoneyEvent(
  tripId: string,
  event: Omit<MoneyEvent, "id" | "at"> & { id?: string; at?: string },
): MoneyEvent[] {
  const next: MoneyEvent = {
    id: event.id ?? crypto.randomUUID(),
    at: event.at ?? new Date().toISOString(),
    type: event.type,
    category: event.category,
    amount: event.amount,
    meta: event.meta,
  };
  const all = [next, ...loadGuestMoneyEvents(tripId)];
  saveGuestMoneyEvents(tripId, all);
  return all;
}
