import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        expenses: { select: { amount: true } },
        _count: { select: { expenses: true } },
      },
    });
    return NextResponse.json(trips);
  } catch (error) {
    console.error("GET /api/trips:", error);
    return NextResponse.json([]);
  }
}
