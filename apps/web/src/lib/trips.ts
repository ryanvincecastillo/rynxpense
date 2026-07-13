import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ApiExpense,
  ApiItineraryDay,
  ApiShareLink,
  ApiTrip,
  DbExpense,
  DbItineraryDay,
  DbShareLink,
  DbTrip,
  SharedTrip,
} from "@/lib/types";

export function mapItineraryDay(row: DbItineraryDay): ApiItineraryDay {
  return {
    id: row.id,
    tripId: row.trip_id,
    dayNumber: row.day_number,
    title: row.title,
    activities: row.activities,
    estimatedCost: Number(row.estimated_cost),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapExpense(row: DbExpense): ApiExpense {
  return {
    id: row.id,
    tripId: row.trip_id,
    amount: Number(row.amount),
    category: row.category,
    note: row.note,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapShareLink(row: DbShareLink): ApiShareLink {
  return {
    id: row.id,
    tripId: row.trip_id,
    slug: row.slug,
    isPublic: row.is_public,
    createdAt: row.created_at,
  };
}

export function mapTrip(
  row: DbTrip,
  extras?: {
    itineraryDays?: DbItineraryDay[];
    expenses?: DbExpense[];
    shareLink?: DbShareLink | null;
  },
): ApiTrip {
  return {
    id: row.id,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    budgetAmount: Number(row.budget_amount),
    currency: row.currency,
    travelers: row.travelers,
    status: row.status,
    preferences: row.preferences,
    totalEstimated:
      row.total_estimated != null ? Number(row.total_estimated) : null,
    budgetBreakdown: row.budget_breakdown,
    tips: row.tips,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    itineraryDays: extras?.itineraryDays?.map(mapItineraryDay),
    expenses: extras?.expenses?.map(mapExpense),
    shareLink:
      extras?.shareLink === null
        ? null
        : extras?.shareLink
          ? mapShareLink(extras.shareLink)
          : undefined,
    _count: extras?.expenses
      ? { expenses: extras.expenses.length }
      : undefined,
  };
}

export async function fetchUserTrips(
  supabase: SupabaseClient,
  userId: string,
): Promise<ApiTrip[]> {
  const { data: trips, error } = await supabase
    .from("rynxpense_trips")
    .select("*")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !trips?.length) return [];

  const tripIds = trips.map((t) => t.id);
  const { data: expenses } = await supabase
    .from("rynxpense_expenses")
    .select("*")
    .in("trip_id", tripIds);

  const expensesByTrip = new Map<string, DbExpense[]>();
  for (const exp of (expenses ?? []) as DbExpense[]) {
    const list = expensesByTrip.get(exp.trip_id) ?? [];
    list.push(exp);
    expensesByTrip.set(exp.trip_id, list);
  }

  return (trips as DbTrip[]).map((trip) =>
    mapTrip(trip, { expenses: expensesByTrip.get(trip.id) }),
  );
}

export async function fetchTripById(
  supabase: SupabaseClient,
  tripId: string,
): Promise<ApiTrip | null> {
  const { data: trip, error } = await supabase
    .from("rynxpense_trips")
    .select("*")
    .eq("id", tripId)
    .maybeSingle();

  if (error || !trip) return null;

  const [{ data: days }, { data: expenses }, { data: shareLink }] =
    await Promise.all([
      supabase
        .from("rynxpense_itinerary_days")
        .select("*")
        .eq("trip_id", tripId)
        .order("day_number", { ascending: true }),
      supabase
        .from("rynxpense_expenses")
        .select("*")
        .eq("trip_id", tripId)
        .order("date", { ascending: false }),
      supabase
        .from("rynxpense_share_links")
        .select("*")
        .eq("trip_id", tripId)
        .maybeSingle(),
    ]);

  return mapTrip(trip as DbTrip, {
    itineraryDays: (days ?? []) as DbItineraryDay[],
    expenses: (expenses ?? []) as DbExpense[],
    shareLink: (shareLink as DbShareLink | null) ?? null,
  });
}

export async function fetchSharedTripBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<SharedTrip | null> {
  const { data, error } = await supabase.rpc("rynxpense_get_shared_trip", {
    p_slug: slug,
  });

  if (error || !data) return null;
  const trip = data as SharedTrip;
  if (!trip?.itineraryDays) return null;
  return trip;
}
