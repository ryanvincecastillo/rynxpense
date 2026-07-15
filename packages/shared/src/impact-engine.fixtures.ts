/**
 * Locked S1–S6 fixtures for TripImpactEngine.
 * Run: pnpm --filter @rynxpense/shared test
 */

import { applyDecision, computeTripMoneyState, impactIfBookFound } from "./impact-engine";
import { buildMoneyLines, convertWithFx } from "./money-model";

function assertEq(actual: number | string, expected: number | string, label: string) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertNear(actual: number, expected: number, label: string) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

const BASE_BREAKDOWN = {
  flights: 28_000,
  hotel: 20_000,
  food: 15_000,
  activities: 10_000,
  transport: 6_000,
  other: 1_000,
};

const TRIP = {
  budget: 100_000,
  startDate: "2026-08-01",
  endDate: "2026-08-05",
  today: "2026-07-15", // pre-trip → remainingDays = 5
  bufferPct: 0.1,
};

function baseState(overrides?: Parameters<typeof buildMoneyLines>[1]) {
  return computeTripMoneyState({
    budget: TRIP.budget,
    lines: buildMoneyLines(BASE_BREAKDOWN, overrides),
    startDate: TRIP.startDate,
    endDate: TRIP.endDate,
    today: TRIP.today,
    bufferPct: TRIP.bufferPct,
  });
}

