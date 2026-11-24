/** PATCH /api/applications/[id] — the employer who received an application updates its status. */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentEmployer } from "@/lib/server-auth";
import { APPLICATION_STATUSES } from "@/lib/employer-jobs";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentEmployer();
  if (!user) return NextResponse.json({ error: "Sign in with an employer account." }, { status: 401 });
  const { id } = await ctx.params;
  let status = "";
  try { status = String((await req.json())?.status ?? ""); } catch { /* handled below */ }
  if (!(APPLICATION_STATUSES as readonly string[]).includes(status)) return NextResponse.json({ error: "Bad status." }, { status: 400 });

  const { data, error } = await createAdminClient().from("applications")
    .update({ status, updated_at: new Date().toISOString() }).eq("id", id).eq("employer_id", user.id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "Could not update." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
