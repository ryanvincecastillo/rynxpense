/**
 * TripImpactEngine — deterministic decision math.
 * No humor / copy lives here (see rynx-tone.ts).
 */

import {
  buildMoneyLines,
  cutPriorityRank,
  DEFAULT_BUFFER_PCT,
  effectiveTotal,
  maxReclaimable,
  remainingPayable,
  type CostLine,
  type CostLineKey,
  type CostLineOverride,
  type FxSnapshot,
  type TripMoneyStatus,
} from "./money-model";

export type AffordVerdict = "FITS" | "POSSIBLE_WITH_TRADEOFF" | "DOES_NOT_FIT";

export type DecisionType =
  | "PURCHASE"
  | "ADD_EXPENSE"
  | "CHANGE_BUDGET"
  | "BOOK_FLIGHT"
  | "BOOK_HOTEL"
  | "PRICE_FOUND";

export interface RequiredCut {
  category: CostLineKey;
  label: string;
  reduceBy: number;
  remainingAfter: number;
}

/** Itinerary-level suggestions — empty from this engine in Phase 1. */
export interface SuggestedPlanChange {
  activityTitle: string;
  dayNumber?: number;
  action: "remove" | "trim" | "replace";
  amount?: number;
  note?: string;
}

export interface TripMoneyState {
  budget: number;
  bufferPct: number;
  reservedBuffer: number;
  projectedTripTotal: number;
  paidTotal: number;
  remainingBudget: number;
  remainingRequiredObligations: number;
  remainingPlannedReserve: number;
  remainingObligations: number;
  breathingRoom: number;
  /** Canonical discretionary capacity — never includes OPTIONAL silently. */
  freeToSpend: number;
  freeDailySpend: number;
  reclaimableAmount: number;
  remainingDays: number;
  status: TripMoneyStatus;
  lines: CostLine[];
  startDate: string;
  endDate: string;
}

export interface Decision {
  type: DecisionType;
  amountPhp: number;
  category?: CostLineKey;
  note?: string;
  fx?: FxSnapshot;
  /** For BOOK_*: mark committed; for ADD_EXPENSE/PURCHASE with payNow, add paid. */
  payNow?: boolean;
  committedTotal?: number;
  foundTotal?: number;
}

export interface ImpactResult {
  verdict: AffordVerdict;
  statusBefore: TripMoneyStatus;
  statusAfter: TripMoneyStatus;
  breathingRoomBefore: number;
  breathingRoomAfter: number;
  freeToSpendBefore: number;
  freeToSpendAfter: number;
  freeDailySpendBefore: number;
  freeDailySpendAfter: number;
  budgetGap: number;
  reclaimableAmount: number;
  /** Deterministic cost-line reductions only. */
  requiredCuts: RequiredCut[];
  /**
   * Itinerary item suggestions. Phase 1: always [] from TripImpactEngine.
   * Make It Fit / plan optimizer may fill separately when cost↔item mapping exists.
   */
  suggestedPlanChanges: SuggestedPlanChange[];
  recommendedActions: Array<"find_cuts" | "skip" | "buy_anyway" | "book_found">;
  amountPhp: number;
  fx?: FxSnapshot;
}

export interface MoneyStateInput {
  budget: number;
  lines: CostLine[];
  startDate: string;
  endDate: string;
  today?: string | Date;
  bufferPct?: number;
}

