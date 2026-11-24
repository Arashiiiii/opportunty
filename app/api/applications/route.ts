/**
 * POST /api/applications — a job seeker applies to an employer-posted job with one of their saved CVs.
 * The CV is copied (snapshot) so the employer keeps seeing what was sent even if the candidate edits it later.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser } from "@/lib/server-auth";
import { isEmployer } from "@/app/employers/_role";
import { notify } from "@/lib/email/notify";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in to apply." }, { status: 401 });
  if (isEmployer(user)) return NextResponse.json({ error: "Employer accounts cannot apply to jobs." }, { status: 403 });

  let b: { jobId?: string; cvId?: string; message?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }
  const jobId = String(b.jobId ?? ""), cvId = String(b.cvId ?? "");
  const message = String(b.message ?? "").trim().slice(0, 2000);
  if (!jobId || !cvId) return NextResponse.json({ error: "Choose a CV to send." }, { status: 400 });

  const db = createAdminClient();
  const { data: job } = await db.from("jobs").select("id, title, company, employer_id, is_active").eq("id", jobId).maybeSingle();
  if (!job || !job.is_active || !job.employer_id) return NextResponse.json({ error: "This job is no longer accepting applications." }, { status: 404 });

  // Read the CV with the user's own session so Row Level Security guarantees it is theirs.
  const { data: cv } = await (await createClient()).from("cvs").select("name, data, template, accent, lang, section_order, sections_enabled").eq("id", cvId).maybeSingle();
  if (!cv) return NextResponse.json({ error: "CV not found." }, { status: 404 });

  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await db.from("applications").select("id", { count: "exact", head: true }).eq("candidate_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= 20) return NextResponse.json({ error: "Daily application limit reached." }, { status: 429 });

  const p = (cv.data as { profile?: { firstName?: string; lastName?: string; email?: string } })?.profile ?? {};
  const name = `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || user.email || "Candidate";
  const { data: app, error } = await db.from("applications").insert({
    job_id: job.id, candidate_id: user.id, employer_id: job.employer_id,
    candidate_name: name, candidate_email: p.email?.trim() || user.email, message: message || null,
    cv_name: cv.name,
    cv_snapshot: { cv: cv.data, template: cv.template, accent: cv.accent, lang: cv.lang, order: cv.section_order, enabled: cv.sections_enabled },
  }).select("id").single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "You already applied to this job." }, { status: 409 });
    console.error("application insert failed:", error);
    return NextResponse.json({ error: "Could not send your application." }, { status: 500 });
  }

  try {
    const { data: emp } = await db.auth.admin.getUserById(job.employer_id);
    if (emp?.user?.email) await notify(emp.user.email, `New application: ${name} — ${job.title}`,
      `${name} applied to "${job.title}".\n\nSee the application and update its status: https://opportunty.com/dashboard/employer/applications`);
  } catch (err) { console.error("employer notification failed:", err); }
  return NextResponse.json({ id: app.id });
}
