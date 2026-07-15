"use client";

import type { ReactNode } from "react";
import {
  formatCurrency,
  type FitStrategy,
  type TripFeasibilityResult,
} from "@rynxpense/shared";
import { AlertTriangle, CheckCircle2, Minus, Plus, Sparkles } from "lucide-react";

type Props = {
  result: TripFeasibilityResult;
  scenarioBudget: number;
  scenarioTravelers: number;
  scenarioDays: number;
  maxDays: number;
  skipPaidActivities: boolean;
  onBudgetChange: (n: number) => void;
  onTravelersChange: (n: number) => void;
  onDaysChange: (n: number) => void;
  onSkipPaidChange: (v: boolean) => void;
  onResetScenario: () => void;
  strategies: FitStrategy[];
  onApplyStrategy: (s: FitStrategy) => void;
  applying?: boolean;
};

const verdictStyles = {
  affordable: {
    ring: "ring-success/30",
    bg: "bg-success/10",
    text: "text-success",
    label: "Yes, you can afford this trip",
  },
  tight: {
    ring: "ring-warning/40",
    bg: "bg-warning/15",
    text: "text-amber-700",
    label: "Possible, but tight",
  },
  over: {
    ring: "ring-error/30",
    bg: "bg-error/10",
    text: "text-error",
    label: "Not feasible at this budget",
  },
} as const;

export function FeasibilityOverview({
  result,
  scenarioBudget,
  scenarioTravelers,
  scenarioDays,
  maxDays,
  skipPaidActivities,
  onBudgetChange,
  onTravelersChange,
  onDaysChange,
  onSkipPaidChange,
  onResetScenario,
  strategies,
  onApplyStrategy,
  applying,
}: Props) {
  const style = verdictStyles[result.verdict];

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-6 ring-1 ${style.ring} ${style.bg}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Trip feasibility
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <div>
            <p className="font-display text-5xl font-bold tabular-nums text-text">
              {result.score}
              <span className="text-2xl text-muted">/100</span>
            </p>
            <p className={`mt-1 text-sm font-semibold ${style.text}`}>{style.label}</p>
          </div>
          <div className="min-w-[12rem] flex-1">
            <p className="text-sm text-muted">{result.summary}</p>
            <p className="mt-2 text-sm">
              <span className="text-muted">Projected </span>
              <span className="font-bold text-text">
                {formatCurrency(result.grandTotal)}
              </span>
              <span className="text-muted"> incl. buffer · Budget </span>
              <span className="font-bold text-text">
                {formatCurrency(result.statedBudget)}
              </span>
            </p>
            {result.gap > 0 && (
              <p className="mt-1 text-sm font-semibold text-error">
                Over by {formatCurrency(result.gap)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* What-if */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-border">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold">What if?</h3>
            <p className="text-sm text-muted">
              Tweak assumptions — score updates instantly (no AI regenerate).
            </p>
          </div>
          <button
            type="button"
            onClick={onResetScenario}
            className="text-sm font-medium text-primary hover:underline"
          >
            Reset
          </button>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Budget (₱)
            </span>
            <input
              type="range"
              min={15000}
              max={Math.max(200000, scenarioBudget)}
              step={1000}
              value={scenarioBudget}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-muted">₱</span>
              <input
                type="text"
                inputMode="numeric"
                value={scenarioBudget.toLocaleString("en-PH")}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^\d]/g, ""));
                  if (n > 0) onBudgetChange(n);
                }}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm font-semibold tabular-nums outline-none focus:border-primary"
              />
            </div>
          </label>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Travelers
            </span>
            <div className="mt-2 flex items-center gap-3">
              <Stepper
                label="Fewer"
                onClick={() => onTravelersChange(Math.max(1, scenarioTravelers - 1))}
                disabled={scenarioTravelers <= 1}
              >
                <Minus className="h-3.5 w-3.5" />
              </Stepper>
              <span className="min-w-[5rem] text-center text-sm font-semibold">
                {scenarioTravelers} {scenarioTravelers === 1 ? "traveler" : "travelers"}
              </span>
              <Stepper
                label="More"
                onClick={() => onTravelersChange(Math.min(12, scenarioTravelers + 1))}
                disabled={scenarioTravelers >= 12}
              >
                <Plus className="h-3.5 w-3.5" />
              </Stepper>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Trip length
            </span>
            <div className="mt-2 flex items-center gap-3">
              <Stepper
                label="Shorter"
                onClick={() => onDaysChange(Math.max(1, scenarioDays - 1))}
                disabled={scenarioDays <= 1}
              >
                <Minus className="h-3.5 w-3.5" />
              </Stepper>
              <span className="min-w-[5rem] text-center text-sm font-semibold">
                {scenarioDays} {scenarioDays === 1 ? "day" : "days"}
              </span>
              <Stepper
                label="Longer"
                onClick={() => onDaysChange(Math.min(maxDays, scenarioDays + 1))}
                disabled={scenarioDays >= maxDays}
              >
                <Plus className="h-3.5 w-3.5" />
              </Stepper>
            </div>
            <p className="mt-1 text-xs text-muted">Max {maxDays} days from your plan</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-background p-3">
            <input
              type="checkbox"
              checked={skipPaidActivities}
              onChange={(e) => onSkipPaidChange(e.target.checked)}
              className="mt-1 accent-primary"
            />
            <span>
              <span className="block text-sm font-semibold">Skip paid attractions</span>
              <span className="text-xs text-muted">
                Zero out activities ₱1,500+ to test a cheaper trip
              </span>
            </span>
          </label>
        </div>
      </div>

      {result.risks.length > 0 && (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-border">
          <h3 className="mb-3 font-display font-bold">Top risks</h3>
          <ul className="space-y-2">
            {result.risks.map((r) => (
              <li key={r.id} className="flex gap-2 text-sm text-muted">
                {r.severity === "critical" ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                )}
                {r.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.verdict !== "affordable" && strategies.length > 0 && (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-border">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <div>
              <h3 className="font-display text-lg font-bold">Make it fit</h3>
              <p className="text-sm text-muted">
                Apply a strategy to rewrite the plan to your budget.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {strategies.map((s) => (
              <div
                key={s.id}
                className="flex flex-col rounded-xl bg-background p-4 ring-1 ring-border"
              >
                <p className="font-display font-bold">{s.label}</p>
                <p className="mt-1 text-xs text-muted">{s.description}</p>
                <p className="mt-3 text-sm">
                  <span className="font-bold text-primary">
                    {formatCurrency(s.projectedCost)}
                  </span>
                  <span className="text-muted"> incl. buffer</span>
                </p>
                <ul className="mt-2 flex-1 space-y-1 text-xs text-muted">
                  {s.changes.slice(0, 3).map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                  {s.changes.length === 0 && <li>• Minor trims only</li>}
                </ul>
                <button
                  type="button"
                  disabled={applying}
                  onClick={() => onApplyStrategy(s)}
                  className="mt-4 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-50"
                >
                  Apply {s.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.verdict === "affordable" && (
        <div className="flex items-start gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-success ring-1 ring-success/20">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Your budget covers the projected trip cost with a 10% buffer.
        </div>
      )}
    </div>
  );
}

function Stepper({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-text ring-1 ring-border transition hover:ring-primary/40 disabled:opacity-35"
    >
      {children}
    </button>
  );
}
