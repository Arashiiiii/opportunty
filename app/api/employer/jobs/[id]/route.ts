/** PATCH /api/employer/jobs/[id] — an employer closes or reopens one of their own approved listings. */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentEmployer } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentEmployer();
  if (!user) return NextResponse.json({ error: "Sign in with an employer account." }, { status: 401 });
  const { id } = await ctx.params;
  let action = "";
  try { action = String((await req.json())?.action ?? ""); } catch { /* handled below */ }
  if (action !== "close" && action !== "reopen") return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const db = createAdminClient();
  const { data: job } = await db.from("jobs").select("id, moderation").eq("id", id).eq("employer_id", user.id).maybeSingle();
  if (!job) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (action === "reopen" && job.moderation !== "approved") return NextResponse.json({ error: "Only approved listings can be reopened." }, { status: 400 });
  const { error } = await db.from("jobs").update({ is_active: action === "reopen", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: "Could not update the listing." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
