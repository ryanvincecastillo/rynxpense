"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, Wallet, Search, MapPin } from "lucide-react";
import { categories } from "@rynxpense/ui-tokens";

export function SearchWidget() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("50000");
  const [travelers, setTravelers] = useState("2");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      destination: destination || "Tokyo",
      budget: budget || "50000",
      travelers: travelers || "2",
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate:
        endDate ||
        new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    if (activeCategory) params.set("category", activeCategory);
    router.push(`/app/trips/new?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSearch}
        className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
      >
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:border-b-0 md:border-r">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            <input
              type="text"
              placeholder="Where to?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-text-light"
            />
          </div>

          <div className="flex items-center gap-2 border-b border-border px-4 py-3 md:border-b-0 md:border-r">
            <Calendar className="h-4 w-4 shrink-0 text-muted" />
            <div className="flex min-w-0 flex-1 gap-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent text-xs outline-none"
              />
              <span className="text-muted">–</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-border px-4 py-3 md:border-b-0 md:border-r">
            <Wallet className="h-4 w-4 shrink-0 text-muted" />
            <span className="text-sm text-muted">₱</span>
            <input
              type="number"
              placeholder="Budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-2 border-b border-border px-4 py-3 md:border-b-0 md:border-r">
            <Users className="h-4 w-4 shrink-0 text-muted" />
            <select
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} traveler{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-dark md:py-3"
          >
            <Search className="h-4 w-4" />
            <span className="md:hidden lg:inline">Search</span>
          </button>
        </div>
      </form>

      <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() =>
              setActiveCategory(activeCategory === cat.id ? null : cat.id)
            }
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              activeCategory === cat.id
                ? "bg-accent text-white shadow-md"
                : "bg-white text-text shadow-sm ring-1 ring-border hover:ring-primary/30"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
