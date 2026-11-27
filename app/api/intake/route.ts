import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { classifyIntake } from "@/lib/intake";
import { API_ERRORS, asLang } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LEN = 1200;

// 言語は ?lang=ja|en で受け取る（日本語のページは ja。省略時は英語）
export async function POST(req: NextRequest) {
  const lang = asLang(req.nextUrl.searchParams.get("lang"));
  const err = API_ERRORS[lang];
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip).ok) {
    return NextResponse.json({ error: err.tooMany }, { status: 429 });
  }

  let body: { name?: string; company?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: err.invalid }, { status: 400 });
  }

  // 文字列以外（配列・オブジェクト）は受け付けない。
  if (!body || typeof body !== "object" || (body.message !== undefined && typeof body.message !== "string")) {
    return NextResponse.json({ error: err.invalid }, { status: 400 });
  }
  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: err.emptyMessage }, { status: 400 });
  }
  if (message.length > MAX_LEN) {
    return NextResponse.json({ error: err.longMessage(MAX_LEN) }, { status: 400 });
  }

  const result = classifyIntake(
    {
      name: typeof body.name === "string" ? body.name.slice(0, 120) : undefined,
      company: typeof body.company === "string" ? body.company.slice(0, 120) : undefined,
      email: typeof body.email === "string" ? body.email.slice(0, 160) : undefined,
      message,
    },
    lang
  );

  return NextResponse.json({ result });
}
