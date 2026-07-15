"use client";

import type { CostLine, CostLineKey, TravelerCostProfile } from "@rynxpense/shared";

const linesKey = (tripId: string) => `rynxpense_cost_lines_${tripId}`;
const profileKey = "rynxpense_traveler_cost_profile";

export function loadCostLineOverrides(
  tripId: string,
): Partial<Record<CostLineKey, Partial<CostLine>>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(linesKey(tripId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCostLineOverrides(
  tripId: string,
  overrides: Partial<Record<CostLineKey, Partial<CostLine>>>,
) {
  localStorage.setItem(linesKey(tripId), JSON.stringify(overrides));
}

export function upsertCostLineOverride(
  tripId: string,
  key: CostLineKey,
  patch: Partial<CostLine>,
) {
  const all = loadCostLineOverrides(tripId);
  all[key] = { ...all[key], key, ...patch };
  saveCostLineOverrides(tripId, all);
  return all;
}

export function loadTravelerCostProfile(): TravelerCostProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(profileKey);
    return raw ? (JSON.parse(raw) as TravelerCostProfile) : null;
  } catch {
    return null;
  }
}

export function saveTravelerCostProfile(profile: TravelerCostProfile) {
  localStorage.setItem(profileKey, JSON.stringify(profile));
}
