"use client";

import { useMemo, useState } from "react";
import {
  formatCurrency,
  buildCostLines,
  lineStage,
  effectiveLineAmount,
  parsePastePrice,
  type CostLine,
  type CostLineKey,
  type CostStage,
} from "@rynxpense/shared";
import { Link2, Check } from "lucide-react";
import { upsertCostLineOverride } from "@/lib/cost-lines";

const STAGE_LABEL: Record<CostStage, string> = {
  estimated: "AI estimated",
  found: "Price found",
  booked: "Booked",
  spent: "Spent",
};

type Props = {
  tripId: string;
  breakdown: Record<string, number> | null | undefined;
  overrides: Partial<Record<CostLineKey, Partial<CostLine>>>;
  onOverridesChange: (next: Partial<Record<CostLineKey, Partial<CostLine>>>) => void;
};

export function BudgetLifecyclePanel({
  tripId,
  breakdown,
  overrides,
  onOverridesChange,
}: Props) {
  const [paste, setPaste] = useState("");
  const [pasteMsg, setPasteMsg] = useState("");
  const [editing, setEditing] = useState<CostLineKey | null>(null);
  const [editValue, setEditValue] = useState("");

  const lines = useMemo(
    () => buildCostLines(breakdown, overrides),
    [breakdown, overrides],
  );

  const applyPaste = () => {
    const parsed = parsePastePrice(paste);
    if (!parsed) {
      setPasteMsg("Couldn’t find a peso amount — try “Flight ₱12,500”.");
      return;
    }
    const next = upsertCostLineOverride(tripId, parsed.category, {
      found: parsed.amount,
      note: parsed.note,
    });
    onOverridesChange(next);
    setPasteMsg(
      `Applied ₱${parsed.amount.toLocaleString("en-PH")} to ${parsed.category}.`,
    );
    setPaste("");
  };

  const saveConfirmed = (key: CostLineKey) => {
    const n = Number(editValue.replace(/[^\d]/g, ""));
    if (!n) return;
    const next = upsertCostLineOverride(tripId, key, { found: n });
    onOverridesChange(next);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 ring-1 ring-border">
        <h3 className="font-display text-lg font-bold">Paste a price</h3>
        <p className="mt-1 text-sm text-muted">
          Found a real quote? Paste it — we update the projection (no booking API needed).
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder="e.g. Cebu Pacific DVO→NRT ₱11,850 roundtrip"
            className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={applyPaste}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Link2 className="h-4 w-4" />
            Use this price
          </button>
        </div>
        {pasteMsg && <p className="mt-2 text-xs text-muted">{pasteMsg}</p>}
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-border">
        <h3 className="font-display text-lg font-bold">Estimated → Found → Spent</h3>
        <p className="mt-1 text-sm text-muted">
          AI estimates stay visible. Confirmed prices replace them in the projection.
        </p>
        <div className="mt-4 space-y-3">
          {lines.map((line) => {
            const stage = lineStage(line);
            const effective = effectiveLineAmount(line);
            const delta = effective - line.estimated;
            return (
              <div
                key={line.key}
                className="rounded-xl bg-background px-3 py-3 ring-1 ring-border/60"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold capitalize">{line.label}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {STAGE_LABEL[stage]}
                      {line.note ? ` · ${line.note.slice(0, 40)}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(effective)}</p>
                    {line.estimated > 0 && (
                      <p className="text-xs text-muted">
                        est. {formatCurrency(line.estimated)}
                        {delta !== 0 && (
                          <span className={delta > 0 ? " text-error" : " text-success"}>
                            {" "}
                            ({delta > 0 ? "+" : ""}
                            {formatCurrency(delta)})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                {editing === line.key ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-32 rounded-lg border border-border px-2 py-1.5 text-sm"
                      placeholder="₱ amount"
                    />
                    <button
                      type="button"
                      onClick={() => saveConfirmed(line.key)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="text-xs text-muted"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(line.key);
                      setEditValue(String(effective || ""));
                    }}
                    className="mt-2 text-xs font-semibold text-primary hover:underline"
                  >
                    Confirm / edit price
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
