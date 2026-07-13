import { NextResponse } from "next/server";
import { generateTripSchema, generateShareSlug } from "@rynxpense/shared";
import { generateTripPlan } from "@/lib/groq";
import { getApiUser, ensureProfile } from "@/lib/auth";
import { getProjectId } from "@/lib/project";
import { createClient } from "@/lib/supabase/server";
import { fetchTripById } from "@/lib/trips";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 },
      );
    }

    const userOrResponse = await getApiUser();
    if (userOrResponse instanceof NextResponse) return userOrResponse;

    await ensureProfile(userOrResponse.email?.split("@")[0] ?? "");
    const projectId = await getProjectId();
    const supabase = await createClient();

    const body = await request.json();
    const input = generateTripSchema.parse(body);
    const plan = await generateTripPlan(input);

    const { data: trip, error: tripError } = await supabase
      .from("rynxpense_trips")
      .insert({
        project_id: projectId,
        owner_user_id: userOrResponse.id,
        destination: input.destination,
        start_date: input.startDate,
        end_date: input.endDate,
        budget_amount: input.budgetAmount,
        currency: input.currency,
        travelers: input.travelers,
        preferences: input.preferences ?? null,
        total_estimated: plan.totalEstimated,
        budget_breakdown: plan.budgetBreakdown,
        tips: plan.tips,
        status: "PLANNING",
      })
      .select("*")
      .single();

    if (tripError || !trip) {
      throw new Error(tripError?.message ?? "Failed to create trip");
    }

    const { error: daysError } = await supabase
      .from("rynxpense_itinerary_days")
      .insert(
        plan.days.map((day) => ({
          trip_id: trip.id,
          day_number: day.day,
          title: day.title,
          activities: day.activities,
          estimated_cost: day.estimatedCost,
        })),
      );

    if (daysError) throw new Error(daysError.message);

    const { error: shareError } = await supabase
      .from("rynxpense_share_links")
      .insert({
        trip_id: trip.id,
        slug: generateShareSlug(input.destination),
        is_public: true,
      });

    if (shareError) throw new Error(shareError.message);

    const fullTrip = await fetchTripById(supabase, trip.id);
    return NextResponse.json(fullTrip, { status: 201 });
  } catch (error) {
    console.error("POST /api/trips/generate:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate trip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
