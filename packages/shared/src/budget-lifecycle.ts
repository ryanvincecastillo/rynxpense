import type { BudgetBreakdown } from "./index";
import {
  buildMoneyLines,
  COST_LINE_META,
  effectiveTotal,
  type CostLine,
  type CostLineKey,
  type CostLineOverride,
} from "./money-model";

export type { CostLine, CostLineKey, CostLineOverride };
export {
  buildMoneyLines,
  effectiveTotal,
  remainingPayable,
  projectedFromMoneyLines,
} from "./money-model";

/** UI stage label — derived, not a financial source of truth. */
export type CostStage = "estimated" | "found" | "committed" | "paid";

export interface PastePriceResult {
  amount: number;
  category: CostLineKey;
  note: string;
  raw: string;
}

const CATEGORY_KEYWORDS: { key: CostLineKey; words: string[] }[] = [
  { key: "flights", words: ["flight", "airfare", "cebu pacific", "airasia", "pal", "plane", "airport", "roundtrip", "round trip"] },
  { key: "hotel", words: ["hotel", "hostel", "airbnb", "stay", "accommodation", "inn", "resort"] },
  { key: "food", words: ["food", "ramen", "restaurant", "meal", "dining", "cafe", "lunch", "dinner"] },
  { key: "activities", words: ["ticket", "tour", "museum", "activity", "attraction", "pass", "teamlab"] },
  { key: "transport", words: ["train", "metro", "taxi", "grab", "transport", "jr pass", "suica"] },
];

/** @deprecated Prefer buildMoneyLines — kept as alias. */
export function buildCostLines(
  breakdown?: Partial<BudgetBreakdown> | Record<string, number> | null,
  overrides?: Partial<Record<CostLineKey, CostLineOverride>>,
): CostLine[] {
  return buildMoneyLines(breakdown, overrides);
}

/**
 * Projection amount for display / feasibility bridge.
 * Uses committed ?? estimated — found never wins.
 */
export function effectiveLineAmount(line: CostLine): number {
  return effectiveTotal(line);
}

export function lineStage(line: CostLine): CostStage {
  if ((line.paidAmount || 0) > 0 && remainingPaidInFull(line)) return "paid";
  if ((line.paidAmount || 0) > 0) return "committed"; // partial pay still committed
  if (line.committedTotal != null && line.committedTotal > 0) return "committed";
  if (line.foundTotal != null && line.foundTotal > 0) return "found";
  return "estimated";
}

function remainingPaidInFull(line: CostLine): boolean {
  return (line.paidAmount || 0) >= effectiveTotal(line) && effectiveTotal(line) > 0;
}

export function projectedFromLines(lines: CostLine[]): number {
  return lines.reduce((s, l) => s + effectiveTotal(l), 0);
}

export function linesToBreakdownLegacy(lines: CostLine[]): BudgetBreakdown {
  const get = (key: CostLineKey) =>
    effectiveTotal(
      lines.find((l) => l.key === key) ?? {
        key,
        label: "",
        necessity: COST_LINE_META[key].necessity,
        flexibility: COST_LINE_META[key].flexibility,
        estimatedTotal: 0,
        paidAmount: 0,
      },
    );
  return {
    flights: get("flights"),
    hotel: get("hotel"),
    food: get("food"),
    activities: get("activities"),
    transport: get("transport"),
    other: get("other"),
  };
}

/** Alias used by TripDetailClient */
export { linesToBreakdownLegacy as linesToBreakdown };

/** Parse free text like "Cebu Pacific Davao to Tokyo ₱11,850 roundtrip" */
export function parsePastePrice(raw: string): PastePriceResult | null {
  const text = raw.trim();
  if (!text) return null;

  const amountMatch =
    text.match(/(?:₱|php|php\s*)\s*([\d,]+(?:\.\d+)?)/i) ||
    text.match(/\b([\d]{1,3}(?:,[\d]{3})+|\d{4,})\b/);
  if (!amountMatch) return null;

  const amount = Math.round(Number(amountMatch[1].replace(/,/g, "")));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const lower = text.toLowerCase();
  let category: CostLineKey = "other";
  for (const row of CATEGORY_KEYWORDS) {
    if (row.words.some((w) => lower.includes(w))) {
      category = row.key;
      break;
    }
  }

  return {
    amount,
    category,
    note: text.slice(0, 120),
    raw: text,
  };
}

