import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("rynxpense_waitlist_entries").upsert(
      { email },
      { onConflict: "email", ignoreDuplicates: false },
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
}
