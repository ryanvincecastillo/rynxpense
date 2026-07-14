import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ url: z.string().url() });

function extractMeta(html: string) {
  const pick = (prop: string) => {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      "i",
    );
    const m = html.match(re);
    if (m) return m[1];
    const re2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
      "i",
    );
    return re2.exec(html)?.[1];
  };

  const title =
    pick("og:title") ??
    pick("twitter:title") ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

  const description = pick("og:description") ?? pick("description");
  const imageUrl = pick("og:image") ?? pick("twitter:image");

  return { title, description, imageUrl };
}

export async function POST(request: Request) {
  try {
    const { url } = schema.parse(await request.json());

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RynxpenseBot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const host = new URL(url).hostname;
      return NextResponse.json(
        { title: host, description: url, sourceUrl: url },
        { status: 200 },
      );
    }

    const html = await res.text();
    const meta = extractMeta(html);

    return NextResponse.json({
      title: meta.title ?? new URL(url).hostname,
      description: meta.description ?? "",
      imageUrl: meta.imageUrl ?? null,
      sourceUrl: url,
    });
  } catch (error) {
    console.error("preview-link:", error);
    return NextResponse.json({ error: "Failed to preview link" }, { status: 400 });
  }
}
