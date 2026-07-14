"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { categories, popularDestinations } from "@rynxpense/ui-tokens";

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatShort(iso: string) {
  if (!iso) return "";
  return parseISO(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

function formatBudgetDisplay(n: number) {
  return n.toLocaleString("en-PH");
}

function parseBudgetInput(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Math.min(Number(digits), 10_000_000);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type OpenPanel = "destination" | "dates" | null;

export function SearchWidget() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState(50000);
  const [travelers, setTravelers] = useState(2);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [open, setOpen] = useState<OpenPanel>(null);
  const [highlight, setHighlight] = useState(0);
  const [monthCursor, setMonthCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [rangeHover, setRangeHover] = useState<string | null>(null);
  const listId = useId();

  const suggestions = useMemo(() => {
    const q = destination.trim().toLowerCase();
    const list = popularDestinations.filter((d) => {
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.samplePlan.toLowerCase().includes(q)
      );
    });
    return list.slice(0, 8);
  }, [destination]);

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setHighlight(0);
  }, [destination, open]);

  const pickDestination = (name: string, budgetFrom?: number) => {
    setDestination(name);
    if (budgetFrom) setBudget(budgetFrom);
    setOpen(null);
  };

  const onDestinationKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (open !== "destination") setOpen("destination");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(suggestions.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open === "destination" && suggestions[highlight]) {
      e.preventDefault();
      const dest = suggestions[highlight];
      pickDestination(dest.name, dest.budgetFrom);
    }
  };

  const selectDay = (iso: string) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(iso);
      setEndDate("");
      setRangeHover(null);
      return;
    }
    if (iso < startDate) {
      setStartDate(iso);
      setEndDate("");
      return;
    }
    setEndDate(iso);
    setOpen(null);
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
    setRangeHover(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const today = startOfDay(new Date());
    const defaultStart = toISO(today);
    const defaultEnd = toISO(new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000));
    const params = new URLSearchParams({
      destination: destination.trim() || "Tokyo",
      budget: String(budget || 50000),
      travelers: String(travelers || 2),
      startDate: startDate || defaultStart,
      endDate: endDate || defaultEnd,
    });
    if (activeCategory) params.set("category", activeCategory);
    router.push(`/trips/new?${params.toString()}`);
  };

  const dateLabel =
    startDate && endDate
      ? `${formatShort(startDate)} – ${formatShort(endDate)}`
      : startDate
        ? `${formatShort(startDate)} – Return`
        : "Add dates";

  return (
    <div ref={rootRef} className="w-full">
      <form
        onSubmit={handleSearch}
        className="overflow-visible rounded-2xl bg-background ring-1 ring-border"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.35fr)_minmax(0,1.1fr)_minmax(0,1fr)_auto]">
          {/* Destination */}
          <div className="relative border-b border-border lg:border-b-0 lg:border-r">
            <label className="flex cursor-text items-center gap-3 px-4 py-3.5">
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Destination
                </span>
                <input
                  type="text"
                  role="combobox"
                  aria-expanded={open === "destination"}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  placeholder="Where to? Tokyo, El Nido…"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setOpen("destination");
                  }}
                  onFocus={() => setOpen("destination")}
                  onKeyDown={onDestinationKey}
                  className="w-full bg-transparent text-sm font-semibold text-text outline-none placeholder:font-medium placeholder:text-text-light"
                  autoComplete="off"
                />
              </div>
              {destination ? (
                <button
                  type="button"
                  aria-label="Clear destination"
                  onClick={() => setDestination("")}
                  className="rounded-full p-1 text-muted hover:bg-white hover:text-text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </label>

            {open === "destination" && (
              <div
                id={listId}
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%-4px)] z-40 mt-1 max-h-72 overflow-auto rounded-2xl bg-white py-2 shadow-xl ring-1 ring-black/10"
              >
                <p className="px-4 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {destination.trim() ? "Matches" : "Popular destinations"}
                </p>
                {suggestions.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted">
                    No matches — keep typing a custom place.
                  </p>
                ) : (
                  suggestions.map((dest, i) => (
                    <button
                      key={dest.id}
                      type="button"
                      role="option"
                      aria-selected={highlight === i}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => pickDestination(dest.name, dest.budgetFrom)}
                      className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition ${
                        highlight === i ? "bg-primary/10" : "hover:bg-background"
                      }`}
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-text">
                          {dest.name}
                        </span>
                        <span className="block text-xs text-muted">
                          {dest.country} · from ₱{formatBudgetDisplay(dest.budgetFrom)}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="relative border-b border-border lg:border-b-0 lg:border-r">
            <button
              type="button"
              onClick={() => setOpen(open === "dates" ? null : "dates")}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <Calendar className="h-5 w-5 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Dates
                </span>
                <span
                  className={`block truncate text-sm font-semibold ${
                    startDate ? "text-text" : "font-medium text-text-light"
                  }`}
                >
                  {dateLabel}
                </span>
              </div>
            </button>

            {open === "dates" && (
              <DateRangePopover
                month={monthCursor}
                onMonthChange={setMonthCursor}
                startDate={startDate}
                endDate={endDate}
                rangeHover={rangeHover}
                onHover={setRangeHover}
                onSelect={selectDay}
                onClear={clearDates}
                onDone={() => setOpen(null)}
              />
            )}
          </div>

          {/* Budget */}
          <div className="border-b border-border lg:border-b-0 lg:border-r">
            <label className="flex items-center gap-3 px-4 py-3.5">
              <Wallet className="h-5 w-5 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Budget
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-muted">₱</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={budget ? formatBudgetDisplay(budget) : ""}
                    onChange={(e) => setBudget(parseBudgetInput(e.target.value))}
                    placeholder="50,000"
                    className="w-full min-w-[5.5rem] bg-transparent text-sm font-semibold tabular-nums text-text outline-none placeholder:font-medium placeholder:text-text-light"
                  />
                </div>
              </div>
            </label>
          </div>

          {/* Travelers */}
          <div className="border-b border-border lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Travelers
                </span>
                <p className="text-sm font-semibold text-text">
                  {travelers} {travelers === 1 ? "traveler" : "travelers"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <StepperButton
                  label="Fewer travelers"
                  onClick={() => setTravelers((n) => Math.max(1, n - 1))}
                  disabled={travelers <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </StepperButton>
                <StepperButton
                  label="More travelers"
                  onClick={() => setTravelers((n) => Math.min(12, n + 1))}
                  disabled={travelers >= 12}
                >
                  <Plus className="h-3.5 w-3.5" />
                </StepperButton>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-dark lg:rounded-r-2xl lg:py-3.5"
          >
            <Sparkles className="h-4 w-4" />
            <span>Build plan</span>
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
                ? "bg-accent text-white"
                : "bg-white text-text ring-1 ring-border hover:ring-primary/30"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepperButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-text ring-1 ring-border transition hover:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function DateRangePopover({
  month,
  onMonthChange,
  startDate,
  endDate,
  rangeHover,
  onHover,
  onSelect,
  onClear,
  onDone,
}: {
  month: Date;
  onMonthChange: (d: Date) => void;
  startDate: string;
  endDate: string;
  rangeHover: string | null;
  onHover: (iso: string | null) => void;
  onSelect: (iso: string) => void;
  onClear: () => void;
  onDone: () => void;
}) {
  const today = startOfDay(new Date());
  const months = [month, new Date(month.getFullYear(), month.getMonth() + 1, 1)];

  return (
    <div className="absolute left-0 top-[calc(100%-4px)] z-40 mt-1 w-[min(100vw-2rem,36rem)] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/10 sm:left-auto sm:right-0 lg:left-0 lg:right-auto">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-text">
          {!startDate
            ? "Select start date"
            : !endDate
              ? "Select end date"
              : `${formatShort(startDate)} – ${formatShort(endDate)}`}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() =>
              onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
            className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-text"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() =>
              onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
            className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-text"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {months.map((m) => (
          <MonthGrid
            key={`${m.getFullYear()}-${m.getMonth()}`}
            month={m}
            today={today}
            startDate={startDate}
            endDate={endDate}
            rangeHover={rangeHover}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-muted hover:text-text"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={!startDate}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {endDate || startDate ? "Done" : "Close"}
        </button>
      </div>
    </div>
  );
}

function MonthGrid({
  month,
  today,
  startDate,
  endDate,
  rangeHover,
  onHover,
  onSelect,
}: {
  month: Date;
  today: Date;
  startDate: string;
  endDate: string;
  rangeHover: string | null;
  onHover: (iso: string | null) => void;
  onSelect: (iso: string) => void;
}) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDow = new Date(year, m, 1).getDay();
  const total = daysInMonth(year, m);
  const label = month.toLocaleDateString("en-PH", { month: "long", year: "numeric" });

  const start = startDate ? parseISO(startDate) : null;
  const end = endDate ? parseISO(endDate) : null;
  const hover =
    start && !end && rangeHover ? parseISO(rangeHover) : null;
  const rangeEnd = end ?? hover;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-text">{label}</p>
      <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <span key={`e-${i}`} />;
          const date = new Date(year, m, day);
          const iso = toISO(date);
          const disabled = date < today;
          const isStart = start && sameDay(date, start);
          const isEnd = end && sameDay(date, end);
          const inRange =
            start &&
            rangeEnd &&
            date > start &&
            date < rangeEnd &&
            (end || hover);
          const isEdge = isStart || isEnd;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(iso)}
              onMouseEnter={() => onHover(iso)}
              onMouseLeave={() => onHover(null)}
              className={`relative h-9 rounded-lg text-sm font-medium transition ${
                disabled
                  ? "cursor-not-allowed text-text-light/50"
                  : isEdge
                    ? "bg-primary text-white"
                    : inRange
                      ? "bg-primary/12 text-primary"
                      : "text-text hover:bg-background"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
