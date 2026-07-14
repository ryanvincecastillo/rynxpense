import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateShareSlug } from "@rynxpense/shared";

const payloadSchema = z.object({
  destination: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  budgetAmount: z.number(),
  currency: z.string().default("PHP"),
  travelers: z.number().default(2),
  totalEstimated: z.number().optional(),
  budgetBreakdown: z.record(z.string(), z.number()).optional().nullable(),
  tips: z.array(z.string()).optional().nullable(),
  itineraryDays: z
    .array(
      z.object({
        dayNumber: z.number(),
        title: z.string(),
        activities: z.array(z.unknown()),
        estimatedCost: z.number(),
      }),
    )
    .optional()
    .default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = payloadSchema.parse(body);
    const admin = createAdminClient();

    const base = generateShareSlug(payload.destination);
    const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;

    const { error } = await admin.from("rynxpense_guest_shares").insert({
      slug,
      payload,
    });

    if (error) {
      console.error("guest share insert:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://rynxpense.com";

    return NextResponse.json({
      slug,
      url: `${origin}/trip/g/${slug}`,
    });
  } catch (error) {
    console.error("POST /api/share/guest:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 400 });
  }
}
