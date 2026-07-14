import Groq from "groq-sdk";
import {
  aiTripPlanSchema,
  buildTripPrompt,
  type AITripPlan,
  type CreateTripInputWithInspo,
} from "@rynxpense/shared";

function getGroqApiKey(): string | null {
  return process.env.RYNXPENSE_GROQ_API_KEY ?? process.env.GROQ_API_KEY ?? null;
}

function getGroqClient() {
  const apiKey = getGroqApiKey();
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

async function generateViaEdgeFunction(
  input: CreateTripInputWithInspo,
): Promise<AITripPlan | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const res = await fetch(`${url}/functions/v1/rynxpense-generate-trip`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("rynxpense-generate-trip edge function:", res.status, detail);
    return null;
  }

  const data = await res.json();
  if (data.error) {
    console.error("rynxpense-generate-trip edge function:", data.error);
    return null;
  }

  return aiTripPlanSchema.parse(data);
}

async function generateViaGroqSdk(input: CreateTripInputWithInspo): Promise<AITripPlan> {
  const groq = getGroqClient();
  if (!groq) throw new Error("Groq client not configured");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a travel planning assistant for Filipino travelers. Always respond with valid JSON only, no markdown. Use real venue names.",
      },
      { role: "user", content: buildTripPrompt(input) },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  const content = completion.choices[0]?.message?.content ?? "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return aiTripPlanSchema.parse(parsed);
}

export async function generateTripPlan(
  input: CreateTripInputWithInspo,
): Promise<AITripPlan> {
  if (getGroqApiKey()) {
    return generateViaGroqSdk(input);
  }

  const viaEdge = await generateViaEdgeFunction(input);
  if (viaEdge) return viaEdge;

  return getMockTripPlan(input);
}

function getMockTripPlan(input: CreateTripInputWithInspo): AITripPlan {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const dayCount = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
  const perDay = Math.floor(input.budgetAmount / dayCount);
  const saved = input.inspirationItems?.[0];

  const days = Array.from({ length: dayCount }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} in ${input.destination}`,
    activities: [
      {
        time: "08:00",
        title: saved && i === 0 ? saved.title : `${input.destination} Breakfast Spot`,
        description: saved?.description ?? "Local breakfast spot",
        estimatedCost: Math.floor(perDay * 0.1),
        category: "food" as const,
        source: saved && i === 0 ? ("from_save" as const) : ("ai_pick" as const),
      },
      {
        time: "10:00",
        title: `${input.destination} City Walk`,
        description: "Explore top attractions",
        estimatedCost: Math.floor(perDay * 0.25),
        category: "activities" as const,
        source: "ai_pick" as const,
      },
      {
        time: "13:00",
        title: "Local Restaurant",
        description: "Recommended dining",
        estimatedCost: Math.floor(perDay * 0.15),
        category: "food" as const,
        source: "ai_pick" as const,
      },
      {
        time: "19:00",
        title: i === 0 ? "Budget Hotel Check-in" : "Evening activity",
        description: i === 0 ? "Mid-range stay near city center" : "Night market or views",
        estimatedCost: Math.floor(perDay * (i === 0 ? 0.35 : 0.2)),
        category: (i === 0 ? "hotel" : "activities") as "hotel" | "activities",
        source: "ai_pick" as const,
      },
    ],
    estimatedCost: perDay,
  }));

  return {
    destination: input.destination,
    days,
    budgetBreakdown: {
      flights: Math.floor(input.budgetAmount * 0.3),
      hotel: Math.floor(input.budgetAmount * 0.25),
      food: Math.floor(input.budgetAmount * 0.2),
      activities: Math.floor(input.budgetAmount * 0.15),
      transport: Math.floor(input.budgetAmount * 0.08),
      other: Math.floor(input.budgetAmount * 0.02),
    },
    totalEstimated: input.budgetAmount,
    tips: [
      `Book accommodations early for ${input.destination}`,
      "Paste TikTok and IG saves into your inspo inbox before generating",
      "Use the reality check — viral budgets often skip flights",
    ],
  };
}
