import type { Activity, BudgetBreakdown } from "./index";

export type FeasibilityVerdict = "affordable" | "tight" | "over";
export type CategoryConfidence = "high" | "medium" | "low";
export type CategoryStatus = "ok" | "watch" | "over";

export type FitStrategyId = "comfortable" | "balanced" | "tipid";

export interface FeasibilityCategoryRow {
  key: keyof BudgetBreakdown | "buffer";
  label: string;
  projected: number;
  confidence: CategoryConfidence;
  status: CategoryStatus;
}

export interface FeasibilityRisk {
  id: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

export interface FeasibilityLever {
  id: string;
  label: string;
  estimatedSavings: number;
}

export interface TripFeasibilityResult {
  score: number;
  verdict: FeasibilityVerdict;
  statedBudget: number;
  projectedCost: number;
  buffer: number;
  grandTotal: number;
  gap: number;
  spent: number;
  categories: FeasibilityCategoryRow[];
  risks: FeasibilityRisk[];
  levers: FeasibilityLever[];
  summary: string;
}

export interface ScenarioInput {
  budgetAmount: number;
  travelers: number;
  /** Days to keep from the start of the itinerary (null = all). */
  keepDays?: number | null;
  /** Scale food/activity costs when travelers change from baseline. */
  baselineTravelers: number;
  skipPaidActivities?: boolean;
  origin?: string;
}

export interface FeasibilityTripInput {
  destination: string;
  budgetAmount: number;
  travelers: number;
  startDate: string;
  endDate: string;
  budgetBreakdown?: Partial<BudgetBreakdown> | Record<string, number> | null;
  totalEstimated?: number | null;
  days?: Array<{
    day: number;
    title: string;
    estimatedCost: number;
    activities: Activity[];
  }>;
  spent?: number;
  origin?: string;
  scenario?: Partial<ScenarioInput>;
}

export interface FitStrategy {
  id: FitStrategyId;
  label: string;
  description: string;
  targetBudget: number;
  projectedCost: number;
  changes: string[];
  days: Array<{
    day: number;
    title: string;
    estimatedCost: number;
    activities: Activity[];
  }>;
  budgetBreakdown: BudgetBreakdown;
  totalEstimated: number;
}

const CATEGORY_META: {
  key: keyof BudgetBreakdown;
  label: string;
  confidence: CategoryConfidence;
}[] = [
  { key: "flights", label: "Flights", confidence: "low" },
  { key: "hotel", label: "Stay", confidence: "medium" },
  { key: "food", label: "Food", confidence: "medium" },
  { key: "activities", label: "Activities", confidence: "medium" },
  { key: "transport", label: "Local transport", confidence: "high" },
  { key: "other", label: "Misc", confidence: "medium" },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundPeso(n: number) {
  return Math.round(n);
}

function dayCountFromDates(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
}

function normalizeBreakdown(
  raw?: Partial<BudgetBreakdown> | Record<string, number> | null,
): BudgetBreakdown {
  return {
    flights: Number(raw?.flights ?? 0),
    hotel: Number(raw?.hotel ?? 0),
    food: Number(raw?.food ?? 0),
    activities: Number(raw?.activities ?? 0),
    transport: Number(raw?.transport ?? 0),
    other: Number(raw?.other ?? 0),
  };
}

function sumBreakdown(b: BudgetBreakdown) {
  return b.flights + b.hotel + b.food + b.activities + b.transport + (b.other ?? 0);
}

function scaleBreakdown(
  b: BudgetBreakdown,
  travelerRatio: number,
  opts?: { skipPaidActivities?: boolean; dayRatio?: number },
): BudgetBreakdown {
  const dayRatio = opts?.dayRatio ?? 1;
  const activityScale = opts?.skipPaidActivities ? 0.45 : 1;
  // Flights scale with travelers; hotel partially; food/activities/transport with both
  return {
    flights: roundPeso(b.flights * travelerRatio),
    hotel: roundPeso(b.hotel * Math.min(1.35, 0.7 + travelerRatio * 0.3) * dayRatio),
    food: roundPeso(b.food * travelerRatio * dayRatio),
    activities: roundPeso(b.activities * travelerRatio * dayRatio * activityScale),
    transport: roundPeso(b.transport * Math.sqrt(travelerRatio) * dayRatio),
    other: roundPeso((b.other ?? 0) * dayRatio),
  };
}

function applyScenarioToDays(
  days: FeasibilityTripInput["days"],
  scenario: ScenarioInput,
): NonNullable<FeasibilityTripInput["days"]> {
  if (!days?.length) return [];
  const keep = scenario.keepDays ?? days.length;
  let sliced = days.slice(0, clamp(keep, 1, days.length)).map((d) => ({
    ...d,
    activities: d.activities.map((a) => ({ ...a })),
  }));

  const travelerRatio =
    scenario.baselineTravelers > 0
      ? scenario.travelers / scenario.baselineTravelers
      : 1;

  if (Math.abs(travelerRatio - 1) > 0.01) {
    sliced = sliced.map((d) => {
      const activities = d.activities.map((a) => {
        if (a.category === "hotel") {
          return {
            ...a,
            estimatedCost: roundPeso(
              a.estimatedCost * Math.min(1.35, 0.7 + travelerRatio * 0.3),
            ),
          };
        }
        return { ...a, estimatedCost: roundPeso(a.estimatedCost * travelerRatio) };
      });
      return {
        ...d,
        activities,
        estimatedCost: activities.reduce((s, a) => s + a.estimatedCost, 0),
      };
    });
  }

  if (scenario.skipPaidActivities) {
    sliced = sliced.map((d) => {
      const activities = d.activities.map((a) => {
        if (a.category === "activities" && a.estimatedCost >= 1500) {
          return {
            ...a,
            title: `${a.title} (skipped)`,
            estimatedCost: 0,
            description: `Removed to fit budget — was ${a.estimatedCost}`,
          };
        }
        return a;
      });
      return {
        ...d,
        activities,
        estimatedCost: activities.reduce((s, a) => s + a.estimatedCost, 0),
      };
    });
  }

  return sliced;
}

export function computeTripFeasibility(input: FeasibilityTripInput): TripFeasibilityResult {
  const baselineTravelers = input.travelers;
  const scenario: ScenarioInput = {
    budgetAmount: input.scenario?.budgetAmount ?? input.budgetAmount,
    travelers: input.scenario?.travelers ?? input.travelers,
    keepDays: input.scenario?.keepDays ?? null,
    baselineTravelers: input.scenario?.baselineTravelers ?? baselineTravelers,
    skipPaidActivities: input.scenario?.skipPaidActivities ?? false,
    origin: input.scenario?.origin ?? input.origin ?? "Manila",
  };

  const fullDays = (input.days ?? []).map((d) => ({
    day: d.day,
    title: d.title,
    estimatedCost: d.estimatedCost,
    activities: d.activities,
  }));
  const totalDayCount =
    fullDays.length || dayCountFromDates(input.startDate, input.endDate);
  const keepDays = scenario.keepDays ?? totalDayCount;
  const dayRatio = totalDayCount > 0 ? keepDays / totalDayCount : 1;
  const travelerRatio =
    scenario.baselineTravelers > 0
      ? scenario.travelers / scenario.baselineTravelers
      : 1;

  const baseBreakdown = normalizeBreakdown(input.budgetBreakdown);
  let projectedBreakdown = scaleBreakdown(baseBreakdown, travelerRatio, {
    skipPaidActivities: scenario.skipPaidActivities,
    dayRatio,
  });

  // Prefer itinerary sum for food/activities/hotel/transport when days exist
  const scenarioDays = applyScenarioToDays(fullDays, { ...scenario, keepDays });
  if (scenarioDays.length > 0) {
    const fromDays = { hotel: 0, food: 0, activities: 0, transport: 0, other: 0 };
    for (const d of scenarioDays) {
      for (const a of d.activities) {
        if (a.category === "hotel") fromDays.hotel += a.estimatedCost;
        else if (a.category === "food") fromDays.food += a.estimatedCost;
        else if (a.category === "activities") fromDays.activities += a.estimatedCost;
        else if (a.category === "transport") fromDays.transport += a.estimatedCost;
        else fromDays.other += a.estimatedCost;
      }
    }
    projectedBreakdown = {
      flights: projectedBreakdown.flights,
      hotel: fromDays.hotel || projectedBreakdown.hotel,
      food: fromDays.food || projectedBreakdown.food,
      activities: fromDays.activities || projectedBreakdown.activities,
      transport: fromDays.transport || projectedBreakdown.transport,
      other: fromDays.other || projectedBreakdown.other,
    };
  } else if (input.totalEstimated && sumBreakdown(baseBreakdown) === 0) {
    // Fallback split if no breakdown
    const t = input.totalEstimated * dayRatio * travelerRatio;
    projectedBreakdown = {
      flights: roundPeso(t * 0.3),
      hotel: roundPeso(t * 0.25),
      food: roundPeso(t * 0.2),
      activities: roundPeso(t * 0.15),
      transport: roundPeso(t * 0.08),
      other: roundPeso(t * 0.02),
    };
  }

  const projectedCost = sumBreakdown(projectedBreakdown);
  const buffer = roundPeso(projectedCost * 0.1);
  const grandTotal = projectedCost + buffer;
  const statedBudget = scenario.budgetAmount;
  const gap = grandTotal - statedBudget;
  const spent = input.spent ?? 0;

  const share = (amount: number) =>
    statedBudget > 0 ? amount / statedBudget : 0;

  const categories: FeasibilityCategoryRow[] = CATEGORY_META.map((meta) => {
    const projected = projectedBreakdown[meta.key] ?? 0;
    let status: CategoryStatus = "ok";
    if (share(projected) > 0.4) status = "over";
    else if (share(projected) > 0.28) status = "watch";
    return {
      key: meta.key,
      label: meta.label,
      projected,
      confidence: meta.confidence,
      status,
    };
  });
  categories.push({
    key: "buffer",
    label: "Buffer (10%)",
    projected: buffer,
    confidence: "medium",
    status: "ok",
  });

  const risks: FeasibilityRisk[] = [];
  const origin = scenario.origin ?? "Manila";
  if (projectedBreakdown.flights === 0) {
    risks.push({
      id: "missing-flights",
      severity: "critical",
      message: `No flight estimate from ${origin} — many DIY budgets forget ₱12,000–₱35,000+ per person.`,
    });
  } else if (categories.find((c) => c.key === "flights")?.confidence === "low") {
    risks.push({
      id: "flight-volatility",
      severity: "warning",
      message: "Airfare is low-confidence — confirm with a real quote before booking stays.",
    });
  }
  if (projectedBreakdown.hotel === 0) {
    risks.push({
      id: "missing-hotel",
      severity: "critical",
      message: "No stay cost in the plan — add accommodation to avoid surprises.",
    });
  }
  if (gap > 0) {
    risks.push({
      id: "over-budget",
      severity: gap > statedBudget * 0.1 ? "critical" : "warning",
      message: `Projected cost is ${formatGap(gap)} over your ₱${statedBudget.toLocaleString("en-PH")} budget (incl. buffer).`,
    });
  }

  const levers: FeasibilityLever[] = [];
  if (projectedBreakdown.activities > 0) {
    levers.push({
      id: "cut-activities",
      label: "Skip paid attractions",
      estimatedSavings: roundPeso(projectedBreakdown.activities * 0.55),
    });
  }
  if (totalDayCount > 3) {
    levers.push({
      id: "shorten-trip",
      label: "Shorten by 1–2 days",
      estimatedSavings: roundPeso(projectedCost * (1 / totalDayCount) * 1.5),
    });
  }
  if (projectedBreakdown.hotel > 0) {
    levers.push({
      id: "cheaper-stay",
      label: "Choose a cheaper area / stay",
      estimatedSavings: roundPeso(projectedBreakdown.hotel * 0.25),
    });
  }

  // Score: 100 when comfortably under, drops as gap grows
  let score = 100;
  const ratio = statedBudget > 0 ? grandTotal / statedBudget : 2;
  if (ratio <= 0.85) score = 92 + Math.round((0.85 - ratio) * 40);
  else if (ratio <= 1) score = 70 + Math.round((1 - ratio) * 140);
  else if (ratio <= 1.15) score = 45 + Math.round((1.15 - ratio) * 160);
  else score = Math.max(5, 45 - Math.round((ratio - 1.15) * 80));
  if (projectedBreakdown.flights === 0) score = Math.min(score, 55);
  if (projectedBreakdown.hotel === 0) score = Math.min(score, 50);
  score = clamp(score, 0, 100);

  let verdict: FeasibilityVerdict = "affordable";
  if (gap > statedBudget * 0.05) verdict = "over";
  else if (gap > 0 || score < 75) verdict = "tight";

  const summary =
    verdict === "affordable"
      ? `Yes — this trip looks affordable at about ₱${grandTotal.toLocaleString("en-PH")} incl. buffer.`
      : verdict === "tight"
        ? `Possible but tight — you're about ₱${Math.abs(gap).toLocaleString("en-PH")} over once buffer is included.`
        : `Not feasible yet — projected ₱${grandTotal.toLocaleString("en-PH")} vs ₱${statedBudget.toLocaleString("en-PH")} budget.`;

  return {
    score,
    verdict,
    statedBudget,
    projectedCost,
    buffer,
    grandTotal,
    gap,
    spent,
    categories,
    risks,
    levers,
    summary,
  };
}

function formatGap(gap: number) {
  return `₱${Math.abs(gap).toLocaleString("en-PH")}`;
}

function rebuildBreakdownFromDays(
  days: FitStrategy["days"],
  flights: number,
): BudgetBreakdown {
  const b: BudgetBreakdown = {
    flights,
    hotel: 0,
    food: 0,
    activities: 0,
    transport: 0,
    other: 0,
  };
  for (const d of days) {
    for (const a of d.activities) {
      if (a.category === "hotel") b.hotel += a.estimatedCost;
      else if (a.category === "food") b.food += a.estimatedCost;
      else if (a.category === "activities") b.activities += a.estimatedCost;
      else if (a.category === "transport") b.transport += a.estimatedCost;
      else b.other += a.estimatedCost;
    }
  }
  return {
    flights: roundPeso(b.flights),
    hotel: roundPeso(b.hotel),
    food: roundPeso(b.food),
    activities: roundPeso(b.activities),
    transport: roundPeso(b.transport),
    other: roundPeso(b.other ?? 0),
  };
}

function cutActivitiesToTarget(
  days: FitStrategy["days"],
  flights: number,
  targetGrand: number,
): { days: FitStrategy["days"]; changes: string[] } {
  const clone = days.map((d) => ({
    ...d,
    activities: d.activities.map((a) => ({ ...a })),
  }));
  const changes: string[] = [];

  const candidates: { di: number; ai: number; cost: number; title: string; source?: string }[] =
    [];
  clone.forEach((d, di) => {
    d.activities.forEach((a, ai) => {
      if (a.category === "activities" && a.estimatedCost > 0) {
        candidates.push({
          di,
          ai,
          cost: a.estimatedCost,
          title: a.title,
          source: a.source,
        });
      }
    });
  });
  // Cut AI picks first, then highest cost
  candidates.sort((a, b) => {
    const as = a.source === "ai_pick" ? 0 : 1;
    const bs = b.source === "ai_pick" ? 0 : 1;
    if (as !== bs) return as - bs;
    return b.cost - a.cost;
  });

  const costOf = () => {
    const b = rebuildBreakdownFromDays(clone, flights);
    const sub = sumBreakdown(b);
    return sub + roundPeso(sub * 0.1);
  };

  for (const c of candidates) {
    if (costOf() <= targetGrand) break;
    const act = clone[c.di].activities[c.ai];
    if (act.estimatedCost <= 0) continue;
    changes.push(`Removed ${act.title} (−₱${act.estimatedCost.toLocaleString("en-PH")})`);
    act.estimatedCost = 0;
    act.title = `${act.title} (cut)`;
    clone[c.di].estimatedCost = clone[c.di].activities.reduce(
      (s, a) => s + a.estimatedCost,
      0,
    );
  }

  // Scale food if still over
  if (costOf() > targetGrand) {
    const b = rebuildBreakdownFromDays(clone, flights);
    const sub = sumBreakdown(b);
    const need = targetGrand / 1.1;
    const scale = need / Math.max(sub, 1);
    if (scale < 1) {
      for (const d of clone) {
        for (const a of d.activities) {
          if (a.category === "food" || a.category === "activities") {
            a.estimatedCost = roundPeso(a.estimatedCost * Math.max(scale, 0.55));
          }
        }
        d.estimatedCost = d.activities.reduce((s, a) => s + a.estimatedCost, 0);
      }
      changes.push("Trimmed food & activity daily spend");
    }
  }

  return { days: clone, changes };
}

export function buildMakeItFitStrategies(input: FeasibilityTripInput): FitStrategy[] {
  const budget = input.scenario?.budgetAmount ?? input.budgetAmount;
  const baseDays = (input.days ?? []).map((d) => ({
    day: d.day,
    title: d.title,
    estimatedCost: d.estimatedCost,
    activities: d.activities.map((a) => ({ ...a })),
  }));
  const flights = Number(input.budgetBreakdown?.flights ?? 0);
  if (!baseDays.length) return [];

  const mk = (
    id: FitStrategyId,
    label: string,
    description: string,
    mutate: (days: FitStrategy["days"]) => { days: FitStrategy["days"]; changes: string[] },
  ): FitStrategy => {
    const { days, changes } = mutate(baseDays.map((d) => ({
      ...d,
      activities: d.activities.map((a) => ({ ...a })),
    })));
    const budgetBreakdown = rebuildBreakdownFromDays(days, flights);
    const totalEstimated = sumBreakdown(budgetBreakdown);
    return {
      id,
      label,
      description,
      targetBudget: budget,
      projectedCost: totalEstimated + roundPeso(totalEstimated * 0.1),
      changes,
      days,
      budgetBreakdown,
      totalEstimated,
    };
  };

  const comfortable = mk(
    "comfortable",
    "Comfortable",
    "Keep the days — cut the priciest paid activities first.",
    (days) => cutActivitiesToTarget(days, flights, budget),
  );

  const balanced = mk(
    "balanced",
    "Balanced",
    "Cut paid activities and trim food spend to land near your budget.",
    (days) => {
      const step1 = cutActivitiesToTarget(days, flights, roundPeso(budget * 0.95));
      return cutActivitiesToTarget(step1.days, flights, budget);
    },
  );

  const tipid = mk(
    "tipid",
    "Tipid mode",
    "Shorter trip + skip paid attractions for maximum savings.",
    (days) => {
      const shortened = days.slice(0, Math.max(3, days.length - 2));
      const changes = [
        `Shortened to ${shortened.length} days (from ${days.length})`,
      ];
      const cut = cutActivitiesToTarget(shortened, flights, roundPeso(budget * 0.9));
      return { days: cut.days, changes: [...changes, ...cut.changes] };
    },
  );

  return [comfortable, balanced, tipid];
}

/** Map API itinerary days into engine day shape. */
export function itineraryDaysForEngine(
  days?: Array<{
    dayNumber: number;
    title: string;
    estimatedCost: number;
    activities: Activity[];
  }>,
): FeasibilityTripInput["days"] {
  return (days ?? []).map((d) => ({
    day: d.dayNumber,
    title: d.title,
    estimatedCost: d.estimatedCost,
    activities: d.activities,
  }));
}
