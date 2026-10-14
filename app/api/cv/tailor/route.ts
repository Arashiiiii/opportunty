/**
 * POST /api/cv/tailor — the AI half of "drag a job onto your CV".
 *
 * Takes the visitor's current CV (uploaded, or blank) plus the job they
 * dropped, and asks Claude (cv/_lib/ai.ts) to rewrite the title, summary
 * and a highlighted-skills group for that pairing — everything else on
 * the CV is left untouched. Falls back to the deterministic tag-matching
 * in cv/_lib/tailor.ts if the AI call fails, so the flow never just
 * breaks.
 *
 * No auth required — this runs before the visitor has signed in.
 */
import { NextRequest, NextResponse } from "next/server";
import { CVDataSchema } from "@/app/cv/_lib/schema";
import { tailorCVForJob } from "@/app/cv/_lib/tailor";
import { tailorCVWithAI } from "@/app/cv/_lib/ai";
import type { TailorReport } from "@/app/cv/_lib/tailor-report";

// Best-effort daily cap per visitor (in-memory: resets on cold start). This route needs no login and costs money.
const DAILY_LIMIT = 15;
const hits = new Map<string, { day: string; n: number }>();
function overLimit(ip: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const h = hits.get(ip);
  if (!h || h.day !== day) { hits.set(ip, { day, n: 1 }); return false; }
  h.n += 1;
  return h.n > DAILY_LIMIT;
}

function heuristicReport(cv: { skills: { items: string[] }[] }, job: { title: string; company: string; tags: string[] }): TailorReport {
  const have = new Set(cv.skills.flatMap((g) => g.items.map((i) => i.toLowerCase().trim())));
  const matched = job.tags.filter((t) => have.has(t.toLowerCase().trim()));
  const missing = job.tags.filter((t) => !have.has(t.toLowerCase().trim()));
  return {
    score: job.tags.length ? Math.round((matched.length / job.tags.length) * 100) : 0,
    matched: matched.slice(0, 8), missing: missing.slice(0, 6),
    changes: [`Set the headline to ${job.title}`, "Added a summary line for this role", ...(missing.length ? ["Listed the job's skills as a separate group"] : [])],
    source: "heuristic", jobTitle: job.title, company: job.company,
  };
}

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { cv, job } = (body ?? {}) as { cv?: unknown; job?: unknown };
  const parsedCV = CVDataSchema.safeParse(cv);
  if (!parsedCV.success) {
    return NextResponse.json({ error: "Invalid CV data." }, { status: 400 });
  }
  const j = job as { title?: string; company?: string; location?: string; tags?: string[]; description?: string } | undefined;
  if (!j?.title || !j?.company || !Array.isArray(j.tags)) {
    return NextResponse.json({ error: "Invalid job data." }, { status: 400 });
  }
  const jobInput = {
    title: j.title,
    company: j.company,
    location: j.location,
    tags: j.tags,
    description: j.description ?? "",
  };

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (!overLimit(ip)) {
    try {
      const { cv: tailored, report } = await tailorCVWithAI(parsedCV.data, jobInput);
      return NextResponse.json({ cv: tailored, report, source: "ai" });
    } catch (err) {
      console.error("AI tailoring failed, falling back to heuristic tailoring:", err);
    }
  }
  const tailored = tailorCVForJob(parsedCV.data, jobInput);
  return NextResponse.json({ cv: tailored, report: heuristicReport(parsedCV.data, jobInput), source: "heuristic" });
}
