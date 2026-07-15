"use client";

import { useMemo } from "react";
import {
  formatCurrency,
  computeBudgetAutopsy,
  updateTravelerCostProfile,
  type TravelerCostProfile,
} from "@rynxpense/shared";
import { saveTravelerCostProfile } from "@/lib/cost-lines";
import { BarChart3 } from "lucide-react";

type Props = {
  plannedBreakdown: Record<string, number> | null | undefined;
  totalEstimated: number | null | undefined;
  expenses: Array<{ amount: number; category: string }>;
  profile: TravelerCostProfile | null;
  onProfileChange: (p: TravelerCostProfile) => void;
};

export function BudgetAutopsyPanel({
  plannedBreakdown,
  totalEstimated,
  expenses,
  profile,
  onProfileChange,
}: Props) {
  const autopsy = useMemo(
    () =>
      computeBudgetAutopsy({
        plannedBreakdown: plannedBreakdown ?? null,
        totalEstimated,
        expenses,
      }),
    [plannedBreakdown, totalEstimated, expenses],
  );

  const refreshProfile = () => {
    if (autopsy.actual <= 0) return;
    const next = updateTravelerCostProfile(profile, autopsy);
    saveTravelerCostProfile(next);
    onProfileChange(next);
  };

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-border">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">Budget autopsy</h3>
          <p className="text-sm text-muted">
            Planned vs what you actually logged — builds your traveler cost profile.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Planned" value={formatCurrency(autopsy.planned)} />
        <Stat label="Actual" value={formatCurrency(autopsy.actual)} />
        <Stat
          label="Variance"
          value={`${autopsy.variance >= 0 ? "+" : ""}${formatCurrency(autopsy.variance)}`}
          accent={autopsy.variance > 0 ? "text-error" : "text-success"}
        />
      </div>

      <p className="mt-3 text-sm text-muted">{autopsy.insight}</p>

      <div className="mt-4 space-y-2">
        {autopsy.byCategory
          .filter((c) => c.planned > 0 || c.actual > 0)
          .map((c) => (
            <div
              key={c.key}
              className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm"
            >
              <span className="font-medium">{c.label}</span>
              <span className="tabular-nums text-muted">
                {formatCurrency(c.planned)} → {formatCurrency(c.actual)}
                <span className={c.delta > 0 ? " text-error" : " text-success"}>
                  {" "}
                  ({c.delta >= 0 ? "+" : ""}
                  {formatCurrency(c.delta)})
                </span>
              </span>
            </div>
          ))}
      </div>

      <button
        type="button"
        onClick={refreshProfile}
        disabled={autopsy.actual <= 0}
        className="mt-4 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary disabled:opacity-40"
      >
        Update my cost profile
      </button>

      {profile && profile.tripsSampled > 0 && (
        <div className="mt-4 rounded-xl bg-background p-3 text-sm">
          <p className="font-semibold">Your traveler cost profile</p>
          <ul className="mt-1 space-y-0.5 text-muted">
            <li>Food multiplier: {profile.foodMultiplier.toFixed(2)}x</li>
            <li>Activity multiplier: {profile.activityMultiplier.toFixed(2)}x</li>
            <li>
              Typical overrun: {(profile.typicalOverrunPct * 100).toFixed(1)}% ·{" "}
              {profile.tripsSampled} trip(s)
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-background p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-0.5 font-bold tabular-nums ${accent ?? "text-text"}`}>{value}</p>
    </div>
  );
}
