import type { Activity } from "@rynxpense/shared";
import type { ApiExpense, ApiItineraryDay, ApiTrip } from "@/lib/types";

export type GuestTrip = ApiTrip & { guest: true };

export function buildGuestTrip(
  input: {
    destination: string;
    startDate: string;
    endDate: string;
    budgetAmount: number;
    currency: string;
    travelers: number;
    preferences?: string;
  },
  plan: {
    days: {
      day: number;
      title: string;
      activities: Activity[];
      estimatedCost: number;
    }[];
    budgetBreakdown: Record<string, number>;
    totalEstimated: number;
    tips: string[];
  },
): GuestTrip {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const itineraryDays: ApiItineraryDay[] = plan.days.map((day) => ({
    id: `${id}-day-${day.day}`,
    tripId: id,
    dayNumber: day.day,
    title: day.title,
    activities: day.activities,
    estimatedCost: day.estimatedCost,
    createdAt: now,
    updatedAt: now,
  }));

  return {
    id,
    guest: true,
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    budgetAmount: input.budgetAmount,
    currency: input.currency,
    travelers: input.travelers,
    preferences: input.preferences ?? null,
    status: "PLANNING",
    totalEstimated: plan.totalEstimated,
    budgetBreakdown: plan.budgetBreakdown,
    tips: plan.tips,
    createdAt: now,
    updatedAt: now,
    itineraryDays,
    expenses: [],
  };
}
