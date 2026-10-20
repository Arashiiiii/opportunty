/**
 * POST /api/auth/send-email — Supabase "Send Email" auth hook.
 *
 * Supabase calls this instead of its built-in mailer; we verify the
 * Standard Webhooks signature, build the verification link, and send a
 * branded, localised email through Resend.
 *
 * Env: SEND_EMAIL_HOOK_SECRET ("v1,whsec_…" from the Supabase hook screen),
 *      RESEND_API_KEY, RESEND_FROM (e.g. "opportunity. <no-reply@contact.opportunty.com>"),
 *      NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SITE_URL (optional).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { pickLang, renderAuthEmail, type AuthEmailType } from "@/lib/email/auth-email";

export const runtime = "nodejs";

const TYPES = new Set<AuthEmailType>(["signup", "recovery", "magiclink", "invite", "email_change", "reauthentication"]);

function verify(body: string, headers: Headers, secretRaw: string): boolean {
  const id = headers.get("webhook-id");
  const ts = headers.get("webhook-timestamp");
  const sigHeader = headers.get("webhook-signature");
  if (!id || !ts || !sigHeader) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false; // replay window
  const key = Buffer.from(secretRaw.replace(/^v1,whsec_/, "").replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest();
  return sigHeader.split(" ").some((part) => {
    const [ver, sig] = part.split(",");
    if (ver !== "v1" || !sig) return false;
    const got = Buffer.from(sig, "base64");
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

const fail = (status: number, message: string) =>
  NextResponse.json({ error: { http_code: status, message } }, { status });

export async function POST(req: NextRequest) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;
  const resendKey = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!secret || !resendKey || !supabaseUrl) return fail(500, "Email hook is not configured");

  const raw = await req.text();
  if (!verify(raw, req.headers, secret)) return fail(401, "Invalid signature");

  let payload: {
    user?: { email?: string; new_email?: string; user_metadata?: { lang?: string } };
    email_data?: { token?: string; token_hash?: string; redirect_to?: string; email_action_type?: string; site_url?: string };
  };
  try { payload = JSON.parse(raw); } catch { return fail(400, "Bad payload"); }

  const user = payload.user;
  const data = payload.email_data;
  const type = data?.email_action_type as AuthEmailType | undefined;
  if (!user?.email || !data || !type || !TYPES.has(type)) return fail(400, "Unsupported email type");

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://opportunty.com").replace(/\/$/, "");
  // The link goes to OUR confirm page (the token is only spent when the person presses its button), not straight to
  // Supabase's /verify — mail scanners auto-open links, and that would use up the token and the 6-digit code with it.
  let nextPath = "/dashboard";
  try {
    const u = new URL(data.redirect_to || `${siteUrl}/dashboard`);
    if (u.origin === new URL(siteUrl).origin) nextPath = `${u.pathname}${u.search}`;
  } catch { /* keep default */ }
  const link = type === "reauthentication" || !data.token_hash ? undefined
    : `${siteUrl.replace(/\/$/, "")}/auth/confirm?token_hash=${encodeURIComponent(data.token_hash)}&type=${encodeURIComponent(type)}&next=${encodeURIComponent(nextPath)}`;

  const mail = renderAuthEmail({ type, lang: pickLang(user.user_metadata?.lang), link, code: data.token, siteUrl });
  const to = type === "email_change" && user.new_email ? user.new_email : user.email;

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "opportunity. <no-reply@contact.opportunty.com>",
      to: [to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
  });
  } catch (err) {
    console.error("Resend unreachable:", err);
    return fail(502, "Could not send email");
  }
  if (!res.ok) {
    console.error("Resend rejected auth email:", res.status, await res.text().catch(() => ""));
    return fail(502, "Could not send email");
  }
  return NextResponse.json({});
}
