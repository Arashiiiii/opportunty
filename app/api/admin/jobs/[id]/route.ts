/** POST /api/admin/jobs/[id] — the site owner approves or rejects an employer's listing. */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser, isAdmin } from "@/lib/server-auth";
import { notify } from "@/lib/email/notify";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { id } = await ctx.params;
  let action = "";
  try { action = String((await req.json())?.action ?? ""); } catch { /* handled below */ }
  if (action !== "approve" && action !== "reject") return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const db = createAdminClient();
  const { data: job } = await db.from("jobs").select("id, title, employer_id").eq("id", id).not("employer_id", "is", null).maybeSingle();
  if (!job) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const approve = action === "approve";
  const { error } = await db.from("jobs").update({
    moderation: approve ? "approved" : "rejected", is_active: approve,
    ...(approve ? { created_at: new Date().toISOString() } : {}), updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return NextResponse.json({ error: "Could not update." }, { status: 500 });

  try {
    const { data: emp } = await db.auth.admin.getUserById(job.employer_id!);
    if (emp?.user?.email) await notify(emp.user.email,
      approve ? `Your job is live: ${job.title}` : `Your job was not approved: ${job.title}`,
      approve ? `"${job.title}" is now live on opportunty.com. Applications will appear in your dashboard:\nhttps://opportunty.com/dashboard/employer/applications`
              : `"${job.title}" was not approved. If you think this is a mistake, reply to this email or contact contact@contact.opportunty.com.`);
  } catch (err) { console.error("employer notification failed:", err); }
  return NextResponse.json({ ok: true });
}
