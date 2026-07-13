import type { Activity, TripStatus } from "@rynxpense/shared";

export type { TripStatus };

export interface RynxpenseProfile {
  id: string;
  project_id: string;
  email: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface DbTrip {
  id: string;
  project_id: string;
  owner_user_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_amount: number;
  currency: string;
  travelers: number;
  status: TripStatus;
  preferences: string | null;
  total_estimated: number | null;
  budget_breakdown: Record<string, number> | null;
  tips: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DbItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  title: string;
  activities: Activity[];
  estimated_cost: number;
  created_at: string;
  updated_at: string;
}

export interface DbExpense {
  id: string;
  trip_id: string;
  project_id: string;
  owner_user_id: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface DbShareLink {
  id: string;
  trip_id: string;
  slug: string;
  is_public: boolean;
  created_at: string;
}

export interface ApiTrip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  currency: string;
  travelers: number;
  status: TripStatus;
  preferences: string | null;
  totalEstimated: number | null;
  budgetBreakdown: Record<string, number> | null;
  tips: string[] | null;
  createdAt: string;
  updatedAt: string;
  itineraryDays?: ApiItineraryDay[];
  expenses?: ApiExpense[];
  shareLink?: ApiShareLink | null;
  _count?: { expenses: number };
}

export interface ApiItineraryDay {
  id: string;
  tripId: string;
  dayNumber: number;
  title: string;
  activities: Activity[];
  estimatedCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiExpense {
  id: string;
  tripId: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiShareLink {
  id: string;
  tripId: string;
  slug: string;
  isPublic: boolean;
  createdAt: string;
}

export interface SharedTrip extends ApiTrip {
  itineraryDays: ApiItineraryDay[];
  shareLink: ApiShareLink;
}