export interface BudgetAutopsyResult {
  planned: number;
  actual: number;
  variance: number;
  variancePct: number;
  byCategory: Array<{
    key: CostLineKey;
    label: string;
    planned: number;
    actual: number;
    delta: number;
  }>;
  insight: string;
}

export function computeBudgetAutopsy(params: {
  plannedBreakdown: Partial<BudgetBreakdown> | Record<string, number> | null;
  expenses: Array<{ amount: number; category: string }>;
  totalEstimated?: number | null;
}): BudgetAutopsyResult {
  const plannedLines = buildMoneyLines(params.plannedBreakdown);
  const planned =
    params.totalEstimated && params.totalEstimated > 0
      ? params.totalEstimated
      : projectedFromLines(plannedLines);

  const actualByKey: Record<CostLineKey, number> = {
    flights: 0,
    hotel: 0,
    food: 0,
    activities: 0,
    transport: 0,
    other: 0,
  };

  for (const e of params.expenses) {
    const cat = e.category.toLowerCase();
    let key: CostLineKey = "other";
    if (cat.includes("flight")) key = "flights";
    else if (cat.includes("hotel") || cat.includes("stay") || cat.includes("accommodation"))
      key = "hotel";
    else if (cat.includes("food") || cat.includes("dining") || cat.includes("meal")) key = "food";
    else if (cat.includes("activ")) key = "activities";
    else if (cat.includes("transport") || cat.includes("grab") || cat.includes("taxi"))
      key = "transport";
    actualByKey[key] += e.amount;
  }

  const actual = Object.values(actualByKey).reduce((a, b) => a + b, 0);
  const variance = actual - planned;
  const variancePct = planned > 0 ? (variance / planned) * 100 : 0;

  const byCategory = (Object.keys(COST_LINE_META) as CostLineKey[]).map((key) => {
    const plannedAmt = plannedLines.find((l) => l.key === key)?.estimatedTotal ?? 0;
    const actualAmt = actualByKey[key];
    return {
      key,
      label: COST_LINE_META[key].label,
      planned: plannedAmt,
      actual: actualAmt,
      delta: actualAmt - plannedAmt,
    };
  });

  const worst = [...byCategory].sort((a, b) => b.delta - a.delta)[0];
  let insight = "Not enough spend logged yet for a full autopsy.";
  if (actual > 0) {
    if (variance > 0 && worst && worst.delta > 0) {
      insight = `You're ${Math.abs(variancePct).toFixed(1)}% over plan. Biggest overrun: ${worst.label} (+₱${worst.delta.toLocaleString("en-PH")}).`;
    } else if (variance < 0) {
      insight = `You're ${Math.abs(variancePct).toFixed(1)}% under plan so far — nice tipid energy.`;
    } else {
      insight = "Actual spend is tracking close to the plan.";
    }
  }

  return { planned, actual, variance, variancePct, byCategory, insight };
}

export interface TravelerCostProfile {
  foodMultiplier: number;
  activityMultiplier: number;
  typicalOverrunPct: number;
  tripsSampled: number;
  updatedAt: string;
}

export function updateTravelerCostProfile(
  prev: TravelerCostProfile | null,
  autopsy: BudgetAutopsyResult,
): TravelerCostProfile {
  const food = autopsy.byCategory.find((c) => c.key === "food");
  const act = autopsy.byCategory.find((c) => c.key === "activities");
  const foodMult =
    food && food.planned > 0 ? food.actual / food.planned : prev?.foodMultiplier ?? 1;
  const actMult =
    act && act.planned > 0 ? act.actual / act.planned : prev?.activityMultiplier ?? 1;
  const overrun = autopsy.planned > 0 ? autopsy.variancePct / 100 : 0;
  const n = (prev?.tripsSampled ?? 0) + 1;
  const blend = (oldV: number, newV: number) => (oldV * (n - 1) + newV) / n;

  return {
    foodMultiplier: clamp(blend(prev?.foodMultiplier ?? 1, foodMult), 0.6, 2.2),
    activityMultiplier: clamp(blend(prev?.activityMultiplier ?? 1, actMult), 0.6, 2.2),
    typicalOverrunPct: clamp(blend(prev?.typicalOverrunPct ?? 0, overrun), -0.3, 0.5),
    tripsSampled: n,
    updatedAt: new Date().toISOString(),
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
