import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const shareLink = await prisma.shareLink.findUnique({
      where: { slug },
      include: {
        trip: {
          include: {
            itineraryDays: { orderBy: { dayNumber: "asc" } },
            expenses: true,
          },
        },
      },
    });

    if (!shareLink || !shareLink.isPublic) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(shareLink.trip);
  } catch {
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}
