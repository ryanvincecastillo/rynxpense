"use client";

import { useMemo, useState } from "react";
import {
  applyDecision,
  convertWithFx,
  formatCurrency,
  pickRynxCopy,
  affordContext,
  spicyAmountLine,
  SEED_FX_RATES,
  type TripMoneyState,
  type ImpactResult,
  type CostLineKey,
} from "@rynxpense/shared";

type Props = {
  money: TripMoneyState;
  onConfirmBuy: (result: ImpactResult, note: string) => void;
  onFindCuts: (result: ImpactResult) => void;
};

const CURRENCIES = ["PHP", "JPY", "USD"] as const;

export function CanIAffordPanel({ money, onConfirmBuy, onFindCuts }: Props) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("PHP");
  const [rate, setRate] = useState(String(SEED_FX_RATES.JPY?.rate ?? 0.38));
  const [note, setNote] = useState("");
  const [result, setResult] = useState<ImpactResult | null>(null);

  const seed = SEED_FX_RATES[currency];

  const check = () => {
    const n = Number(amount.replace(/[^\d.]/g, ""));
    if (!n || n <= 0) return;
    try {
      const { php, fx } =
        currency === "PHP"
          ? {
              php: Math.round(n),
              fx: {
                amount: n,
                currency: "PHP" as const,
                rate: 1,
                rateAsOf: new Date().toISOString().slice(0, 10),
                source: "manual" as const,
              },
            }
          : convertWithFx(n, currency, Number(rate) || undefined);
      const impact = applyDecision(money, {
        type: "PURCHASE",
        amountPhp: php,
        category: "other" as CostLineKey,
        note,
        fx,
      });
      setResult(impact);
    } catch {
      setResult(null);
    }
  };

  const copy = useMemo(() => {
    if (!result) return null;
    return pickRynxCopy(affordContext(result.verdict), String(result.amountPhp));
  }, [result]);

  const spicy = result ? spicyAmountLine(result.amountPhp) : null;

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-border">
      <h3 className="font-display text-lg font-bold">Can I afford this?</h3>
      <p className="mt-1 text-sm text-muted">
        Check a purchase before you swipe. Math first — jokes optional.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="sm:col-span-1">
          <span className="text-xs font-semibold text-muted">Amount</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="18000"
            className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label>
          <span className="text-xs font-semibold text-muted">Currency</span>
          <select
            value={currency}
            onChange={(e) => {
              const c = e.target.value as (typeof CURRENCIES)[number];
              setCurrency(c);
              if (c !== "PHP" && SEED_FX_RATES[c]) {
                setRate(String(SEED_FX_RATES[c].rate));
              }
            }}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold text-muted">
            Rate to PHP{seed ? ` · as of ${seed.rateAsOf}` : ""}
          </span>
          <input
            type="text"
            inputMode="decimal"
            disabled={currency === "PHP"}
            value={currency === "PHP" ? "1" : rate}
            onChange={(e) => setRate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-background"
          />
        </label>
      </div>
      {currency !== "PHP" && (
        <p className="mt-1.5 text-xs text-muted">
          Conversion is visible and editable. Source:{" "}
          {Number(rate) === seed?.rate ? "seed rate" : "manual override"}.
        </p>
      )}

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note (e.g. shoes in Shibuya)"
        className="mt-3 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
      />

      <button
        type="button"
        onClick={check}
        className="mt-3 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
      >
        Check impact
      </button>

      {result && copy && (
        <div className="mt-5 space-y-3 border-t border-border pt-4">
          <p className="text-sm text-muted">{copy.text}</p>
          {spicy && <p className="text-sm text-muted">{spicy}</p>}

          <div className="grid gap-2 sm:grid-cols-3">
            <Metric
              label="Amount (PHP)"
              value={formatCurrency(result.amountPhp)}
            />
            <Metric
              label="Free to spend"
              value={`${formatCurrency(result.freeToSpendBefore)} → ${formatCurrency(result.freeToSpendAfter)}`}
            />
            <Metric
              label="Daily"
              value={`${formatCurrency(result.freeDailySpendBefore)} → ${formatCurrency(result.freeDailySpendAfter)}`}
            />
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Verdict: {result.verdict.replaceAll("_", " ")}
          </p>

          {result.requiredCuts.length > 0 && (
            <div className="rounded-xl bg-background px-3 py-3">
              <p className="text-xs font-semibold text-muted">
                Required cost-line cuts (not itinerary items)
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {result.requiredCuts.map((c) => (
                  <li key={c.category}>
                    {c.label}: reduce by {formatCurrency(c.reduceBy)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {result.verdict !== "DOES_NOT_FIT" && (
              <button
                type="button"
                onClick={() => onConfirmBuy(result, note)}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Buy & log expense
              </button>
            )}
            {result.verdict !== "FITS" && (
              <button
                type="button"
                onClick={() => onFindCuts(result)}
                className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
              >
                Find {formatCurrency(result.budgetGap)} to cut
              </button>
            )}
            <button
              type="button"
              onClick={() => setResult(null)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-muted"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-0.5 font-display text-sm font-bold text-text">{value}</p>
    </div>
  );
}
