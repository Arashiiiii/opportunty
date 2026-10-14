/**
 * POST /api/payments/checkout { cvId } — start a Dodo checkout for the
 * signed-in user's CV template and return the hosted checkout URL.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckout } from "@/lib/dodo";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { cvId } = (await req.json().catch(() => ({}))) as { cvId?: string };
  if (!cvId) return NextResponse.json({ error: "Missing cvId." }, { status: 400 });

  // RLS: only the owner can read this row.
  const { data: cv } = await supabase.from("cvs").select("id, template").eq("id", cvId).single();
  if (!cv) return NextResponse.json({ error: "CV not found." }, { status: 404 });

  const { data: owned } = await supabase.from("cv_template_purchases").select("id").eq("template_id", cv.template).maybeSingle();
  if (owned) return NextResponse.json({ alreadyPaid: true });

  const origin = req.nextUrl.origin;
  const back = `${origin}/cv/${cv.id}/checkout`;
  try {
    const session = await createCheckout({
      email: user.email,
      name: (user.user_metadata?.full_name as string | undefined) || undefined,
      returnUrl: back,
      cancelUrl: back,
      metadata: { user_id: user.id, template_id: cv.template, cv_id: cv.id },
    });
    if (!session.checkout_url) return NextResponse.json({ error: "No checkout URL." }, { status: 502 });
    return NextResponse.json({ url: session.checkout_url });
  } catch (err) {
    console.error("Dodo checkout failed:", err);
    return NextResponse.json({ error: "Payment provider unavailable." }, { status: 502 });
  }
}
