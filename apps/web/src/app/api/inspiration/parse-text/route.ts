import { NextResponse } from "next/server";
import { z } from "zod";
import Groq from "groq-sdk";

const schema = z.object({ text: z.string().min(3) });

function getGroqKey() {
  return process.env.RYNXPENSE_GROQ_API_KEY ?? null;
}

export async function POST(request: Request) {
  try {
    const { text } = schema.parse(await request.json());
    const key = getGroqKey();

    if (!key) {
      return NextResponse.json({
        title: text.slice(0, 80),
        description: text,
        category: "activity",
        estimatedCost: null,
      });
    }

    const groq = new Groq({ apiKey: key });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 512,
      messages: [
        {
          role: "system",
          content:
            "Extract a travel place from social media text. Respond JSON only: {\"title\":\"venue name\",\"description\":\"short note\",\"category\":\"food|stay|activity|transport|other\",\"estimatedCost\":number or null}",
        },
        { role: "user", content: text },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Parse failed");

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("parse-text:", error);
    return NextResponse.json({ error: "Failed to parse text" }, { status: 500 });
  }
}
