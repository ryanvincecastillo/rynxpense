"use client";

import { formatCurrency, pickRynxCopy } from "@rynxpense/shared";
import type { MoneyEvent } from "@/lib/money-events";

const TYPE_LABEL: Record<string, string> = {
  price_found: "Price found",
  committed: "Committed",
  paid: "Paid",
  expense: "Expense",
  purchase_check: "Purchase check",
  cut_applied: "Cut applied",
  budget_changed: "Budget changed",
};

export function MoneyTimeline({ events }: { events: MoneyEvent[] }) {
  if (!events.length) {
    const empty = pickRynxCopy("empty.timeline");
    return (
      <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-border">
        <p className="text-sm text-muted">{empty.text}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-border">
      <h3 className="font-display text-lg font-bold">Money timeline</h3>
      <p className="mt-1 text-sm text-muted">Cause → effect. Decisions, not vibes.</p>
      <ol className="mt-5 space-y-4">
        {events.map((e) => (
          <li key={e.id} className="flex gap-3 border-l-2 border-primary/30 pl-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">
                  {TYPE_LABEL[e.type] ?? e.type}
                  {e.category ? ` · ${e.category}` : ""}
                </p>
                {e.amount != null && (
                  <p className="font-display text-sm font-bold">
                    {formatCurrency(e.amount)}
                  </p>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {new Date(e.at).toLocaleString()}
              </p>
              {e.meta && typeof e.meta.verdict === "string" && (
                <p className="mt-1 text-xs text-muted">
                  Verdict: {String(e.meta.verdict).replaceAll("_", " ")}
                </p>
              )}
              {e.meta && typeof e.meta.note === "string" && e.meta.note && (
                <p className="mt-1 text-sm">{e.meta.note}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
