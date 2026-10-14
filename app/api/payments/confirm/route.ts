/**
 * POST /api/payments/confirm { paymentId } — called when the customer lands
 * back from Dodo. Re-reads the payment from Dodo (never trusts the browser)
 * and unlocks the template if it succeeded and belongs to this user.
 * The webhook does the same thing as a backup.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DODO_PRODUCT_ID, getPayment } from "@/lib/dodo";
import { recordPurchase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { paymentId } = (await req.json().catch(() => ({}))) as { paymentId?: string };
  if (!paymentId) return NextResponse.json({ error: "Missing paymentId." }, { status: 400 });

  try {
    const p = await getPayment(paymentId);
    const meta = p.metadata ?? {};
    const paidProduct = (p.product_cart ?? []).some((i) => i.product_id === DODO_PRODUCT_ID);
    if (p.status !== "succeeded") return NextResponse.json({ paid: false, status: p.status });
    if (meta.user_id !== user.id || !paidProduct || typeof meta.template_id !== "string") {
      return NextResponse.json({ error: "Payment does not match this account." }, { status: 403 });
    }
    await recordPurchase(user.id, meta.template_id, p.payment_id);
    return NextResponse.json({ paid: true });
  } catch (err) {
    console.error("Payment confirm failed:", err);
    return NextResponse.json({ error: "Could not verify payment." }, { status: 502 });
  }
}
