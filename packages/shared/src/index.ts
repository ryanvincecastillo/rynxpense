import { z } from "zod";

export const tripStatusSchema = z.enum(["PLANNING", "ACTIVE", "COMPLETED"]);
export type TripStatus = z.infer<typeof tripStatusSchema>;

export const activitySchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string(),
  estimatedCost: z.number(),
  category: z.enum(["food", "transport", "activities", "hotel", "other"]),
});

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

export const generateTripSchema = createTripSchema;

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
