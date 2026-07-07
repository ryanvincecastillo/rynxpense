const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export async function fetchTrips() {
  const res = await fetch(`${API_URL}/api/trips`);
  if (!res.ok) return [];
  return res.json();
}

export async function generateTrip(data: {
  destination: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  travelers: number;
  preferences?: string;
}) {
  const res = await fetch(`${API_URL}/api/trips/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, currency: "PHP" }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to generate trip");
  }
  return res.json();
}

export async function fetchTrip(id: string) {
  const res = await fetch(`${API_URL}/api/trips/${id}`);
  if (!res.ok) throw new Error("Trip not found");
  return res.json();
}
