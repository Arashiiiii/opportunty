/**
 * POST /api/employer/jobs — an employer submits a listing. It is stored inactive and "pending": nothing is public
 * until the site owner approves it (see /admin/jobs).
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentEmployer } from "@/lib/server-auth";
import { parseJobInput } from "@/lib/employer-jobs";
import { notify } from "@/lib/email/notify";
import { COMPANY } from "@/app/_lib/company";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await currentEmployer();
  if (!user) return NextResponse.json({ error: "Sign in with an employer account." }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }
  const parsed = parseJobInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const v = parsed.value;

  const db = createAdminClient();
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const [{ count: pending }, { count: today }] = await Promise.all([
    db.from("jobs").select("id", { count: "exact", head: true }).eq("employer_id", user.id).eq("moderation", "pending"),
    db.from("jobs").select("id", { count: "exact", head: true }).eq("employer_id", user.id).gte("created_at", since),
  ]);
  if ((pending ?? 0) >= 5) return NextResponse.json({ error: "You already have 5 listings waiting for approval. We will review them shortly." }, { status: 429 });
  if ((today ?? 0) >= 10) return NextResponse.json({ error: "Daily limit reached. Try again tomorrow." }, { status: 429 });

  const company = v.company || String(user.user_metadata?.company_name ?? "").trim() || "Company";
  const { data, error } = await db.from("jobs").insert({
    title: v.title, company, location: v.location, Country: v.country, job_type: v.job_type,
    salary_range: v.salary_range ?? null, description: v.description, tags: v.tags,
    external_url: v.apply_url ?? null, source: "employer",
    employer_id: user.id, moderation: "pending", is_active: false,
  }).select("id").single();
  if (error || !data) { console.error("employer job insert failed:", error); return NextResponse.json({ error: "Could not save the listing." }, { status: 500 }); }

  await notify(COMPANY.contactEmail, `New job awaiting approval: ${v.title} (${company})`,
    `${company} posted "${v.title}" in ${v.location}.\n\nReview it: https://opportunty.com/admin/jobs`);
  return NextResponse.json({ id: data.id, status: "pending" });
}
