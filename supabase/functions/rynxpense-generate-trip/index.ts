// Supabase Edge Function: rynxpense-generate-trip
// Deploy: supabase functions deploy rynxpense-generate-trip --project-ref xkoyoleurdafejlyxpxk

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InspirationItem = {
  title: string;
  description?: string;
  category?: string;
  estimatedCost?: number;
  sourceUrl?: string;
  priority?: string;
};

type CreateTripInput = {
  destination: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  currency: string;
  travelers: number;
  preferences?: string;
  inspirationItems?: InspirationItem[];
};

type AITripPlan = {
  destination: string;
  days: Array<{
    day: number;
    title: string;
    activities: Array<{
      time: string;
      title: string;
      description: string;
      estimatedCost: number;
      category: "food" | "transport" | "activities" | "hotel" | "other";
      source?: "ai_pick" | "from_save";
    }>;
    estimatedCost: number;
  }>;
  budgetBreakdown: {
    flights: number;
    hotel: number;
    food: number;
    activities: number;
    transport: number;
    other?: number;
  };
  totalEstimated: number;
  tips: string[];
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });

function bearerToken(req: Request): string {
  const header = req.headers.get("Authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

function buildPrompt(input: CreateTripInput): string {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const dayCount = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  const inspoBlock =
    input.inspirationItems?.length ?
      `\nUser saved these places from TikTok, Instagram, Reddit, etc. — weave them into the itinerary:\n${input.inspirationItems
        .map(
          (item, i) =>
            `${i + 1}. [${item.priority ?? "maybe"}] ${item.title} (${item.category ?? "activity"})${item.description ? ` — ${item.description}` : ""}`,
        )
        .join("\n")}\n`
    : "";

  return `You are a travel planner and budget expert specializing in Filipino travelers departing from the Philippines.
Create a realistic ${dayCount}-day trip plan with NAMED venues (real restaurants, hotels, attractions).

Destination: ${input.destination}
Budget: ${input.currency} ${input.budgetAmount.toLocaleString()} total for ${input.travelers} traveler(s)
Dates: ${input.startDate} to ${input.endDate}
${input.preferences ? `Preferences: ${input.preferences}` : ""}${inspoBlock}

Rules:
- Use specific venue names, not generic labels
- Include stay recommendation with category "hotel"
- Price realistically in ${input.currency} from Manila (flights in budgetBreakdown)
- Mark user saves with source "from_save", others "ai_pick"

Respond ONLY with valid JSON:
{
  "destination": "${input.destination}",
  "days": [{"day": 1, "title": "Day theme", "activities": [{"time": "09:00", "title": "Venue name", "description": "Tip", "estimatedCost": 500, "category": "food|transport|activities|hotel|other", "source": "ai_pick|from_save"}], "estimatedCost": 8500}],
  "budgetBreakdown": {"flights": 0, "hotel": 0, "food": 0, "activities": 0, "transport": 0, "other": 0},
  "totalEstimated": ${input.budgetAmount},
  "tips": ["tip 1"]
}`;
}

async function callGroq(input: CreateTripInput): Promise<AITripPlan> {
  const key = Deno.env.get("RYNXPENSE_GROQ_API_KEY");
  if (!key) throw new Error("RYNXPENSE_GROQ_API_KEY not configured");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content:
            "You are a travel planning assistant for Filipino travelers. Always respond with valid JSON only, no markdown.",
        },
        { role: "user", content: buildPrompt(input) },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Groq HTTP ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");

  return JSON.parse(jsonMatch[0]) as AITripPlan;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const edgeSecret = Deno.env.get("RYNXPENSE_EDGE_SECRET") ?? "";
  const token = bearerToken(req);
  if (!edgeSecret || token !== edgeSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await req.json();
    const input = body as CreateTripInput;
    if (!input.destination || !input.startDate || !input.endDate || !input.budgetAmount) {
      return json({ error: "Invalid trip input" }, 400);
    }

    const plan = await callGroq(input);
    return json(plan);
  } catch (error) {
    console.error("rynxpense-generate-trip:", error);
    const message = error instanceof Error ? error.message : "Failed to generate trip";
    return json({ error: message }, 500);
  }
});
