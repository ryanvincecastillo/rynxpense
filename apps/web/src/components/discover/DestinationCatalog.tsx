"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import {
  categories,
  popularDestinations,
  type DestinationCategory,
  type DestinationRegion,
  type PopularDestination,
} from "@rynxpense/ui-tokens";
import { formatCurrency } from "@rynxpense/shared";

type BudgetFilter = "all" | "under25" | "25to40" | "over40";

const regions: { id: DestinationRegion | "all"; label: string }[] = [
  { id: "all", label: "All" },
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

function DestCard({
  dest,
  featured,
}: {
  dest: PopularDestination;
  featured?: boolean;
}) {
  const href = `/trips/new?destination=${encodeURIComponent(dest.name)}&budget=${dest.budgetFrom}`;

  if (featured) {
    return (
      <Link
        href={href}
        className="group relative grid overflow-hidden rounded-3xl bg-white ring-1 ring-black/5 lg:grid-cols-2"
      >
        <div className="relative min-h-[280px] lg:min-h-[420px]">
          <Image
            src={dest.heroImage}
            alt={dest.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Featured · {dest.badge}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {dest.name}
          </h2>
          <p className="mt-1 text-sm text-muted">{dest.country}</p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            {dest.blurb}
          </p>
          <p className="mt-3 text-sm text-muted">{dest.samplePlan}</p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <p className="text-sm text-muted">
              from{" "}
              <span className="font-display text-2xl font-bold text-primary">
                {formatCurrency(dest.budgetFrom)}
              </span>
              <span className="text-muted"> / {dest.days} days</span>
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
              Plan this trip
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/6]">
        <Image
          src={dest.image}
          alt={dest.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {dest.badge}
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold">{dest.name}</h3>
          <p className="text-sm text-white/80">{dest.country}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{dest.blurb}</p>
        <p className="line-clamp-1 text-xs text-muted">{dest.samplePlan}</p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <p className="text-sm text-muted">
            from{" "}
            <span className="font-bold text-primary">
              {formatCurrency(dest.budgetFrom)}
            </span>
            <span> / {dest.days}d</span>
          </p>
          <span className="text-xs font-semibold text-accent">View plan →</span>
        </div>
      </div>
    </Link>
  );
}

export function DestinationCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DestinationCategory | "all">("all");
  const [region, setRegion] = useState<DestinationRegion | "all">("all");
  const [budget, setBudget] = useState<BudgetFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return popularDestinations.filter((dest) => {
      if (category !== "all" && !dest.tags.includes(category)) return false;
      if (region !== "all" && dest.region !== region) return false;
      if (!matchesBudget(dest.budgetFrom, budget)) return false;
      if (!q) return true;
      return (
        dest.name.toLowerCase().includes(q) ||
        dest.country.toLowerCase().includes(q) ||
        dest.samplePlan.toLowerCase().includes(q) ||
        dest.blurb.toLowerCase().includes(q)
      );
    });
  }, [query, category, region, budget]);

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const ph = rest.filter((d) => d.region === "philippines");
  const asia = rest.filter((d) => d.region === "asia");
  const useSections = region === "all" && !query && category === "all" && budget === "all";

  return (
    <div className="space-y-12">
      <div className="border-b border-border pb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations…"
            className="w-full border-0 border-b border-transparent bg-transparent py-3 pl-7 pr-3 text-base outline-none placeholder:text-muted focus:border-primary"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {regions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRegion(r.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                region === r.id
                  ? "bg-text text-white"
                  : "bg-background text-text ring-1 ring-border hover:ring-primary/30"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <Chip
            active={category === "all"}
            onClick={() => setCategory("all")}
            label="All styles"
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              active={category === cat.id}
              onClick={() => setCategory(cat.id)}
              label={cat.label}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {budgets.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBudget(b.id)}
              className={`text-sm font-medium transition ${
                budget === b.id ? "text-primary underline underline-offset-4" : "text-muted hover:text-text"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted">
        {filtered.length} destinations in this catalog
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-background px-6 py-16 text-center">
          <p className="font-display text-lg font-bold">No destinations match</p>
          <p className="mt-2 text-sm text-muted">Try another region, style, or budget.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setRegion("all");
              setBudget("all");
            }}
            className="mt-6 text-sm font-semibold text-primary"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          {featured && <DestCard dest={featured} featured />}

          {useSections ? (
            <>
              {ph.length > 0 && (
                <CatalogSection title="Philippines" subtitle="Local favorites for DIY weekends and island hops">
                  {ph.map((d) => (
                    <DestCard key={d.id} dest={d} />
                  ))}
                </CatalogSection>
              )}
              {asia.length > 0 && (
                <CatalogSection title="Asia" subtitle="Nearby cities and classics Filipinos fly to">
                  {asia.map((d) => (
                    <DestCard key={d.id} dest={d} />
                  ))}
                </CatalogSection>
              )}
            </>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((d) => (
                <DestCard key={d.id} dest={d} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CatalogSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 max-w-xl">
        <h2 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function Chip({
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
          : "bg-white text-text ring-1 ring-border hover:ring-primary/30"
      }`}
    >
      {label}
    </button>
  );
}
