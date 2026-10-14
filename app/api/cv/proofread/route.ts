/**
 * POST /api/cv/proofread — fix grammar, spelling and punctuation of the CV's
 * text with Claude, in the CV's own language. Used by the builder's
 * "Fix grammar" button.
 */
import { NextRequest, NextResponse } from "next/server";
import { CVDataSchema } from "@/app/cv/_lib/schema";
import { proofreadCVWithAI } from "@/app/cv/_lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

// Best-effort daily cap per visitor (in-memory; this route costs money).
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

  const parsed = CVDataSchema.safeParse((body as { cv?: unknown } | null)?.cv);
  if (!parsed.success) return NextResponse.json({ error: "Invalid CV data." }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (overLimit(ip)) return NextResponse.json({ error: "Daily limit reached." }, { status: 429 });

  try {
    return NextResponse.json(await proofreadCVWithAI(parsed.data));
  } catch (err) {
    console.error("CV proofread failed:", err);
    return NextResponse.json({ error: "Proofreading failed." }, { status: 502 });
  }
}
