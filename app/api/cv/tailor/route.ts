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

  try {
    const tailored = await tailorCVWithAI(parsedCV.data, jobInput);
    return NextResponse.json({ cv: tailored, source: "ai" });
  } catch (err) {
    console.error("AI tailoring failed, falling back to heuristic tailoring:", err);
    const tailored = tailorCVForJob(parsedCV.data, jobInput);
    return NextResponse.json({ cv: tailored, source: "heuristic" });
  }
}
