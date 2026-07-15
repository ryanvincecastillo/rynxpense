import { z } from "zod";

export const tripStatusSchema = z.enum(["PLANNING", "ACTIVE", "COMPLETED"]);
export type TripStatus = z.infer<typeof tripStatusSchema>;

export const activitySourceSchema = z.enum([
  "ai_pick",
  "from_save",
  "community",
]);
export type ActivitySource = z.infer<typeof activitySourceSchema>;

export const activitySchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string(),
  estimatedCost: z.number(),
  category: z.enum(["food", "transport", "activities", "hotel", "other"]),
  source: activitySourceSchema.optional(),
});

export const inspirationCategorySchema = z.enum([
  "food",
  "stay",
  "activity",
  "transport",
  "other",
]);
export type InspirationCategory = z.infer<typeof inspirationCategorySchema>;

export const inspirationPrioritySchema = z.enum(["must", "maybe", "skip"]);
export type InspirationPriority = z.infer<typeof inspirationPrioritySchema>;

export const inspirationItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: inspirationCategorySchema.default("activity"),
  estimatedCost: z.number().nonnegative().optional(),
  sourceUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  sourceType: z.enum(["manual", "link", "text", "screenshot", "ai"]).default("manual"),
  priority: inspirationPrioritySchema.default("maybe"),
});

export type InspirationItem = z.infer<typeof inspirationItemSchema>;

export const itineraryDaySchema = z.object({
  day: z.number(),
  title: z.string(),
  activities: z.array(activitySchema),
  estimatedCost: z.number(),
});

export const budgetBreakdownSchema = z.object({
  flights: z.number(),
  hotel: z.number(),
  food: z.number(),
  activities: z.number(),
  transport: z.number(),
  other: z.number().optional().default(0),
});

export const aiTripPlanSchema = z.object({
  destination: z.string(),
  days: z.array(itineraryDaySchema),
  budgetBreakdown: budgetBreakdownSchema,
  totalEstimated: z.number(),
  tips: z.array(z.string()),
});

export type Activity = z.infer<typeof activitySchema>;
export type ItineraryDay = z.infer<typeof itineraryDaySchema>;
export type BudgetBreakdown = z.infer<typeof budgetBreakdownSchema>;
export type AITripPlan = z.infer<typeof aiTripPlanSchema>;

export const createTripSchema = z.object({
  destination: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  budgetAmount: z.number().positive(),
  currency: z.string().default("PHP"),
  travelers: z.number().int().min(1).default(2),
  preferences: z.string().optional(),
});

export const generateTripSchema = createTripSchema.extend({
  inspirationItems: z.array(inspirationItemSchema).optional(),
  origin: z.string().optional().default("Manila"),
});

