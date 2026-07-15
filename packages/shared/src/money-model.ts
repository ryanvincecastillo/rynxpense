/**
 * Canonical trip money model (Phase 1).
 * Deterministic only — no humor, no LLM.
 */

export type CostLineKey =
  | "flights"
  | "hotel"
  | "food"
  | "activities"
  | "transport"
  | "other";

export type Necessity = "REQUIRED" | "PLANNED" | "OPTIONAL";
export type Flexibility = "FIXED" | "FLEXIBLE";

export type TripMoneyStatus = "SAFE" | "TIGHT" | "OVER_BUDGET" | "UNKNOWN";

export type FxSource = "manual" | "seed";

export interface FxSnapshot {
  amount: number;
  currency: string;
  rate: number;
  rateAsOf: string;
  source: FxSource;
}

/** Seed rates are labeled and visible — never a hidden constant. */
export const SEED_FX_RATES: Record<
  string,
  { rate: number; rateAsOf: string }
> = {
  JPY: { rate: 0.38, rateAsOf: "2026-07-01" },
  USD: { rate: 57.0, rateAsOf: "2026-07-01" },
};

export const DEFAULT_BUFFER_PCT = 0.1;
export const REQUIRED_FLEX_FLOOR_PCT = 0.6;

export interface CostLine {
  key: CostLineKey;
  label: string;
  necessity: Necessity;
  flexibility: Flexibility;
  estimatedTotal: number;
  /** Candidate evidence only — never source of truth for aggregates. */
  foundTotal?: number | null;
  /** Real obligation once user commits/books. */
  committedTotal?: number | null;
  /** Cash paid so far (supports deposits / partials). */
  paidAmount: number;
  note?: string;
  sourceUrl?: string;
  money?: { currency: "PHP"; original?: FxSnapshot };
}

export interface CostLineMeta {
  key: CostLineKey;
  label: string;
  necessity: Necessity;
  flexibility: Flexibility;
}

export const COST_LINE_META: Record<CostLineKey, CostLineMeta> = {
  flights: {
    key: "flights",
    label: "Flights",
    necessity: "REQUIRED",
    flexibility: "FIXED",
  },
  hotel: {
    key: "hotel",
    label: "Stay",
    necessity: "REQUIRED",
    flexibility: "FIXED",
  },
  food: {
    key: "food",
    label: "Food",
    necessity: "REQUIRED",
    flexibility: "FLEXIBLE",
  },
  activities: {
    key: "activities",
    label: "Activities",
    necessity: "PLANNED",
    flexibility: "FLEXIBLE",
  },
  transport: {
    key: "transport",
    label: "Local transport",
    necessity: "REQUIRED",
    flexibility: "FLEXIBLE",
  },
  other: {
    key: "other",
    label: "Misc",
    necessity: "OPTIONAL",
    flexibility: "FLEXIBLE",
  },
};

export const COST_LINE_KEYS: CostLineKey[] = [
  "flights",
  "hotel",
  "food",
  "activities",
  "transport",
  "other",
];

/** I1: found is excluded on purpose. */
export function effectiveTotal(line: CostLine): number {
  if (line.committedTotal != null && Number.isFinite(line.committedTotal)) {
    return Math.max(0, line.committedTotal);
  }
  return Math.max(0, line.estimatedTotal);
}

/** I2 */
export function remainingPayable(line: CostLine): number {
  return Math.max(0, effectiveTotal(line) - (line.paidAmount || 0));
}

export function convertWithFx(
  amount: number,
  currency: string,
  rateOverride?: number,
): { php: number; fx: FxSnapshot } {
  const cur = currency.toUpperCase();
  if (cur === "PHP") {
    return {
      php: Math.round(amount),
      fx: {
        amount,
        currency: "PHP",
        rate: 1,
        rateAsOf: new Date().toISOString().slice(0, 10),
        source: "manual",
      },
    };
  }
  const seed = SEED_FX_RATES[cur];
  const rate = rateOverride ?? seed?.rate;
  if (rate == null || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`No FX rate for ${cur}`);
  }
  const fx: FxSnapshot = {
    amount,
    currency: cur,
    rate,
    rateAsOf: seed?.rateAsOf ?? new Date().toISOString().slice(0, 10),
    source: rateOverride != null ? "manual" : "seed",
  };
  return { php: Math.round(amount * rate), fx };
}

