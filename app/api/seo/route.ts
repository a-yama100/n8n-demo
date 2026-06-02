import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { generateSeoPlan } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LEN = 160;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip).ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429 }
    );
  }

  let body: { topic?: string; audience?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const topic = (body.topic ?? "").trim();
  if (!topic) {
    return NextResponse.json(
      { error: "Please enter a topic or keyword." },
      { status: 400 }
    );
  }
  if (topic.length > MAX_LEN) {
    return NextResponse.json(
      { error: `Topic too long (max ${MAX_LEN} characters).` },
      { status: 400 }
    );
  }

  const result = generateSeoPlan({
    topic,
    audience:
      typeof body.audience === "string" ? body.audience.slice(0, 80) : undefined,
  });

  return NextResponse.json({ result });
}
