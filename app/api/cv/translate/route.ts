/**
 * POST /api/cv/translate — rewrite the CV's text in another language
 * (fr / en / ar) with Claude. Names, companies, dates and contact details
 * are left alone. Used by the builder's language switch.
 */
import { NextRequest, NextResponse } from "next/server";
import { CVDataSchema } from "@/app/cv/_lib/schema";
import { translateCVWithAI } from "@/app/cv/_lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

// Best-effort daily cap per visitor (in-memory; this route needs no login and costs money).
const DAILY_LIMIT = 30;
const hits = new Map<string, { day: string; n: number }>();
function overLimit(ip: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const h = hits.get(ip);
  if (!h || h.day !== day) { hits.set(ip, { day, n: 1 }); return false; }
  h.n += 1;
  return h.n > DAILY_LIMIT;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const { cv, target } = (body ?? {}) as { cv?: unknown; target?: string };
  const parsed = CVDataSchema.safeParse(cv);
  if (!parsed.success) return NextResponse.json({ error: "Invalid CV data." }, { status: 400 });
  if (target !== "fr" && target !== "en" && target !== "ar") return NextResponse.json({ error: "Invalid language." }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (overLimit(ip)) return NextResponse.json({ error: "Daily translation limit reached." }, { status: 429 });

  try {
    return NextResponse.json({ cv: await translateCVWithAI(parsed.data, target) });
  } catch (err) {
    console.error("CV translation failed:", err);
    return NextResponse.json({ error: "Translation failed." }, { status: 502 });
  }
}
