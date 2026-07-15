"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Wallet,
  Receipt,
  Lightbulb,
  Cloud,
  LayoutDashboard,
  PieChart,
  Map,
} from "lucide-react";
import {
  formatCurrency,
  computeBudgetTally,
  computeRealityCheck,
  computeTripFeasibility,
  buildMakeItFitStrategies,
  itineraryDaysForEngine,
  buildCostLines,
  linesToBreakdown,
  type FitStrategy,
  type Activity,
  type InspirationItem,
  type CostLine,
  type CostLineKey,
  type TravelerCostProfile,
} from "@rynxpense/shared";
import type { ApiTrip, ApiItineraryDay } from "@/lib/types";
import { getGuestTrip, updateGuestTripPlan } from "@/lib/guest-trips";
import { listTripInspiration } from "@/lib/inspiration";
import { extractInspirationFromTrip } from "@/lib/inspiration-from-plan";
import {
  loadCostLineOverrides,
  loadTravelerCostProfile,
} from "@/lib/cost-lines";
import { InspirationBoard } from "@/components/app/InspirationBoard";
import { BudgetTallyBar } from "@/components/app/BudgetTallyBar";
import { RealityCheckButton } from "@/components/app/RealityCheckModal";
import { TripHero } from "@/components/app/TripHero";
import { TripSharePanel } from "@/components/share/TripSharePanel";
import { FeasibilityOverview } from "@/components/app/FeasibilityOverview";
import { BudgetLifecyclePanel } from "@/components/app/BudgetLifecyclePanel";
import { BudgetAutopsyPanel } from "@/components/app/BudgetAutopsyPanel";

type Tab = "overview" | "budget" | "plan" | "expenses";

