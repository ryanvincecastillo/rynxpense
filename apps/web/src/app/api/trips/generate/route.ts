import { NextResponse } from "next/server";
import { generateTripSchema, generateShareSlug } from "@rynxpense/shared";
import { prisma } from "@/lib/prisma";
import { generateTripPlan } from "@/lib/groq";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = generateTripSchema.parse(body);

    const plan = await generateTripPlan(input);

    const trip = await prisma.trip.create({
      data: {
        destination: input.destination,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        budgetAmount: input.budgetAmount,
        currency: input.currency,
        travelers: input.travelers,
        preferences: input.preferences,
        totalEstimated: plan.totalEstimated,
        budgetBreakdown: plan.budgetBreakdown,
        tips: plan.tips,
        status: "PLANNING",
        itineraryDays: {
          create: plan.days.map((day) => ({
            dayNumber: day.day,
            title: day.title,
            activities: day.activities,
            estimatedCost: day.estimatedCost,
          })),
        },
        shareLink: {
          create: {
            slug: generateShareSlug(input.destination),
            isPublic: true,
          },
        },
      },
      include: {
        itineraryDays: true,
        shareLink: true,
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error("POST /api/trips/generate:", error);
    const message = error instanceof Error ? error.message : "Failed to generate trip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
