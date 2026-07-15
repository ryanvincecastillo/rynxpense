"use client";

import { useMemo, useState } from "react";
import {
  formatCurrency,
  buildCostLines,
  lineStage,
  effectiveLineAmount,
  parsePastePrice,
  pickRynxCopy,
  impactIfBookFound,
  moneyStateFromBreakdown,
  type CostLine,
  type CostLineKey,
  type CostLineOverride,
  type CostStage,
} from "@rynxpense/shared";
import { Link2, Check } from "lucide-react";
import { upsertCostLineOverride } from "@/lib/cost-lines";

const STAGE_LABEL: Record<CostStage, string> = {
  estimated: "Estimated",
  found: "Price found (evidence)",
  committed: "Committed",
  paid: "Paid",
};

type Props = {
  tripId: string;
  budget: number;
  startDate: string;
  endDate: string;
  breakdown: Record<string, number> | null | undefined;
  overrides: Partial<Record<CostLineKey, CostLineOverride>>;
  onOverridesChange: (next: Partial<Record<CostLineKey, CostLineOverride>>) => void;
  onMoneyEvent?: (type: string, category: string, amount: number, meta?: Record<string, unknown>) => void;
};

export function BudgetLifecyclePanel({
  tripId,
  budget,
  startDate,
  endDate,
  breakdown,
  overrides,
  onOverridesChange,
  onMoneyEvent,
}: Props) {
  const [paste, setPaste] = useState("");
  const [pasteMsg, setPasteMsg] = useState("");
  const [editing, setEditing] = useState<CostLineKey | null>(null);
  const [editValue, setEditValue] = useState("");
  const [mode, setMode] = useState<"found" | "commit" | "pay">("found");

  const lines = useMemo(
    () => buildCostLines(breakdown, overrides),
    [breakdown, overrides],
  );

  const money = useMemo(
    () =>
      moneyStateFromBreakdown({
        budget,
        breakdown,
        overrides,
        startDate,
        endDate,
      }),
    [budget, breakdown, overrides, startDate, endDate],
  );

  const applyPaste = () => {
    const parsed = parsePastePrice(paste);
    if (!parsed) {
      setPasteMsg("Couldn’t find a peso amount — try “Flight ₱12,500”.");
      return;
    }
    const next = upsertCostLineOverride(tripId, parsed.category, {
      foundTotal: parsed.amount,
      note: parsed.note,
    });
    onOverridesChange(next);
    onMoneyEvent?.("price_found", parsed.category, parsed.amount, {
      note: parsed.note,
    });

    const line = buildCostLines(breakdown, next).find((l) => l.key === parsed.category);
    let msg = `Found ₱${parsed.amount.toLocaleString("en-PH")} on ${parsed.category} (evidence only — not committed).`;
    if (line && line.estimatedTotal > 0) {
      const hypo = impactIfBookFound(
        moneyStateFromBreakdown({
          budget,
          breakdown,
          overrides: next,
          startDate,
          endDate,
        }),
        parsed.category,
        parsed.amount,
      );
      if (hypo.breathingRoomDelta !== 0) {
        const better = hypo.breathingRoomDelta > 0;
        const tone = pickRynxCopy(better ? "price.found_better" : "price.found_worse");
        msg += ` ${tone.text} Δ breathing room ${hypo.breathingRoomDelta > 0 ? "+" : ""}${hypo.breathingRoomDelta.toLocaleString("en-PH")}.`;
      }
    }
    setPasteMsg(msg);
    setPaste("");
  };

  const saveEdit = (key: CostLineKey) => {
    const n = Number(editValue.replace(/[^\d]/g, ""));
    if (!n) return;
    let patch: CostLineOverride = {};
    if (mode === "found") {
      patch = { foundTotal: n };
      onMoneyEvent?.("price_found", key, n);
    } else if (mode === "commit") {
      patch = { committedTotal: n };
      onMoneyEvent?.("committed", key, n);
    } else {
      const line = lines.find((l) => l.key === key);
      const committed = line?.committedTotal ?? line?.estimatedTotal ?? n;
      patch = {
        committedTotal: committed,
        paidAmount: Math.min(committed, (line?.paidAmount || 0) + n),
      };
      onMoneyEvent?.("paid", key, n, { committedTotal: committed });
    }
    const next = upsertCostLineOverride(tripId, key, patch);
    onOverridesChange(next);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 ring-1 ring-border">
        <h3 className="font-display text-lg font-bold">Paste a price</h3>
        <p className="mt-1 text-sm text-muted">
          Found a quote? Paste it as evidence. Booking still requires Mark committed.
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
            Save as found
          </button>
        </div>
        {pasteMsg && <p className="mt-2 text-xs text-muted">{pasteMsg}</p>}
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-border">
        <h3 className="font-display text-lg font-bold">
          Estimated → Found → Committed → Paid
        </h3>
        <p className="mt-1 text-sm text-muted">
          Found ≠ committed. Projection uses committed (or estimate). Deposits update paid
          without changing the obligation.
        </p>
        <p className="mt-2 text-xs text-muted">
          Breathing room: {formatCurrency(money.breathingRoom)} · Free to spend:{" "}
          {formatCurrency(money.freeToSpend)}
        </p>
        <div className="mt-4 space-y-3">
          {lines.map((line) => (
            <LineRow
              key={line.key}
              line={line}
              editing={editing === line.key}
              editValue={editValue}
              mode={mode}
              onStartEdit={() => {
                setEditing(line.key);
                setEditValue(
                  String(
                    line.foundTotal ??
                      line.committedTotal ??
                      line.estimatedTotal ??
                      "",
                  ),
                );
                setMode("found");
              }}
              onCancel={() => setEditing(null)}
              onMode={setMode}
              onEditValue={setEditValue}
              onSave={() => saveEdit(line.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LineRow({
  line,
  editing,
  editValue,
  mode,
  onStartEdit,
  onCancel,
  onMode,
  onEditValue,
  onSave,
}: {
  line: CostLine;
  editing: boolean;
  editValue: string;
  mode: "found" | "commit" | "pay";
  onStartEdit: () => void;
  onCancel: () => void;
  onMode: (m: "found" | "commit" | "pay") => void;
  onEditValue: (v: string) => void;
  onSave: () => void;
}) {
  const stage = lineStage(line);
  const effective = effectiveLineAmount(line);
  const delta =
    line.foundTotal != null && line.foundTotal > 0
      ? line.foundTotal - line.estimatedTotal
      : effective - line.estimatedTotal;

  return (
    <div className="rounded-xl bg-background px-3 py-3 ring-1 ring-border/60">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold capitalize">{line.label}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {STAGE_LABEL[stage]} · {line.necessity}/{line.flexibility}
            {line.note ? ` · ${line.note.slice(0, 40)}` : ""}
          </p>
          {line.foundTotal != null && line.foundTotal > 0 && (
            <p className="mt-0.5 text-xs text-muted">
              Found: {formatCurrency(line.foundTotal)} (not in projection)
            </p>
          )}
          {(line.paidAmount || 0) > 0 && (
            <p className="mt-0.5 text-xs text-muted">
              Paid: {formatCurrency(line.paidAmount)} · remaining payable{" "}
              {formatCurrency(Math.max(0, effective - line.paidAmount))}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-primary">{formatCurrency(effective)}</p>
          {line.estimatedTotal > 0 && (
            <p className="text-xs text-muted">
              est. {formatCurrency(line.estimatedTotal)}
              {delta !== 0 && line.foundTotal != null && (
                <span className={delta > 0 ? " text-error" : " text-success"}>
                  {" "}
                  (found {delta > 0 ? "+" : ""}
                  {formatCurrency(delta)})
                </span>
              )}
            </p>
          )}
        </div>
      </div>
      {editing ? (
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap gap-2 text-xs">
            {(
              [
                ["found", "Found"],
                ["commit", "Commit"],
                ["pay", "Pay / deposit"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onMode(id)}
                className={`rounded-lg px-2 py-1 font-semibold ${
                  mode === id ? "bg-primary text-white" : "bg-white text-muted ring-1 ring-border"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={editValue}
              onChange={(e) => onEditValue(e.target.value)}
              className="w-32 rounded-lg border border-border px-2 py-1.5 text-sm"
              placeholder="₱ amount"
            />
            <button
              type="button"
              onClick={onSave}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={onCancel} className="text-xs text-muted">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onStartEdit}
          className="mt-2 text-xs font-semibold text-primary hover:underline"
        >
          Update found / commit / pay
        </button>
      )}
    </div>
  );
}
