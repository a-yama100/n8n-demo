import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { classifyIntake } from "@/lib/intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LEN = 1200;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip).ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429 }
    );
  }

  let body: { name?: string; company?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json(
      { error: "Please enter a message to process." },
      { status: 400 }
    );
  }
  if (message.length > MAX_LEN) {
    return NextResponse.json(
      { error: `Message too long (max ${MAX_LEN} characters).` },
      { status: 400 }
    );
  }

  const result = classifyIntake({
    name: typeof body.name === "string" ? body.name.slice(0, 120) : undefined,
    company: typeof body.company === "string" ? body.company.slice(0, 120) : undefined,
    email: typeof body.email === "string" ? body.email.slice(0, 160) : undefined,
    message,
  });

  return NextResponse.json({ result });
}
