"use client";

import { useState } from "react";
import { formatCurrency } from "@rynxpense/shared";
import type { RealityCheckResult } from "@rynxpense/shared";
import { Scale, X, AlertTriangle, CheckCircle } from "lucide-react";

export function RealityCheckModal({
  result,
  onClose,
}: {
  result: RealityCheckResult;
  onClose: () => void;
}) {
  const verdictColor = {
    fits: "text-success",
    tight: "text-warning",
    over: "text-error",
  }[result.verdict];

  const VerdictIcon =
    result.verdict === "fits" ? CheckCircle : AlertTriangle;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-bold">
            <Scale className="h-5 w-5 text-primary" />
            Budget reality check
          </h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className={`flex items-center gap-2 rounded-xl bg-background p-4 ${verdictColor}`}>
            <VerdictIcon className="h-5 w-5 shrink-0" />
            <div className="text-sm">
              {result.verdict === "fits" && (
                <p>
                  <strong>Looks realistic.</strong> Plan + 10% buffer fits your stated budget.
                </p>
              )}
              {result.verdict === "tight" && (
                <p>
                  <strong>Tight fit.</strong> You&apos;re {formatCurrency(result.gap)} over after
                  buffer — consider trimming inspo saves.
                </p>
              )}
              {result.verdict === "over" && (
                <p>
                  <strong>Over budget.</strong> Viral itineraries often skip flights/hotels. Gap:{" "}
                  {formatCurrency(result.gap)}.
                </p>
              )}
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div className="space-y-2">
              {result.warnings.map((w, i) => (
                <p
                  key={i}
                  className="flex gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-text"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  {w}
                </p>
              ))}
            </div>
          )}

          <div className="divide-y divide-border rounded-xl ring-1 ring-border">
            {result.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className={item.included ? "text-text" : "text-muted line-through"}>
                  {item.label}
                </span>
                <span className="font-semibold">
                  {item.amount > 0 ? formatCurrency(item.amount) : "—"}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-background px-4 py-3 text-sm">
              <span className="text-muted">10% safety buffer</span>
              <span className="font-semibold">{formatCurrency(result.buffer)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 font-bold">
              <span>Grand total</span>
              <span className="text-primary">{formatCurrency(result.grandTotal)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted">Your budget</span>
              <span>{formatCurrency(result.statedBudget)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RealityCheckButton({
  result,
}: {
  result: RealityCheckResult;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-2 text-sm font-semibold text-text ring-1 ring-warning/30 transition hover:bg-warning/20"
      >
        <Scale className="h-4 w-4 text-warning" />
        Reality check
      </button>
      {open && <RealityCheckModal result={result} onClose={() => setOpen(false)} />}
    </>
  );
}
