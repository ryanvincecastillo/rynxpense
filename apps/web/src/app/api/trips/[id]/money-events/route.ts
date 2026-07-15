import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { getProjectId } from "@/lib/project";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const TYPES = new Set([
  "price_found",
  "committed",
  "paid",
  "expense",
  "purchase_check",
  "cut_applied",
  "budget_changed",
]);

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

    const { id: tripId } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rynxpense_trip_money_events")
      .select("*")
      .eq("trip_id", tripId)
      .eq("owner_user_id", userOrResponse.id)
      .order("at", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      (data ?? []).map((row) => ({
        id: row.id,
        at: row.at,
        type: row.type,
        category: row.category,
        amount: row.amount != null ? Number(row.amount) : null,
        meta: row.meta ?? {},
      })),
    );
  } catch (error) {
    console.error("GET money-events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }
    const userOrResponse = await getApiUser();
    if (userOrResponse instanceof NextResponse) return userOrResponse;

    const { id: tripId } = await params;
    const body = await request.json();
    if (!TYPES.has(body.type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const projectId = await getProjectId();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rynxpense_trip_money_events")
      .insert({
        trip_id: tripId,
        project_id: projectId,
        owner_user_id: userOrResponse.id,
        type: body.type,
        category: body.category ?? null,
        amount: body.amount ?? null,
        meta: body.meta ?? {},
        at: body.at ?? new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Failed to create event" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        id: data.id,
        at: data.at,
        type: data.type,
        category: data.category,
        amount: data.amount != null ? Number(data.amount) : null,
        meta: data.meta ?? {},
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST money-events:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
