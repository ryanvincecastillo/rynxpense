"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import type { InspirationItem } from "@rynxpense/shared";
import { saveGuestTrip } from "@/lib/guest-trips";
import {
  listPendingInspiration,
  savePendingInspiration,
  movePendingToTrip,
} from "@/lib/inspiration";
import { InspirationInbox } from "@/components/app/InspirationInbox";

function TripBuilderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inspiration, setInspiration] = useState<InspirationItem[]>(() =>
    typeof window !== "undefined" ? listPendingInspiration() : [],
  );

  const today = new Date().toISOString().split("T")[0];
  const defaultEnd = new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    destination: searchParams.get("destination") || "",
    startDate: searchParams.get("startDate") || today,
    endDate: searchParams.get("endDate") || defaultEnd,
    budgetAmount: searchParams.get("budget") || "50000",
    travelers: searchParams.get("travelers") || "2",
    preferences: searchParams.get("category") || "",
  });

  const handleInspirationChange = (items: InspirationItem[]) => {
    setInspiration(items);
    savePendingInspiration(items);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/trips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: form.destination,
          startDate: form.startDate,
          endDate: form.endDate,
          budgetAmount: Number(form.budgetAmount),
          currency: "PHP",
          travelers: Number(form.travelers),
          preferences: form.preferences || undefined,
          inspirationItems: inspiration.length ? inspiration : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate trip");
      }

      const trip = await res.json();

      if (trip.guest) {
        saveGuestTrip(trip);
      }

      movePendingToTrip(trip.id);

      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Turn inspo into a peso plan</h1>
        <p className="text-muted">
          Save TikTok &amp; IG finds below, then generate a named itinerary with stays and food
        </p>
      </div>

      <InspirationInbox
        mode="pending"
        items={inspiration}
        onChange={handleInspirationChange}
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5"
      >
        <Field label="Destination">
          <input
            required
            type="text"
            placeholder="e.g. Tokyo, El Nido, Seoul"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            className="input-field"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date">
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="input-field"
            />
          </Field>
          <Field label="End date">
            <input
              required
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="input-field"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Total budget (₱)">
            <input
              required
              type="number"
              min="1000"
              value={form.budgetAmount}
              onChange={(e) => setForm({ ...form, budgetAmount: e.target.value })}
              className="input-field"
            />
          </Field>
          <Field label="Travelers">
            <select
              value={form.travelers}
              onChange={(e) => setForm({ ...form, travelers: e.target.value })}
              className="input-field"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Preferences (optional)">
          <textarea
            placeholder="e.g. foodie, budget-friendly, kid-friendly..."
            value={form.preferences}
            onChange={(e) => setForm({ ...form, preferences: e.target.value })}
            className="input min-h-[80px] resize-none"
            rows={3}
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-4 font-semibold text-white shadow-lg hover:bg-accent-dark disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Building your plan...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate plan from inspo + budget
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text">{label}</label>
      {children}
    </div>
  );
}

export default function NewTripPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted">Loading...</div>}>
      <TripBuilderForm />
    </Suspense>
  );
}
