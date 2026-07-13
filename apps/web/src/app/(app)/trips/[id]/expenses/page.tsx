"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@rynxpense/shared";
import {
  getGuestTrip,
  addGuestExpense,
  removeGuestExpense,
} from "@/lib/guest-trips";

interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
}

interface Trip {
  id: string;
  destination: string;
  budgetAmount: number;
  totalEstimated: number | null;
  expenses: Expense[];
}

const categories = ["food", "transport", "activities", "hotel", "other"];

export default function ExpensesPage() {
  const params = useParams();
  const tripId = params.id as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "food",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  const loadTrip = async () => {
    const guest = getGuestTrip(tripId);
    if (guest) {
      setTrip({
        id: guest.id,
        destination: guest.destination,
        budgetAmount: guest.budgetAmount,
        totalEstimated: guest.totalEstimated,
        expenses: guest.expenses ?? [],
      });
      setIsGuest(true);
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/trips/${tripId}`);
    if (res.ok) setTrip(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGuest) {
      const updated = addGuestExpense(tripId, {
        amount: Number(form.amount),
        category: form.category,
        note: form.note || null,
        date: form.date,
      });
      if (updated) {
        setTrip({
          id: updated.id,
          destination: updated.destination,
          budgetAmount: updated.budgetAmount,
          totalEstimated: updated.totalEstimated,
          expenses: updated.expenses ?? [],
        });
        setForm({
          amount: "",
          category: "food",
          note: "",
          date: new Date().toISOString().split("T")[0],
        });
        setShowForm(false);
      }
      return;
    }

    const res = await fetch(`/api/trips/${tripId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(form.amount),
        category: form.category,
        note: form.note || undefined,
        date: form.date,
      }),
    });
    if (res.ok) {
      setForm({
        amount: "",
        category: "food",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      loadTrip();
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (isGuest) {
      const updated = removeGuestExpense(tripId, expenseId);
      if (updated) {
        setTrip({
          id: updated.id,
          destination: updated.destination,
          budgetAmount: updated.budgetAmount,
          totalEstimated: updated.totalEstimated,
          expenses: updated.expenses ?? [],
        });
      }
      return;
    }

    await fetch(`/api/trips/${tripId}/expenses?expenseId=${expenseId}`, {
      method: "DELETE",
    });
    loadTrip();
  };

  if (loading) return <div className="py-12 text-center text-muted">Loading...</div>;
  if (!trip) return <div className="py-12 text-center text-muted">Trip not found</div>;

  const spent = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const budget = trip.totalEstimated ?? trip.budgetAmount;
  const remaining = budget - spent;
  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;

  return (
    <div>
      <Link
        href={`/trips/${tripId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to itinerary
      </Link>

      <h1 className="mb-1 text-2xl font-bold">Expenses</h1>
      <p className="mb-6 text-muted">{trip.destination}</p>

      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-white/70">Budget</p>
            <p className="text-lg font-bold">{formatCurrency(budget)}</p>
          </div>
          <div>
            <p className="text-xs text-white/70">Spent</p>
            <p className="text-lg font-bold">{formatCurrency(spent)}</p>
          </div>
          <div>
            <p className="text-xs text-white/70">Remaining</p>
            <p className={`text-lg font-bold ${remaining < 0 ? "text-red-200" : ""}`}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/30">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct > 100 ? "bg-red-300" : "bg-white"}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="mb-6 space-y-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-border"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Amount (₱)</label>
              <input
                required
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Note</label>
            <input
              type="text"
              placeholder="What was this for?"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white"
            >
              Add expense
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-4 py-2.5 text-sm text-muted ring-1 ring-border"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-semibold text-white shadow-md"
        >
          <Plus className="h-5 w-5" />
          Add expense
        </button>
      )}

      <div className="space-y-2">
        {trip.expenses.length === 0 ? (
          <p className="py-8 text-center text-muted">No expenses logged yet</p>
        ) : (
          trip.expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-border"
            >
              <div>
                <p className="font-medium">{expense.note || expense.category}</p>
                <p className="text-xs text-muted">
                  {expense.category} · {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatCurrency(expense.amount)}</span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-muted hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
