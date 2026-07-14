import type { Activity, InspirationItem, AITripPlan } from "@rynxpense/shared";
import type { ApiTrip } from "@/lib/types";

const categoryMap: Record<
  Activity["category"],
  InspirationItem["category"]
> = {
  food: "food",
  hotel: "stay",
  activities: "activity",
  transport: "transport",
  other: "other",
};

export function extractInspirationFromPlan(plan: AITripPlan): InspirationItem[] {
  const seen = new Set<string>();
  const items: InspirationItem[] = [];

  for (const day of plan.days) {
    for (const act of day.activities) {
      const key = act.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      items.push({
        id: `inspo-${day.day}-${items.length}`,
        title: act.title,
        description: act.description,
        category: categoryMap[act.category],
        estimatedCost: act.estimatedCost,
        sourceType: "ai",
        priority: act.category === "hotel" || act.source === "from_save" ? "must" : "maybe",
      });
    }
  }

  return items;
}

export function extractInspirationFromTrip(trip: ApiTrip): InspirationItem[] {
  const seen = new Set<string>();
  const items: InspirationItem[] = [];

  for (const day of trip.itineraryDays ?? []) {
    for (const act of day.activities as Activity[]) {
      const key = act.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      items.push({
        id: `inspo-${day.dayNumber}-${items.length}`,
        title: act.title,
        description: act.description,
        category: categoryMap[act.category],
        estimatedCost: act.estimatedCost,
        sourceType: act.source === "from_save" ? "text" : "ai",
        priority: act.category === "hotel" ? "must" : "maybe",
      });
    }
  }

  return items;
}
