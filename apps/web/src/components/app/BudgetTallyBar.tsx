"use client";

import { formatCurrency } from "@rynxpense/shared";
import type { BudgetTally } from "@rynxpense/shared";
import { AlertTriangle, CheckCircle, Wallet } from "lucide-react";

export function BudgetTallyBar({ tally }: { tally: BudgetTally }) {
  const pct =
    tally.tripBudget > 0
      ? Math.min(100, Math.round((tally.combinedPlanTotal / tally.tripBudget) * 100))
      : 0;

  const statusStyles = {
    ok: { bar: "bg-success", text: "text-success", icon: CheckCircle },
    warning: { bar: "bg-warning", text: "text-warning", icon: AlertTriangle },
    over: { bar: "bg-error", text: "text-error", icon: AlertTriangle },
  }[tally.status];

  const StatusIcon = statusStyles.icon;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-border">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-sm">
          <Wallet className="h-4 w-4 text-primary" />
          Budget tally
        </h3>
        <span className={`flex items-center gap-1 text-xs font-semibold ${statusStyles.text}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {tally.status === "over"
            ? `Over by ${formatCurrency(tally.overBy)}`
            : tally.status === "warning"
              ? "Getting close"
              : "On track"}
        </span>
      </div>

      <div className="mb-2 h-2 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all ${statusStyles.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div>
          <p className="text-muted">Your budget</p>
          <p className="font-bold">{formatCurrency(tally.tripBudget)}</p>
        </div>
        <div>
          <p className="text-muted">Itinerary est.</p>
          <p className="font-bold">{formatCurrency(tally.itineraryTotal)}</p>
        </div>
        <div>
          <p className="text-muted">Inspo saves</p>
          <p className="font-bold">{formatCurrency(tally.inspirationTotal)}</p>
        </div>
        <div>
          <p className="text-muted">Spent so far</p>
          <p className="font-bold">{formatCurrency(tally.spent)}</p>
        </div>
      </div>
    </div>
  );
}
