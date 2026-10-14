/**
 * Dodo Payments — tiny server-side client (no SDK needed for three calls).
 *
 * Env:
 *   DODO_PAYMENTS_API_KEY          required
 *   DODO_PAYMENTS_ENVIRONMENT      "test_mode" | "live_mode" (default live_mode)
 *   DODO_PAYMENTS_WEBHOOK_KEY      webhook signing secret (whsec_…), needed by /api/payments/webhook
 *   DODO_PRODUCT_ID                optional override of the default product below
 *   SUPABASE_SERVICE_ROLE_KEY      required to record purchases
 */
import crypto from "node:crypto";

export const DODO_PRODUCT_ID = process.env.DODO_PRODUCT_ID || "pdt_0NpjAxauRZTmbGDGkwIS6";

export function dodoBase(): string {
  return process.env.DODO_PAYMENTS_ENVIRONMENT === "test_mode" ? "https://test.dodopayments.com" : "https://live.dodopayments.com";
}

async function dodo<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) throw new Error("DODO_PAYMENTS_API_KEY is not set");
  const res = await fetch(dodoBase() + path, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Dodo ${path} → ${res.status} ${(await res.text()).slice(0, 300)}`);
  return res.json() as Promise<T>;
}

export function createCheckout(input: {
  email: string; name?: string; returnUrl: string; cancelUrl: string; metadata: Record<string, string>;
}) {
  return dodo<{ session_id: string; checkout_url: string | null }>("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      product_cart: [{ product_id: DODO_PRODUCT_ID, quantity: 1 }],
      customer: { email: input.email, ...(input.name ? { name: input.name } : {}) },
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
      metadata: input.metadata,
    }),
  });
}

export type DodoPayment = {
  payment_id: string;
  status: string | null;
  metadata?: Record<string, unknown> | null;
  product_cart?: { product_id: string; quantity: number }[] | null;
  customer?: { email?: string } | null;
};

export function getPayment(paymentId: string) {
  return dodo<DodoPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

/** Standard Webhooks verification (HMAC-SHA256 over `${id}.${ts}.${rawBody}`). */
export function verifyWebhook(rawBody: string, h: { id: string | null; ts: string | null; sig: string | null }): boolean {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!secret || !h.id || !h.ts || !h.sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(h.ts)) > 300) return false;
  const key = Buffer.from(secret.startsWith("whsec_") ? secret.slice(6) : secret, "base64");
  const expected = crypto.createHmac("sha256", key).update(`${h.id}.${h.ts}.${rawBody}`).digest();
  return h.sig.split(" ").some((part) => {
    const [v, sig] = part.split(",");
    if (v !== "v1" || !sig) return false;
    const got = Buffer.from(sig, "base64");
    return got.length === expected.length && crypto.timingSafeEqual(got, expected);
  });
}
