/**
 * POST /api/drafts { email, draft } — park an anonymous visitor's in-progress CV for the moment they open the
 * emailed sign-in link. The link often opens in a different browser than the one they were editing in (typically
 * Gmail → Chrome, while the CV sits in Instagram's in-app browser), so the draft is handed over via the server,
 * keyed by email. Only the person who proves control of that email (by signing in) can claim it, once.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_BYTES = 300_000;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}$/;

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > MAX_BYTES * 1.2) return NextResponse.json({ error: "Too large." }, { status: 413 });
  let body: { email?: unknown; draft?: unknown };
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const draft = body.draft;
  if (!EMAIL.test(email) || !draft || typeof draft !== "object" || JSON.stringify(draft).length > MAX_BYTES) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  try {
    const db = createAdminClient();
    await db.from("cv_drafts").delete().lt("updated_at", new Date(Date.now() - 3 * 86400_000).toISOString());
    const { error } = await db.from("cv_drafts").upsert({ email, data: draft, updated_at: new Date().toISOString() }, { onConflict: "email" });
    if (error) throw error;
  } catch (err) {
    console.error("draft stash failed:", err);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
