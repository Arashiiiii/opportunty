/**
 * POST /api/drafts/claim — the signed-in user collects the draft parked for their email (see /api/drafts).
 * Single use: the row is deleted as it is returned. Returns { draft: null } when there is nothing to claim.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const email = user.email.toLowerCase();
  try {
    const db = createAdminClient();
    const { data } = await db.from("cv_drafts").select("data, updated_at").eq("email", email).maybeSingle();
    if (!data) return NextResponse.json({ draft: null });
    await db.from("cv_drafts").delete().eq("email", email);
    if (Date.now() - new Date(data.updated_at).getTime() > 2 * 86400_000) return NextResponse.json({ draft: null });
    return NextResponse.json({ draft: data.data });
  } catch (err) {
    console.error("draft claim failed:", err);
    return NextResponse.json({ draft: null });
  }
}
