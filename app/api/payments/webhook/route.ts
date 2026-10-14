/**
 * POST /api/payments/webhook — Dodo Payments webhook (event: payment.succeeded).
 * Add https://<your-domain>/api/payments/webhook in the Dodo dashboard and put
 * its signing secret in DODO_PAYMENTS_WEBHOOK_KEY.
 */
import { NextRequest, NextResponse } from "next/server";
import { DODO_PRODUCT_ID, verifyWebhook } from "@/lib/dodo";
import { recordPurchase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const ok = verifyWebhook(raw, {
    id: req.headers.get("webhook-id"),
    ts: req.headers.get("webhook-timestamp"),
    sig: req.headers.get("webhook-signature"),
  });
  if (!ok) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });

  let evt: { type?: string; data?: { payment_id?: string; metadata?: Record<string, unknown>; product_cart?: { product_id: string }[] } };
  try { evt = JSON.parse(raw); } catch { return NextResponse.json({ error: "Bad JSON." }, { status: 400 }); }

  if (evt.type === "payment.succeeded" && evt.data) {
    const m = evt.data.metadata ?? {};
    const rightProduct = !evt.data.product_cart || evt.data.product_cart.some((i) => i.product_id === DODO_PRODUCT_ID);
    if (rightProduct && typeof m.user_id === "string" && typeof m.template_id === "string" && evt.data.payment_id) {
      try { await recordPurchase(m.user_id, m.template_id, evt.data.payment_id); }
      catch (err) { console.error("Webhook purchase failed:", err); return NextResponse.json({ error: "Store failed." }, { status: 500 }); }
    }
  }
  return NextResponse.json({ received: true });
}
