"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  categories,
  popularDestinations,
  type DestinationCategory,
  type DestinationRegion,
} from "@rynxpense/ui-tokens";
import { formatCurrency } from "@rynxpense/shared";

type BudgetFilter = "all" | "under25" | "25to40" | "over40";
type SortKey = "popular" | "budget-asc" | "budget-desc" | "days";

const regions: { id: DestinationRegion | "all"; label: string }[] = [
  { id: "all", label: "All regions" },
  { id: "philippines", label: "Philippines" },
  { id: "asia", label: "Asia" },
];

const budgets: { id: BudgetFilter; label: string }[] = [
  { id: "all", label: "Any budget" },
  { id: "under25", label: "Under ₱25k" },
  { id: "25to40", label: "₱25k – ₱40k" },
  { id: "over40", label: "₱40k+" },
];

function matchesBudget(amount: number, filter: BudgetFilter) {
  if (filter === "under25") return amount < 25000;
  if (filter === "25to40") return amount >= 25000 && amount <= 40000;
  if (filter === "over40") return amount > 40000;
  return true;
}

export function DestinationCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DestinationCategory | "all">("all");
  const [region, setRegion] = useState<DestinationRegion | "all">("all");
  const [budget, setBudget] = useState<BudgetFilter>("all");
  const [sort, setSort] = useState<SortKey>("popular");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = popularDestinations.filter((dest) => {
      if (category !== "all" && !dest.tags.includes(category)) return false;
      if (region !== "all" && dest.region !== region) return false;
      if (!matchesBudget(dest.budgetFrom, budget)) return false;
      if (!q) return true;
      return (
        dest.name.toLowerCase().includes(q) ||
        dest.country.toLowerCase().includes(q) ||
        dest.samplePlan.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sort === "budget-asc") return a.budgetFrom - b.budgetFrom;
      if (sort === "budget-desc") return b.budgetFrom - a.budgetFrom;
      if (sort === "days") return a.days - b.days;
      return 0;
    });
  }, [query, category, region, budget, sort]);

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setRegion("all");
    setBudget("all");
    setSort("popular");
  };

  const hasFilters =
    query || category !== "all" || region !== "all" || budget !== "all" || sort !== "popular";

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-border sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations, countries, vibes..."
              className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="hidden h-4 w-4 text-muted sm:block" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as DestinationRegion | "all")}
              className="rounded-xl border border-border bg-white px-3 py-3 text-sm outline-none focus:border-primary"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value as BudgetFilter)}
              className="rounded-xl border border-border bg-white px-3 py-3 text-sm outline-none focus:border-primary"
            >
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-border bg-white px-3 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="popular">Popular</option>
              <option value="budget-asc">Budget ↑</option>
              <option value="budget-desc">Budget ↓</option>
              <option value="days">Trip length</option>
            </select>
          </div>
        </div>

        <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          <FilterChip
            active={category === "all"}
            onClick={() => setCategory("all")}
            label="All styles"
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat.id}
              active={category === cat.id}
              onClick={() => setCategory(cat.id)}
              label={cat.label}
            />
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-text sm:text-2xl">
            {filtered.length} destination{filtered.length === 1 ? "" : "s"}
          </h2>
          <p className="text-sm text-muted">
            Tap any card to start a peso plan for that trip.
          </p>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-border">
          <p className="font-display text-lg font-bold">No destinations match</p>
          <p className="mt-2 text-sm text-muted">
            Try another style, region, or budget — or plan any destination freeform.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Reset filters
            </button>
            <Link
              href="/trips/new"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white"
            >
              Plan my trip
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dest) => (
            <Link
              key={dest.id}
              href={`/trips/new?destination=${encodeURIComponent(dest.name)}&budget=${dest.budgetFrom}`}
              className="group overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-1"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-display text-xl font-bold">{dest.name}</h3>
                  <p className="text-sm text-white/80">{dest.country}</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <p className="line-clamp-1 text-sm text-muted">{dest.samplePlan}</p>
                <div className="flex flex-wrap gap-1.5">
                  {dest.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-medium capitalize text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted">
                  from{" "}
                  <span className="font-bold text-primary">
                    {formatCurrency(dest.budgetFrom)}
                  </span>
                  <span> / {dest.days} days</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-accent text-white"
          : "bg-background text-text ring-1 ring-border hover:ring-primary/30"
      }`}
    >
      {label}
    </button>
  );
}