export function TripDetailClient({ tripId }: { tripId: string }) {
  const [trip, setTrip] = useState<ApiTrip | null>(null);
  const [inspiration, setInspiration] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [applying, setApplying] = useState(false);

  // Scenario state (what-if)
  const [scenarioBudget, setScenarioBudget] = useState<number | null>(null);
  const [scenarioTravelers, setScenarioTravelers] = useState<number | null>(null);
  const [scenarioDays, setScenarioDays] = useState<number | null>(null);
  const [skipPaid, setSkipPaid] = useState(false);
  const [costOverrides, setCostOverrides] = useState<
    Partial<Record<CostLineKey, Partial<CostLine>>>
  >({});
  const [costProfile, setCostProfile] = useState<TravelerCostProfile | null>(null);

  useEffect(() => {
    setCostOverrides(loadCostLineOverrides(tripId));
    setCostProfile(loadTravelerCostProfile());

    const guest = getGuestTrip(tripId);
    if (guest) {
      setTrip(guest);
      setIsGuest(true);
      const saved = listTripInspiration(tripId);
      setInspiration(saved.length ? saved : extractInspirationFromTrip(guest));
      setLoading(false);
      return;
    }

    fetch(`/api/trips/${tripId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setTrip(data);
          const saved = listTripInspiration(tripId);
          setInspiration(saved.length ? saved : extractInspirationFromTrip(data));
        }
      })
      .finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => {
    if (!trip) return;
    setScenarioBudget(trip.budgetAmount);
    setScenarioTravelers(trip.travelers);
    setScenarioDays(trip.itineraryDays?.length ?? 1);
    setSkipPaid(false);
  }, [trip?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const engineDays = useMemo(
    () =>
      itineraryDaysForEngine(
        trip?.itineraryDays?.map((d) => ({
          dayNumber: d.dayNumber,
          title: d.title,
          estimatedCost: d.estimatedCost,
          activities: d.activities as Activity[],
        })),
      ),
    [trip],
  );

  const maxDays = engineDays?.length || 1;

  const effectiveBreakdown = useMemo(() => {
    if (!trip) return null;
    const lines = buildCostLines(trip.budgetBreakdown, costOverrides);
    const hasConfirmed = lines.some(
      (l) => (l.found != null && l.found > 0) || (l.booked != null && l.booked > 0),
    );
    return hasConfirmed ? linesToBreakdown(lines) : trip.budgetBreakdown;
  }, [trip, costOverrides]);

  const feasibility = useMemo(() => {
    if (!trip || scenarioBudget == null || scenarioTravelers == null || scenarioDays == null) {
      return null;
    }
    const spent = trip.expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
    return computeTripFeasibility({
      destination: trip.destination,
      budgetAmount: trip.budgetAmount,
      travelers: trip.travelers,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budgetBreakdown: effectiveBreakdown,
      totalEstimated: trip.totalEstimated,
      days: engineDays,
      spent,
      origin: "Manila",
      scenario: {
        budgetAmount: scenarioBudget,
        travelers: scenarioTravelers,
        keepDays: scenarioDays,
        baselineTravelers: trip.travelers,
        skipPaidActivities: skipPaid,
      },
    });
  }, [
    trip,
    engineDays,
    scenarioBudget,
    scenarioTravelers,
    scenarioDays,
    skipPaid,
    effectiveBreakdown,
  ]);

  const strategies = useMemo(() => {
    if (!trip || scenarioBudget == null) return [];
    return buildMakeItFitStrategies({
      destination: trip.destination,
      budgetAmount: scenarioBudget,
      travelers: scenarioTravelers ?? trip.travelers,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budgetBreakdown: effectiveBreakdown,
      totalEstimated: trip.totalEstimated,
      days: engineDays,
      scenario: {
        budgetAmount: scenarioBudget,
        travelers: scenarioTravelers ?? trip.travelers,
        baselineTravelers: trip.travelers,
      },
    });
  }, [trip, engineDays, scenarioBudget, scenarioTravelers, effectiveBreakdown]);

  const tally = useMemo(() => {
    if (!trip) return null;
    const spent = trip.expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
    return computeBudgetTally({
      budgetAmount: trip.budgetAmount,
      totalEstimated: trip.totalEstimated,
      // Don't double-count inspo already derived from itinerary
      inspirationItems: [],
      itineraryTotal: trip.totalEstimated ?? trip.budgetAmount,
      spent,
    });
  }, [trip]);

  const realityCheck = useMemo(() => {
    if (!trip) return null;
    return computeRealityCheck({
      budgetAmount: trip.budgetAmount,
      budgetBreakdown: trip.budgetBreakdown,
      totalEstimated: trip.totalEstimated,
      destination: trip.destination,
      travelers: trip.travelers,
    });
  }, [trip]);

  const resetScenario = useCallback(() => {
    if (!trip) return;
    setScenarioBudget(trip.budgetAmount);
    setScenarioTravelers(trip.travelers);
    setScenarioDays(trip.itineraryDays?.length ?? 1);
    setSkipPaid(false);
  }, [trip]);

  const applyStrategy = async (strategy: FitStrategy) => {
    if (!trip) return;
    setApplying(true);
    try {
      const newDays: ApiItineraryDay[] = strategy.days.map((d, i) => {
        const existing = trip.itineraryDays?.[i];
        return {
          id: existing?.id ?? crypto.randomUUID(),
          tripId: trip.id,
          dayNumber: d.day,
          title: d.title,
          activities: d.activities,
          estimatedCost: d.estimatedCost,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      // Adjust end date if days shortened
      const start = new Date(trip.startDate);
      const newEnd = new Date(start);
      newEnd.setDate(start.getDate() + Math.max(0, strategy.days.length - 1));
      const endDate = newEnd.toISOString().split("T")[0];

      if (isGuest) {
        const updated = updateGuestTripPlan(trip.id, {
          budgetAmount: scenarioBudget ?? trip.budgetAmount,
          travelers: scenarioTravelers ?? trip.travelers,
          endDate,
          totalEstimated: strategy.totalEstimated,
          budgetBreakdown: strategy.budgetBreakdown,
          itineraryDays: newDays,
          tips: [
            ...(trip.tips ?? []),
            `Applied Make It Fit: ${strategy.label}`,
          ].slice(-8),
        });
        if (updated) {
          setTrip(updated);
          setInspiration(extractInspirationFromTrip(updated));
        }
      } else {
        // Auth: optimistic local update; persist via regenerate-style patch when API exists
        setTrip({
          ...trip,
          budgetAmount: scenarioBudget ?? trip.budgetAmount,
          travelers: scenarioTravelers ?? trip.travelers,
          endDate,
          totalEstimated: strategy.totalEstimated,
          budgetBreakdown: strategy.budgetBreakdown,
          itineraryDays: newDays,
        });
        await fetch(`/api/trips/${trip.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            budgetAmount: scenarioBudget ?? trip.budgetAmount,
            travelers: scenarioTravelers ?? trip.travelers,
            endDate,
            totalEstimated: strategy.totalEstimated,
            budgetBreakdown: strategy.budgetBreakdown,
            itineraryDays: newDays.map((d) => ({
              dayNumber: d.dayNumber,
              title: d.title,
              activities: d.activities,
              estimatedCost: d.estimatedCost,
            })),
          }),
        }).catch(() => {
          /* guest-like fallback already applied in UI */
        });
      }
      setTab("plan");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-muted">Loading your trip...</div>;
  }

  if (!trip) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">Trip not found</p>
        <Link href="/trips/new" className="mt-4 inline-block text-primary">
          Plan a new trip
        </Link>
      </div>
    );
  }

  const spent = trip.expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const budget = trip.totalEstimated ?? trip.budgetAmount;
  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const breakdown = trip.budgetBreakdown;
  const tips = trip.tips ?? [];

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "budget", label: "Budget", icon: PieChart },
    { id: "plan", label: "Plan", icon: Map },
    { id: "expenses", label: "Expenses", icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <TripHero destination={trip.destination} />

      {isGuest && (
        <div className="flex items-start gap-3 rounded-xl bg-primary/5 px-4 py-3 ring-1 ring-primary/15">
          <Cloud className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-semibold text-text">Saved on this device</p>
            <p className="text-muted">
              No account needed.{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>{" "}
              to sync trips across devices.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold">{trip.destination}</h1>
              <div className="mt-1 flex flex-wrap gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(trip.startDate).toLocaleDateString()} –{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {trip.travelers} travelers
                </span>
              </div>
            </div>
            {feasibility && (
              <div className="rounded-xl bg-white/15 px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                  Feasibility
                </p>
                <p className="font-display text-2xl font-bold">{feasibility.score}</p>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                {formatCurrency(spent)} spent of {formatCurrency(budget)}
              </span>
              <span>{pct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="hide-scrollbar flex gap-1 overflow-x-auto border-b border-border px-2 pt-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  if (t.id === "expenses") {
                    window.location.href = `/trips/${trip.id}/expenses`;
                    return;
                  }
                  setTab(t.id);
                }}
                className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-background text-primary"
                    : "text-muted hover:text-text"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "overview" && feasibility && scenarioBudget != null && scenarioTravelers != null && scenarioDays != null && (
        <FeasibilityOverview
          result={feasibility}
          scenarioBudget={scenarioBudget}
          scenarioTravelers={scenarioTravelers}
          scenarioDays={scenarioDays}
          maxDays={maxDays}
          skipPaidActivities={skipPaid}
          onBudgetChange={setScenarioBudget}
          onTravelersChange={setScenarioTravelers}
          onDaysChange={setScenarioDays}
          onSkipPaidChange={setSkipPaid}
          onResetScenario={resetScenario}
          strategies={strategies}
          onApplyStrategy={applyStrategy}
          applying={applying}
        />
      )}

      {tab === "budget" && (
        <div className="space-y-4">
          {tally && <BudgetTallyBar tally={tally} />}
          {feasibility && (
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-border">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">Budget confidence</h2>
                {realityCheck && <RealityCheckButton result={realityCheck} />}
              </div>
              <div className="space-y-2">
                {feasibility.categories.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center justify-between rounded-lg bg-background px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">{row.label}</p>
                      <p className="text-[11px] uppercase tracking-wide text-muted">
                        {row.confidence} confidence
                        {row.status !== "ok" ? ` · ${row.status}` : ""}
                      </p>
                    </div>
                    <p className="font-bold text-primary">{formatCurrency(row.projected)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted">
                Grand total {formatCurrency(feasibility.grandTotal)} vs budget{" "}
                {formatCurrency(feasibility.statedBudget)}
              </p>
            </div>
          )}

          <BudgetLifecyclePanel
            tripId={trip.id}
            breakdown={breakdown}
            overrides={costOverrides}
            onOverridesChange={setCostOverrides}
          />

          <BudgetAutopsyPanel
            plannedBreakdown={breakdown}
            totalEstimated={trip.totalEstimated}
            expenses={(trip.expenses ?? []).map((e) => ({
              amount: e.amount,
              category: e.category,
            }))}
            profile={costProfile}
            onProfileChange={setCostProfile}
          />
        </div>
      )}

      {tab === "plan" && (
        <div className="space-y-6">
          <InspirationBoard items={inspiration} />
          <TripSharePanel trip={trip} isGuest={isGuest} />
          <div>
            <h2 className="mb-4 text-lg font-bold">Day-by-day plan</h2>
            <div className="space-y-4">
              {trip.itineraryDays?.map((day) => {
                const activities = day.activities as Activity[];
                return (
                  <div
                    key={day.id}
                    className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border"
                  >
                    <div className="flex items-center justify-between border-b border-border bg-primary/5 px-5 py-3">
                      <div>
                        <span className="text-xs font-bold text-primary">
                          Day {day.dayNumber}
                        </span>
                        <h3 className="font-bold">{day.title}</h3>
                      </div>
                      <span className="font-bold text-primary">
                        {formatCurrency(day.estimatedCost)}
                      </span>
                    </div>
                    <div className="divide-y divide-border">
                      {activities.map((activity, i) => (
                        <div key={i} className="flex gap-4 px-5 py-3">
                          <span className="w-12 shrink-0 text-xs font-medium text-muted">
                            {activity.time}
                          </span>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{activity.title}</p>
                              {activity.source === "ai_pick" && (
                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted">{activity.description}</p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold">
                            {formatCurrency(activity.estimatedCost)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {tips.length > 0 && (
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-border">
              <h2 className="mb-3 flex items-center gap-2 font-bold">
                <Lightbulb className="h-5 w-5 text-warning" />
                Travel tips
              </h2>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted">
                    <span className="text-accent">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
