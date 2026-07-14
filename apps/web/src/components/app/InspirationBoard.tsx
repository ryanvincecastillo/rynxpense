"use client";

import { Sparkles } from "lucide-react";
import type { InspirationItem } from "@rynxpense/shared";
import { formatCurrency } from "@rynxpense/shared";

const categoryEmoji: Record<InspirationItem["category"], string> = {
  food: "🍜",
  stay: "🏨",
  activity: "📍",
  transport: "🚃",
  other: "✨",
};

export function InspirationBoard({ items }: { items: InspirationItem[] }) {
  if (!items.length) return null;

  const total = items.reduce((s, i) => s + (i.estimatedCost ?? 0), 0);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-border">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-text">
            <Sparkles className="h-5 w-5 text-accent" />
            Your trip inspiration
          </h2>
          <p className="mt-1 text-sm text-muted">
            Curated stays, food, and spots from your plan — save or share these picks
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          ~{formatCurrency(total)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 rounded-xl bg-background p-3 ring-1 ring-border transition hover:ring-primary/20"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-xl shadow-sm">
              {categoryEmoji[item.category]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-sm">{item.title}</p>
                <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent">
                  AI pick
                </span>
              </div>
              {item.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.description}</p>
              )}
              <div className="mt-1 flex flex-wrap gap-2 text-xs">
                <span className="capitalize text-muted">{item.category}</span>
                {item.estimatedCost != null && (
                  <span className="font-semibold text-primary">
                    {formatCurrency(item.estimatedCost)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