export type CostLineOverride = Partial<
  Pick<
    CostLine,
    | "estimatedTotal"
    | "foundTotal"
    | "committedTotal"
    | "paidAmount"
    | "note"
    | "sourceUrl"
    | "necessity"
    | "flexibility"
  >
> & {
  /** Legacy localStorage fields */
  found?: number | null;
  booked?: number | null;
  spent?: number | null;
  estimated?: number | null;
};

export function normalizeOverride(over?: CostLineOverride | null): CostLineOverride {
  if (!over) return {};
  return {
    estimatedTotal: over.estimatedTotal ?? over.estimated ?? undefined,
    foundTotal: over.foundTotal ?? over.found ?? undefined,
    committedTotal: over.committedTotal ?? over.booked ?? undefined,
    paidAmount: over.paidAmount ?? over.spent ?? undefined,
    note: over.note,
    sourceUrl: over.sourceUrl,
    necessity: over.necessity,
    flexibility: over.flexibility,
  };
}

export function buildMoneyLines(
  breakdown?: Partial<Record<CostLineKey, number>> | Record<string, number> | null,
  overrides?: Partial<Record<CostLineKey, CostLineOverride>>,
): CostLine[] {
  return COST_LINE_KEYS.map((key) => {
    const meta = COST_LINE_META[key];
    const over = normalizeOverride(overrides?.[key]);
    const estimatedTotal = Number(
      over.estimatedTotal ?? breakdown?.[key] ?? 0,
    );
    return {
      key,
      label: meta.label,
      necessity: over.necessity ?? meta.necessity,
      flexibility: over.flexibility ?? meta.flexibility,
      estimatedTotal: Number.isFinite(estimatedTotal) ? estimatedTotal : 0,
      foundTotal: over.foundTotal ?? null,
      committedTotal: over.committedTotal ?? null,
      paidAmount: Math.max(0, Number(over.paidAmount ?? 0)),
      note: over.note,
      sourceUrl: over.sourceUrl,
      money: { currency: "PHP" },
    };
  });
}

export function linesToBreakdown(
  lines: CostLine[],
): Record<CostLineKey, number> {
  const out = {} as Record<CostLineKey, number>;
  for (const key of COST_LINE_KEYS) {
    const line = lines.find((l) => l.key === key);
    out[key] = line ? effectiveTotal(line) : 0;
  }
  return out;
}

export function projectedFromMoneyLines(lines: CostLine[]): number {
  return lines.reduce((s, l) => s + effectiveTotal(l), 0);
}

/**
 * Max reclaimable from a single flexible line under cut floors.
 * FIXED → 0. OPTIONAL/PLANNED FLEXIBLE → full remainingPayable.
 * REQUIRED FLEXIBLE → down to floorPct of estimatedTotal.
 */
export function maxReclaimable(line: CostLine): number {
  if (line.flexibility !== "FLEXIBLE") return 0;
  const payable = remainingPayable(line);
  if (payable <= 0) return 0;
  if (line.necessity === "REQUIRED") {
    const floor = Math.round(line.estimatedTotal * REQUIRED_FLEX_FLOOR_PCT);
    const minKeep = Math.max(0, floor - (line.paidAmount || 0));
    return Math.max(0, payable - minKeep);
  }
  return payable;
}

/** Cut priority for reclaimableAmount / requiredCuts. */
export function cutPriorityRank(line: CostLine): number {
  if (line.flexibility !== "FLEXIBLE") return 99;
  if (line.necessity === "OPTIONAL") return 0;
  if (line.necessity === "PLANNED") return 1;
  if (line.necessity === "REQUIRED") return 2;
  return 99;
}