export const createExpenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string(),
  note: z.string().optional(),
  date: z.string(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export function formatCurrency(amount: number, currency = "PHP"): string {
  if (currency === "PHP") {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export function generateShareSlug(destination: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${slugify(destination)}-${random}`;
}

export type CreateTripInputWithInspo = z.infer<typeof generateTripSchema>;

export function buildTripPrompt(input: CreateTripInputWithInspo): string {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const dayCount = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  const inspoBlock =
    input.inspirationItems?.length ?
      `\nUser saved these places from TikTok, Instagram, Reddit, etc. — weave them into the itinerary where realistic:\n${input.inspirationItems
        .map(
          (item, i) =>
            `${i + 1}. [${item.priority}] ${item.title} (${item.category}${item.estimatedCost ? `, ~${input.currency} ${item.estimatedCost}` : ""})${item.description ? ` — ${item.description}` : ""}${item.sourceUrl ? ` — ${item.sourceUrl}` : ""}`,
        )
        .join("\n")}\n`
    : "";

  const origin = input.origin?.trim() || "Manila";

  return `You are a travel planner and budget expert specializing in Filipino travelers departing from the Philippines.
Create a realistic ${dayCount}-day trip plan with NAMED venues (real restaurants, hotels, attractions — not generic labels).

Destination: ${input.destination}
Flying from: ${origin}, Philippines
Budget: ${input.currency} ${input.budgetAmount.toLocaleString()} total for ${input.travelers} traveler(s)
Dates: ${input.startDate} to ${input.endDate}
${input.preferences ? `Preferences: ${input.preferences}` : ""}${inspoBlock}

Rules:
- Use specific venue names (e.g. "Ichiran Ramen Shibuya", "Hotel Gracery Shinjuku", "teamLab Borderless")
- Include at least one stay recommendation (hotel/hostel) in activities with category "hotel"
- Price realistically in ${input.currency} for travelers flying from ${origin} (include round-trip flights in budgetBreakdown)
- Mark activities from user saves with source "from_save", others with "ai_pick"
- Include 3-5 named activities per day across food, activities, transport

Respond ONLY with valid JSON:
{
  "destination": "${input.destination}",
  "days": [
    {
      "day": 1,
      "title": "Day theme",
      "activities": [
        {
          "time": "09:00",
          "title": "Specific venue name",
          "description": "Why visit + practical tip",
          "estimatedCost": 500,
          "category": "food|transport|activities|hotel|other",
          "source": "ai_pick|from_save"
        }
      ],
      "estimatedCost": 8500
    }
  ],
  "budgetBreakdown": {
    "flights": 0,
    "hotel": 0,
    "food": 0,
    "activities": 0,
    "transport": 0,
    "other": 0
  },
  "totalEstimated": ${input.budgetAmount},
  "tips": ["tip 1", "tip 2"]
}

Keep totalEstimated close to but not exceeding the budget.`;
}

export interface BudgetTally {
  tripBudget: number;
  itineraryTotal: number;
  inspirationTotal: number;
  combinedPlanTotal: number;
  spent: number;
  remaining: number;
  overBudget: boolean;
  overBy: number;
  status: "ok" | "warning" | "over";
}

export function computeBudgetTally(params: {
  budgetAmount: number;
  totalEstimated?: number | null;
  inspirationItems?: InspirationItem[];
  itineraryTotal?: number;
  spent?: number;
}): BudgetTally {
  const tripBudget = params.totalEstimated ?? params.budgetAmount;
  const inspirationTotal = (params.inspirationItems ?? [])
    .filter((i) => i.priority !== "skip")
    .reduce((sum, i) => sum + (i.estimatedCost ?? 0), 0);
  const itineraryTotal = params.itineraryTotal ?? tripBudget;
  const combinedPlanTotal = itineraryTotal + inspirationTotal;
  const spent = params.spent ?? 0;
  const remaining = tripBudget - spent;
  const overBy = Math.max(0, combinedPlanTotal - params.budgetAmount);
  const overBudget = combinedPlanTotal > params.budgetAmount;
  const ratio = params.budgetAmount > 0 ? combinedPlanTotal / params.budgetAmount : 0;

  return {
    tripBudget,
    itineraryTotal,
    inspirationTotal,
    combinedPlanTotal,
    spent,
    remaining,
    overBudget,
    overBy,
    status: overBudget ? "over" : ratio > 0.85 ? "warning" : "ok",
  };
}

export interface RealityCheckItem {
  label: string;
  amount: number;
  included: boolean;
  note?: string;
}

export interface RealityCheckResult {
  items: RealityCheckItem[];
  subtotal: number;
  buffer: number;
  grandTotal: number;
  statedBudget: number;
  gap: number;
  verdict: "fits" | "tight" | "over";
  warnings: string[];
}

export {
  computeTripFeasibility,
  buildMakeItFitStrategies,
  itineraryDaysForEngine,
} from "./feasibility";
export type {
  FeasibilityVerdict,
  CategoryConfidence,
  CategoryStatus,
  FitStrategyId,
  FeasibilityCategoryRow,
  FeasibilityRisk,
  FeasibilityLever,
  TripFeasibilityResult,
  ScenarioInput,
  FeasibilityTripInput,
  FitStrategy,
} from "./feasibility";

export {
  buildCostLines,
  effectiveLineAmount,
  lineStage,
  projectedFromLines,
  linesToBreakdown,
  parsePastePrice,
  computeBudgetAutopsy,
  updateTravelerCostProfile,
} from "./budget-lifecycle";
export type {
  CostStage,
  CostLineKey,
  CostLine,
  PastePriceResult,
  BudgetAutopsyResult,
  TravelerCostProfile,
} from "./budget-lifecycle";

export function computeRealityCheck(params: {
  budgetAmount: number;
  budgetBreakdown?: Record<string, number> | null;
  totalEstimated?: number | null;
  destination: string;
  travelers: number;
}): RealityCheckResult {
  const breakdown = params.budgetBreakdown ?? {};
  const flights = breakdown.flights ?? 0;
  const hotel = breakdown.hotel ?? 0;
  const food = breakdown.food ?? 0;
  const activities = breakdown.activities ?? 0;
  const transport = breakdown.transport ?? 0;
  const other = breakdown.other ?? 0;

  const warnings: string[] = [];
  if (flights === 0) {
    warnings.push(
      `Flights to ${params.destination} from Manila are not in the breakdown — budget itineraries often omit ₱15,000–₱35,000+ per person.`,
    );
  }
  if (hotel === 0) {
    warnings.push("No hotel/accommodation line item — add nightly stays to avoid surprise costs.");
  }

  const items: RealityCheckItem[] = [
    { label: "Flights (MNL round-trip est.)", amount: flights, included: flights > 0 },
    { label: "Accommodation", amount: hotel, included: hotel > 0 },
    { label: "Food & dining", amount: food, included: food > 0 },
    { label: "Activities & tours", amount: activities, included: activities > 0 },
    { label: "Local transport", amount: transport, included: transport > 0 },
    { label: "Misc / buffer", amount: other, included: other > 0 },
  ];

  const subtotal =
    params.totalEstimated ??
    items.reduce((s, i) => s + i.amount, 0);
  const buffer = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + buffer;
  const gap = grandTotal - params.budgetAmount;

  let verdict: RealityCheckResult["verdict"] = "fits";
  if (gap > params.budgetAmount * 0.05) verdict = "over";
  else if (gap > 0) verdict = "tight";

  return {
    items,
    subtotal,
    buffer,
    grandTotal,
    statedBudget: params.budgetAmount,
    gap,
    verdict,
    warnings,
  };
}