function parseDateOnly(d: string | Date): Date {
  if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function computeRemainingDays(
  startDate: string,
  endDate: string,
  today: string | Date = new Date(),
): number {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const now = parseDateOnly(today);
  if (now > end) return 0;
  const from = now < start ? start : now;
  const ms = end.getTime() - from.getTime();
  return Math.max(1, Math.floor(ms / 86_400_000) + 1);
}

export function computeReclaimableAmount(lines: CostLine[]): number {
  return lines.reduce((s, l) => s + maxReclaimable(l), 0);
}

/**
 * Greedy minimal ordered cuts covering `gap`, following cut priority.
 * Never invents itinerary item names.
 */
export function computeRequiredCuts(lines: CostLine[], gap: number): RequiredCut[] {
  if (gap <= 0) return [];
  const candidates = [...lines]
    .filter((l) => maxReclaimable(l) > 0)
    .sort((a, b) => {
      const pr = cutPriorityRank(a) - cutPriorityRank(b);
      if (pr !== 0) return pr;
      return maxReclaimable(b) - maxReclaimable(a);
    });

  const cuts: RequiredCut[] = [];
  let remaining = gap;
  for (const line of candidates) {
    if (remaining <= 0) break;
    const take = Math.min(maxReclaimable(line), remaining);
    if (take <= 0) continue;
    cuts.push({
      category: line.key,
      label: line.label,
      reduceBy: take,
      remainingAfter: remainingPayable(line) - take,
    });
    remaining -= take;
  }
  return cuts;
}

function deriveStatus(
  lines: CostLine[],
  breathingRoom: number,
  budget: number,
): TripMoneyStatus {
  const flights = lines.find((l) => l.key === "flights");
  const hotel = lines.find((l) => l.key === "hotel");
  if (!flights || effectiveTotal(flights) <= 0 || !hotel || effectiveTotal(hotel) <= 0) {
    return "UNKNOWN";
  }
  if (breathingRoom < 0) return "OVER_BUDGET";
  if (breathingRoom < 0.05 * budget) return "TIGHT";
  return "SAFE";
}

export function computeTripMoneyState(input: MoneyStateInput): TripMoneyState {
  const budget = Math.max(0, input.budget);
  const bufferPct = input.bufferPct ?? DEFAULT_BUFFER_PCT;
  const reservedBuffer = Math.round(bufferPct * budget);
  const lines = input.lines;
  const projectedTripTotal = lines.reduce((s, l) => s + effectiveTotal(l), 0);
  const paidTotal = lines.reduce((s, l) => s + (l.paidAmount || 0), 0);
  const remainingBudget = budget - paidTotal;
  const remainingRequiredObligations = lines
    .filter((l) => l.necessity === "REQUIRED")
    .reduce((s, l) => s + remainingPayable(l), 0);
  const remainingPlannedReserve = lines
    .filter((l) => l.necessity === "PLANNED")
    .reduce((s, l) => s + remainingPayable(l), 0);
  const remainingObligations =
    remainingRequiredObligations + remainingPlannedReserve;
  const breathingRoom = budget - projectedTripTotal - reservedBuffer;
  const freeToSpend = Math.max(0, breathingRoom);
  const remainingDays = computeRemainingDays(
    input.startDate,
    input.endDate,
    input.today,
  );
  const freeDailySpend =
    remainingDays > 0 ? Math.floor(freeToSpend / remainingDays) : 0;
  const reclaimableAmount = computeReclaimableAmount(lines);
  const status = deriveStatus(lines, breathingRoom, budget);

  return {
    budget,
    bufferPct,
    reservedBuffer,
    projectedTripTotal,
    paidTotal,
    remainingBudget,
    remainingRequiredObligations,
    remainingPlannedReserve,
    remainingObligations,
    breathingRoom,
    freeToSpend,
    freeDailySpend,
    reclaimableAmount,
    remainingDays,
    status,
    lines,
    startDate: input.startDate,
    endDate: input.endDate,
  };
}

function cloneLines(lines: CostLine[]): CostLine[] {
  return lines.map((l) => ({ ...l }));
}

function applyPurchaseToLines(
  lines: CostLine[],
  amountPhp: number,
  category: CostLineKey = "other",
  payNow = true,
): CostLine[] {
  const next = cloneLines(lines);
  const line = next.find((l) => l.key === category);
  if (!line) return next;
  const base = effectiveTotal(line);
  line.committedTotal = base + amountPhp;
  if (payNow) {
    line.paidAmount = (line.paidAmount || 0) + amountPhp;
  }
  return next;
}

export function applyDecision(
  state: TripMoneyState,
  decision: Decision,
): ImpactResult {
  const before = state;
  let afterLines = cloneLines(state.lines);
  let afterBudget = state.budget;

  switch (decision.type) {
    case "PRICE_FOUND": {
      const key = decision.category ?? "other";
      const line = afterLines.find((l) => l.key === key);
      if (line) line.foundTotal = decision.foundTotal ?? decision.amountPhp;
      break;
    }
    case "BOOK_FLIGHT":
    case "BOOK_HOTEL": {
      const key =
        decision.category ??
        (decision.type === "BOOK_FLIGHT" ? "flights" : "hotel");
      const line = afterLines.find((l) => l.key === key);
      if (line) {
        const committed = decision.committedTotal ?? decision.amountPhp;
        line.committedTotal = committed;
        const payment =
          decision.payNow === false ? 0 : decision.amountPhp;
        if (payment > 0) {
          line.paidAmount = Math.min(
            committed,
            (line.paidAmount || 0) + payment,
          );
        }
      }
      break;
    }
    case "CHANGE_BUDGET":
      afterBudget = decision.amountPhp;
      break;
    case "PURCHASE":
    case "ADD_EXPENSE":
    default:
      afterLines = applyPurchaseToLines(
        afterLines,
        decision.amountPhp,
        decision.category ?? "other",
        decision.payNow !== false,
      );
      break;
  }

  const after = computeTripMoneyState({
    budget: afterBudget,
    lines: afterLines,
    startDate: state.startDate,
    endDate: state.endDate,
    bufferPct: state.bufferPct,
    today: state.startDate, // keep same remainingDays basis as pre-trip fixtures
  });

  // Preserve remainingDays from before (decision doesn't change calendar)
  const afterWithDays: TripMoneyState = {
    ...after,
    remainingDays: before.remainingDays,
    freeDailySpend:
      before.remainingDays > 0
        ? Math.floor(after.freeToSpend / before.remainingDays)
        : 0,
  };

  // PRICE_FOUND does not change aggregates — hypothetical only handled by caller
  if (decision.type === "PRICE_FOUND") {
    return {
      verdict: "FITS",
      statusBefore: before.status,
      statusAfter: before.status,
      breathingRoomBefore: before.breathingRoom,
      breathingRoomAfter: before.breathingRoom,
      freeToSpendBefore: before.freeToSpend,
      freeToSpendAfter: before.freeToSpend,
      freeDailySpendBefore: before.freeDailySpend,
      freeDailySpendAfter: before.freeDailySpend,
      budgetGap: 0,
      reclaimableAmount: before.reclaimableAmount,
      requiredCuts: [],
      suggestedPlanChanges: [],
      recommendedActions: ["book_found"],
      amountPhp: decision.amountPhp,
      fx: decision.fx,
    };
  }

  const amount = decision.amountPhp;
  const freeBefore = before.freeToSpend;
  let verdict: AffordVerdict;
  let budgetGap = 0;
  let requiredCuts: RequiredCut[] = [];

  if (decision.type === "CHANGE_BUDGET") {
    if (afterWithDays.breathingRoom >= 0) verdict = "FITS";
    else {
      budgetGap = Math.abs(afterWithDays.breathingRoom);
      requiredCuts = computeRequiredCuts(before.lines, budgetGap);
      const covered = requiredCuts.reduce((s, c) => s + c.reduceBy, 0);
      verdict =
        covered >= budgetGap ? "POSSIBLE_WITH_TRADEOFF" : "DOES_NOT_FIT";
    }
  } else if (amount <= freeBefore) {
    verdict = "FITS";
    budgetGap = 0;
  } else {
    budgetGap = amount - freeBefore;
    requiredCuts = computeRequiredCuts(before.lines, budgetGap);
    const covered = requiredCuts.reduce((s, c) => s + c.reduceBy, 0);
    verdict =
      covered >= budgetGap ? "POSSIBLE_WITH_TRADEOFF" : "DOES_NOT_FIT";
  }

  const recommendedActions: ImpactResult["recommendedActions"] = [];
  if (verdict === "FITS") {
    recommendedActions.push("buy_anyway");
  } else if (verdict === "POSSIBLE_WITH_TRADEOFF") {
    recommendedActions.push("find_cuts", "skip", "buy_anyway");
  } else {
    recommendedActions.push("skip", "find_cuts");
  }

  return {
    verdict,
    statusBefore: before.status,
    statusAfter: afterWithDays.status,
    breathingRoomBefore: before.breathingRoom,
    breathingRoomAfter: afterWithDays.breathingRoom,
    freeToSpendBefore: before.freeToSpend,
    freeToSpendAfter: afterWithDays.freeToSpend,
    freeDailySpendBefore: before.freeDailySpend,
    freeDailySpendAfter: afterWithDays.freeDailySpend,
    budgetGap,
    reclaimableAmount: before.reclaimableAmount,
    requiredCuts,
    suggestedPlanChanges: [],
    recommendedActions,
    amountPhp: amount,
    fx: decision.fx,
  };
}

/** Hypothetical: if found price were booked as committed. */
export function impactIfBookFound(
  state: TripMoneyState,
  category: CostLineKey,
  foundTotal: number,
): { breathingRoomDelta: number; freeToSpendDelta: number } {
  const lines = cloneLines(state.lines);
  const line = lines.find((l) => l.key === category);
  if (!line) return { breathingRoomDelta: 0, freeToSpendDelta: 0 };
  line.committedTotal = foundTotal;
  const after = computeTripMoneyState({
    budget: state.budget,
    lines,
    startDate: "2000-01-01",
    endDate: "2000-01-05",
    bufferPct: state.bufferPct,
    today: "2000-01-01",
  });
  return {
    breathingRoomDelta: after.breathingRoom - state.breathingRoom,
    freeToSpendDelta: after.freeToSpend - state.freeToSpend,
  };
}

export function moneyStateFromBreakdown(params: {
  budget: number;
  breakdown?: Partial<Record<CostLineKey, number>> | Record<string, number> | null;
  overrides?: Partial<Record<CostLineKey, CostLineOverride>>;
  startDate: string;
  endDate: string;
  today?: string | Date;
  bufferPct?: number;
}): TripMoneyState {
  return computeTripMoneyState({
    budget: params.budget,
    lines: buildMoneyLines(params.breakdown, params.overrides),
    startDate: params.startDate,
    endDate: params.endDate,
    today: params.today,
    bufferPct: params.bufferPct,
  });
}
