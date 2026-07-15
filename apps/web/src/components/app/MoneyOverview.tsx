"use client";

import {
  formatCurrency,
  pickRynxCopy,
  statusContext,
  breathingContext,
  type TripMoneyState,
  type FitStrategy,
  type ImpactResult,
} from "@rynxpense/shared";
import { CanIAffordPanel } from "@/components/app/CanIAffordPanel";
import { FeasibilityOverview } from "@/components/app/FeasibilityOverview";
import type { TripFeasibilityResult } from "@rynxpense/shared";

type Props = {
  money: TripMoneyState;
  feasibility: TripFeasibilityResult | null;
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
  cutTarget: ImpactResult | null;
  onConfirmBuy: (result: ImpactResult, note: string) => void;
  onFindCuts: (result: ImpactResult) => void;
  onApplyCuts: (result: ImpactResult) => void;
  onClearCuts: () => void;
};

export function MoneyOverview({
  money,
  feasibility,
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
  cutTarget,
  onConfirmBuy,
  onFindCuts,
  onApplyCuts,
  onClearCuts,
}: Props) {
  const statusCopy = pickRynxCopy(statusContext(money.status), money.status);
  const breathCopy = pickRynxCopy(
    breathingContext(money.breathingRoom),
    String(money.breathingRoom),
  );
  const freeCopy = pickRynxCopy(
    money.freeToSpend > 0 ? "free_to_spend.has_room" : "free_to_spend.empty",
    String(money.freeToSpend),
  );
  const cutsCopy = cutTarget
    ? pickRynxCopy(
        cutTarget.requiredCuts.length ? "find_cuts.intro" : "find_cuts.none",
        String(cutTarget.budgetGap),
      )
    : null;

  const breathLabel =
    money.breathingRoom >= 0
      ? `${formatCurrency(money.breathingRoom)} breathing room`
      : `${formatCurrency(Math.abs(money.breathingRoom))} over budget`;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 ring-1 ring-border sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Trip money status
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-text">
              {breathLabel}
            </p>
            <p className="mt-2 text-sm text-muted">{statusCopy.text}</p>
            <p className="mt-1 text-sm text-muted">{breathCopy.text}</p>
          </div>
          <div className="rounded-xl bg-background px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Status
            </p>
            <p className="font-display text-lg font-bold">{money.status}</p>
            {feasibility && (
              <p className="mt-1 text-[10px] text-muted">
                Score {feasibility.score} (secondary)
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Free to spend"
            value={formatCurrency(money.freeToSpend)}
            hint={freeCopy.text}
          />
          <Stat
            label="Safe daily"
            value={formatCurrency(money.freeDailySpend)}
            hint={`${money.remainingDays} day${money.remainingDays === 1 ? "" : "s"} left`}
          />
          <Stat
            label="Reclaimable (explicit cuts)"
            value={formatCurrency(money.reclaimableAmount)}
            hint="Not automatic happy money"
          />
        </div>
      </div>

      <CanIAffordPanel
        money={money}
        onConfirmBuy={onConfirmBuy}
        onFindCuts={onFindCuts}
      />

      {cutTarget && cutsCopy && (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-border">
          <h3 className="font-display text-lg font-bold">Find money to cut</h3>
          <p className="mt-1 text-sm text-muted">{cutsCopy.text}</p>
          <p className="mt-3 text-sm font-semibold">
            Gap: {formatCurrency(cutTarget.budgetGap)}
          </p>
          {cutTarget.requiredCuts.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {cutTarget.requiredCuts.map((c) => (
                <li
                  key={c.category}
                  className="flex justify-between rounded-xl bg-background px-3 py-2 text-sm"
                >
                  <span>{c.label}</span>
                  <span className="font-semibold">
                    −{formatCurrency(c.reduceBy)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">
              No flexible cost lines left under cut floors.
            </p>
          )}
          <p className="mt-3 text-xs text-muted">
            Cost-line cuts only. Itinerary suggestions (e.g. drop a specific
            activity) come from Make It Fit when you apply a strategy below.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cutTarget.requiredCuts.length > 0 && (
              <button
                type="button"
                onClick={() => onApplyCuts(cutTarget)}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Apply cost-line cuts
              </button>
            )}
            <button
              type="button"
              onClick={onClearCuts}
              className="text-sm font-semibold text-primary"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {feasibility && (
        <FeasibilityOverview
          result={feasibility}
          scenarioBudget={scenarioBudget}
          scenarioTravelers={scenarioTravelers}
          scenarioDays={scenarioDays}
          maxDays={maxDays}
          skipPaidActivities={skipPaidActivities}
          onBudgetChange={onBudgetChange}
          onTravelersChange={onTravelersChange}
          onDaysChange={onDaysChange}
          onSkipPaidChange={onSkipPaidChange}
          onResetScenario={onResetScenario}
          strategies={strategies}
          onApplyStrategy={onApplyStrategy}
          applying={applying}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl bg-background px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
