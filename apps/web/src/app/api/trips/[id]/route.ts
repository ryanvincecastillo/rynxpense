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
