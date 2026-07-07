import { NextResponse } from "next/server";
import { createExpenseSchema } from "@rynxpense/shared";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = createExpenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        tripId: id,
        amount: input.amount,
        category: input.category,
        note: input.note,
        date: new Date(input.date),
      },
    });

    return NextResponse.json(expense, { status: 201 });
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
    const { id: tripId } = await params;
    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get("expenseId");

    if (!expenseId) {
      return NextResponse.json({ error: "expenseId required" }, { status: 400 });
    }

    await prisma.expense.deleteMany({
      where: { id: expenseId, tripId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
