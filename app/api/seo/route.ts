import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { generateSeoPlan } from "@/lib/seo";
import { API_ERRORS, asLang } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LEN = 160;

// 言語は ?lang=ja|en で受け取る（日本語のページは ja。省略時は英語）
export async function POST(req: NextRequest) {
  const lang = asLang(req.nextUrl.searchParams.get("lang"));
  const err = API_ERRORS[lang];
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip).ok) {
    return NextResponse.json({ error: err.tooMany }, { status: 429 });
  }

  let body: { topic?: string; audience?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: err.invalid }, { status: 400 });
  }

  // 文字列以外（配列・オブジェクト）は受け付けない。
  if (!body || typeof body !== "object" || (body.topic !== undefined && typeof body.topic !== "string")) {
    return NextResponse.json({ error: err.invalid }, { status: 400 });
  }
  const topic = (body.topic ?? "").trim();
  if (!topic) {
    return NextResponse.json({ error: err.emptyTopic }, { status: 400 });
  }
  if (topic.length > MAX_LEN) {
    return NextResponse.json({ error: err.longTopic(MAX_LEN) }, { status: 400 });
  }

  const result = generateSeoPlan(
    {
      topic,
      audience:
        typeof body.audience === "string" ? body.audience.slice(0, 80) : undefined,
    },
    lang
  );

  return NextResponse.json({ result });
}
