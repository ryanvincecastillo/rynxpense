import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchSharedTripBySlug } from "@/lib/trips";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const { slug } = await params;
    const supabase = await createClient();
    const trip = await fetchSharedTripBySlug(supabase, slug);

    if (!trip) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch {
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}
