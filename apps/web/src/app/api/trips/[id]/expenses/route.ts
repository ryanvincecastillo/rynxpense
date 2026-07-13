import { NextResponse } from "next/server";
import { createExpenseSchema } from "@rynxpense/shared";
import { getApiUser } from "@/lib/auth";
import { getProjectId } from "@/lib/project";
import { createClient } from "@/lib/supabase/server";
import { mapExpense } from "@/lib/trips";
import type { DbExpense } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";

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
    const input = createExpenseSchema.parse(body);
    const projectId = await getProjectId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("rynxpense_expenses")
      .insert({
        trip_id: tripId,
        project_id: projectId,
        owner_user_id: userOrResponse.id,
        amount: input.amount,
        category: input.category,
        note: input.note ?? null,
        date: input.date,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create expense");
    }

    return NextResponse.json(mapExpense(data as DbExpense), { status: 201 });
  } catch (error) {
    console.error("POST /api/trips/[id]/expenses:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}

export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get("expenseId");

    if (!expenseId) {
      return NextResponse.json({ error: "expenseId required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("rynxpense_expenses")
      .delete()
      .eq("id", expenseId)
      .eq("trip_id", tripId)
      .eq("owner_user_id", userOrResponse.id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
