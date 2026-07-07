import Groq from "groq-sdk";
import {
  aiTripPlanSchema,
  type AITripPlan,
  type CreateTripInput,
} from "@rynxpense/shared";

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function buildPrompt(input: CreateTripInput): string {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const dayCount = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  return `You are a travel planner and budget expert specializing in Filipino travelers.
Create a realistic ${dayCount}-day trip plan.

Destination: ${input.destination}
Budget: ${input.currency} ${input.budgetAmount.toLocaleString()} total for ${input.travelers} traveler(s)
Dates: ${input.startDate} to ${input.endDate}
${input.preferences ? `Preferences: ${input.preferences}` : ""}

Respond ONLY with valid JSON matching this structure:
{
  "destination": "${input.destination}",
  "days": [
    {
      "day": 1,
      "title": "Day theme",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "description": "Brief description",
          "estimatedCost": 500,
          "category": "food|transport|activities|hotel|other"
        }
      ],
      "estimatedCost": 8500
    }
  ],
  "budgetBreakdown": {
    "flights": 0,
    "hotel": 0,
    "food": 0,
    "activities": 0,
    "transport": 0,
    "other": 0
  },
  "totalEstimated": ${input.budgetAmount},
  "tips": ["tip 1", "tip 2"]
}

Use realistic ${input.currency} prices. Keep totalEstimated close to but not exceeding the budget.
Include 3-5 activities per day with varied categories.`;
}

export async function generateTripPlan(input: CreateTripInput): Promise<AITripPlan> {
  const groq = getGroqClient();
  if (!groq) {
    return getMockTripPlan(input);
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a travel planning assistant. Always respond with valid JSON only, no markdown.",
      },
      { role: "user", content: buildPrompt(input) },
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

function getMockTripPlan(input: CreateTripInput): AITripPlan {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const dayCount = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
  const perDay = Math.floor(input.budgetAmount / dayCount);

  const days = Array.from({ length: dayCount }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} in ${input.destination}`,
    activities: [
      {
        time: "08:00",
        title: "Breakfast",
        description: "Local breakfast spot",
        estimatedCost: Math.floor(perDay * 0.1),
        category: "food" as const,
      },
      {
        time: "10:00",
        title: "Morning sightseeing",
        description: "Explore top attractions",
        estimatedCost: Math.floor(perDay * 0.25),
        category: "activities" as const,
      },
      {
        time: "13:00",
        title: "Lunch",
        description: "Recommended local restaurant",
        estimatedCost: Math.floor(perDay * 0.15),
        category: "food" as const,
      },
      {
        time: "15:00",
        title: "Afternoon activity",
        description: "Cultural experience or shopping",
        estimatedCost: Math.floor(perDay * 0.2),
        category: "activities" as const,
      },
      {
        time: "19:00",
        title: "Dinner",
        description: "Evening dining",
        estimatedCost: Math.floor(perDay * 0.15),
        category: "food" as const,
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
      "Use local transport to save on getting around",
      "Try street food for authentic and budget-friendly meals",
    ],
  };
}
