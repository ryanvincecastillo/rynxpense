import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchUserTrips } from "@/lib/trips";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json([]);

    const userOrResponse = await getApiUser();
    if (userOrResponse instanceof NextResponse) return userOrResponse;

    const supabase = await createClient();
    const trips = await fetchUserTrips(supabase, userOrResponse.id);
    return NextResponse.json(trips);
  } catch (error) {
    console.error("GET /api/trips:", error);
    return NextResponse.json([]);
  }
}