export function runMoneyModelFixtures(): void {
  // ── S1: Pre-trip, nothing paid/committed ──────────────────────────
  const s1 = baseState();
  assertEq(s1.projectedTripTotal, 80_000, "S1.projectedTripTotal");
  assertEq(s1.reservedBuffer, 10_000, "S1.reservedBuffer");
  assertEq(s1.breathingRoom, 10_000, "S1.breathingRoom");
  assertEq(s1.freeToSpend, 10_000, "S1.freeToSpend");
  assertEq(s1.remainingBudget, 100_000, "S1.remainingBudget");
  assertEq(s1.remainingObligations, 79_000, "S1.remainingObligations"); // req 69k + planned 10k
  assertEq(s1.freeDailySpend, 2_000, "S1.freeDailySpend");
  assertEq(s1.remainingDays, 5, "S1.remainingDays");
  assertEq(s1.status, "SAFE", "S1.status");
  // Optional is reclaimable but NOT silent free-to-spend
  if (s1.reclaimableAmount < 1_000) {
    throw new Error("S1.reclaimableAmount must include at least optional ₱1,000");
  }

  const s1fits = applyDecision(s1, {
    type: "PURCHASE",
    amountPhp: 10_000,
    category: "other",
  });
  assertEq(s1fits.verdict, "FITS", "S1.10k.verdict");
  assertEq(s1fits.requiredCuts.length, 0, "S1.10k.cuts");

  const s1trade = applyDecision(s1, {
    type: "PURCHASE",
    amountPhp: 11_000,
    category: "other",
  });
  assertEq(s1trade.verdict, "POSSIBLE_WITH_TRADEOFF", "S1.11k.verdict");
  assertEq(s1trade.budgetGap, 1_000, "S1.11k.gap");
  assertEq(s1trade.requiredCuts[0]?.category, "other", "S1.11k.cut.category");
  assertEq(s1trade.requiredCuts[0]?.reduceBy, 1_000, "S1.11k.cut.reduceBy");
  assertEq(s1trade.suggestedPlanChanges.length, 0, "S1.11k.no itinerary invention");

  // ── S2: Found cheaper flight — aggregates unchanged ───────────────
  const s2 = baseState({
    flights: { foundTotal: 22_000 },
  });
  assertEq(s2.projectedTripTotal, 80_000, "S2.projectedTripTotal");
  assertEq(s2.breathingRoom, 10_000, "S2.breathingRoom");
  assertEq(s2.freeToSpend, 10_000, "S2.freeToSpend");
  assertEq(s2.status, "SAFE", "S2.status");
  const hypo = impactIfBookFound(s2, "flights", 22_000);
  assertEq(hypo.breathingRoomDelta, 6_000, "S2.hypo.breathingRoomDelta");

  // ── S3: Book + pay flight ₱22,000 ─────────────────────────────────
  const s3lines = buildMoneyLines(BASE_BREAKDOWN, {
    flights: { committedTotal: 22_000, paidAmount: 22_000 },
  });
  const s3 = computeTripMoneyState({
    budget: TRIP.budget,
    lines: s3lines,
    startDate: TRIP.startDate,
    endDate: TRIP.endDate,
    today: TRIP.today,
    bufferPct: TRIP.bufferPct,
  });
  assertEq(s3.projectedTripTotal, 74_000, "S3.projectedTripTotal");
  assertEq(s3.breathingRoom, 16_000, "S3.breathingRoom");
  assertEq(s3.freeToSpend, 16_000, "S3.freeToSpend");
  assertEq(s3.remainingBudget, 78_000, "S3.remainingBudget");
  assertEq(s3.freeDailySpend, 3_200, "S3.freeDailySpend");
  assertEq(s3.status, "SAFE", "S3.status");

  // ── S4: Hotel deposit (committed 20k, paid 10k) — deposit-neutral ─
  const s4 = computeTripMoneyState({
    budget: TRIP.budget,
    lines: buildMoneyLines(BASE_BREAKDOWN, {
      flights: { committedTotal: 22_000, paidAmount: 22_000 },
      hotel: { committedTotal: 20_000, paidAmount: 10_000 },
    }),
    startDate: TRIP.startDate,
    endDate: TRIP.endDate,
    today: TRIP.today,
    bufferPct: TRIP.bufferPct,
  });
  assertEq(s4.projectedTripTotal, 74_000, "S4.projectedTripTotal");
  assertEq(s4.breathingRoom, 16_000, "S4.breathingRoom");
  assertEq(s4.freeToSpend, 16_000, "S4.freeToSpend");
  assertEq(s4.paidTotal, 32_000, "S4.paidTotal");
  assertEq(s4.remainingBudget, 68_000, "S4.remainingBudget");
  assertEq(s4.status, "SAFE", "S4.status");

  // ── S5: ¥18,000 shoes @ 0.38 = ₱6,840 — FITS ──────────────────────
  const shoes = convertWithFx(18_000, "JPY");
  assertEq(shoes.php, 6_840, "S5.php");
  const s5impact = applyDecision(s4, {
    type: "PURCHASE",
    amountPhp: shoes.php,
    category: "other",
    fx: shoes.fx,
  });
  assertEq(s5impact.verdict, "FITS", "S5.verdict");
  assertNear(s5impact.breathingRoomAfter, 9_160, "S5.breathingRoomAfter");
  assertNear(s5impact.freeToSpendAfter, 9_160, "S5.freeToSpendAfter");
  assertEq(s5impact.requiredCuts.length, 0, "S5.noCuts");
  assertEq(s5impact.suggestedPlanChanges.length, 0, "S5.noPlanChanges");

  // ── S6: ¥60,000 bag = ₱22,800 — TRADEOFF, cost-line cuts only ─────
  const bag = convertWithFx(60_000, "JPY");
  assertEq(bag.php, 22_800, "S6.php");
  const s6impact = applyDecision(s4, {
    type: "PURCHASE",
    amountPhp: bag.php,
    category: "other",
    fx: bag.fx,
  });
  assertEq(s6impact.verdict, "POSSIBLE_WITH_TRADEOFF", "S6.verdict");
  assertEq(s6impact.budgetGap, 6_800, "S6.budgetGap"); // 22800 - 16000
  assertNear(s6impact.breathingRoomAfter, -6_800, "S6.breathingRoomAfter");
  assertEq(s6impact.freeToSpendAfter, 0, "S6.freeToSpendAfter");
  assertEq(s6impact.statusAfter, "OVER_BUDGET", "S6.statusAfter");
  // Cuts: OPTIONAL other ₱1,000 first, then PLANNED activities ₱5,800
  const otherCut = s6impact.requiredCuts.find((c) => c.category === "other");
  const actCut = s6impact.requiredCuts.find((c) => c.category === "activities");
  assertEq(otherCut?.reduceBy ?? 0, 1_000, "S6.cut.other");
  assertEq(actCut?.reduceBy ?? 0, 5_800, "S6.cut.activities");
  assertEq(s6impact.suggestedPlanChanges.length, 0, "S6.engine must not name teamLab");

  console.log("impact-engine fixtures S1–S6 OK");
}

if (typeof process !== "undefined" && process.argv[1]?.includes("impact-engine.fixtures")) {
  runMoneyModelFixtures();
}
