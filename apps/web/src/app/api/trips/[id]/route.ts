import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchTripById } from "@/lib/trips";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const userOrResponse = await getApiUser();
    if (userOrResponse instanceof NextResponse) return userOrResponse;

    const { id } = await params;
    const supabase = await createClient();
    const trip = await fetchTripById(supabase, id);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("GET /api/trips/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const userOrResponse = await getApiUser();
    if (userOrResponse instanceof NextResponse) return userOrResponse;

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const tripPatch: Record<string, unknown> = {};
    if (typeof body.budgetAmount === "number") tripPatch.budget_amount = body.budgetAmount;
    if (typeof body.travelers === "number") tripPatch.travelers = body.travelers;
    if (typeof body.endDate === "string") tripPatch.end_date = body.endDate;
    if (typeof body.totalEstimated === "number") {
      tripPatch.total_estimated = body.totalEstimated;
    }
    if (body.budgetBreakdown && typeof body.budgetBreakdown === "object") {
      tripPatch.budget_breakdown = body.budgetBreakdown;
    }
    tripPatch.updated_at = new Date().toISOString();

    if (Object.keys(tripPatch).length > 1) {
      const { error } = await supabase
        .from("rynxpense_trips")
        .update(tripPatch)
        .eq("id", id)
        .eq("owner_user_id", userOrResponse.id);
      if (error) {
        return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
      }
    }

    if (Array.isArray(body.itineraryDays)) {
      await supabase.from("rynxpense_itinerary_days").delete().eq("trip_id", id);
      const rows = body.itineraryDays.map(
        (d: {
          dayNumber: number;
          title: string;
          activities: unknown;
          estimatedCost: number;
        }) => ({
          trip_id: id,
          day_number: d.dayNumber,
          title: d.title,
          activities: d.activities,
          estimated_cost: d.estimatedCost,
        }),
      );
      if (rows.length) {
        const { error } = await supabase.from("rynxpense_itinerary_days").insert(rows);
        if (error) {
          return NextResponse.json({ error: "Failed to update itinerary" }, { status: 500 });
        }
      }
    }

    const trip = await fetchTripById(supabase, id);
    return NextResponse.json(trip);
  } catch (error) {
    console.error("PATCH /api/trips/[id]:", error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const userOrResponse = await getApiUser();
    if (userOrResponse instanceof NextResponse) return userOrResponse;

    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase
      .from("rynxpense_trips")
      .delete()
      .eq("id", id)
      .eq("owner_user_id", userOrResponse.id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
