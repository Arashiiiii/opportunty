"use client";
/**
 * Passwordless sign-in / sign-up: email → one-time code typed into the page.
 * The visitor never leaves the tab, which matters inside Instagram/Facebook's
 * in-app browser where opening a mailed link loses the session. Also offers
 * "Continue with Google" when enabled (NEXT_PUBLIC_GOOGLE_AUTH=1) — hidden in
 * in-app webviews because Google refuses OAuth there ("disallowed_useragent").
 */
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUI } from "@/app/_lib/useUiLang";
import { EMP } from "@/app/employers/_dict";
import { isEmployer } from "@/app/employers/_role";

type L = "en" | "fr" | "ar";
const T: Record<L, Record<string, string>> = {
  en: { cta: "Continue with email code", ctaBusy: "Sending…", email: "Email", code: "Code from your email", verify: "Confirm", verifying: "Checking…", ok: "Signed in ✓ Redirecting…", sent: "We sent a code to", resend: "Send a new code", change: "Use another email", google: "Continue with Google", or: "or use a password", orG: "or", bad: "That code is wrong or expired.", hint: "No password needed. Check your inbox (and spam)." },
  fr: { cta: "Continuer avec un code par e-mail", ctaBusy: "Envoi…", email: "E-mail", code: "Code reçu par e-mail", verify: "Confirmer", verifying: "Vérification…", ok: "Connecté ✓ Redirection…", sent: "Nous avons envoyé un code à", resend: "Renvoyer un code", change: "Utiliser un autre e-mail", google: "Continuer avec Google", or: "ou utilisez un mot de passe", orG: "ou", bad: "Code incorrect ou expiré.", hint: "Aucun mot de passe. Vérifiez votre boîte mail (et les spams)." },
  ar: { cta: "المتابعة برمز عبر البريد", ctaBusy: "جارٍ الإرسال…", email: "البريد الإلكتروني", code: "الرمز المُرسل إلى بريدك", verify: "تأكيد", verifying: "جارٍ التحقق…", ok: "تم تسجيل الدخول ✓ جارٍ التحويل…", sent: "أرسلنا رمزاً إلى", resend: "إرسال رمز جديد", change: "استخدام بريد آخر", google: "المتابعة عبر Google", or: "أو استخدم كلمة مرور", orG: "أو", bad: "الرمز غير صحيح أو منتهي.", hint: "دون كلمة مرور. تحقق من بريدك (والرسائل غير المرغوبة)." },
};

const WEBVIEW = /Instagram|FBAN|FBAV|FB_IAB|Line\/|MicroMessenger|; wv\)/i;

export function CodeAuth({ next = "/dashboard", hideDivider = false }: { next?: string; hideDivider?: boolean }) {
  const { lang, rtl } = useUI();
  const t = T[lang];
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoogle, setShowGoogle] = useState(false);

  useEffect(() => {
    setShowGoogle(process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1" && !WEBVIEW.test(navigator.userAgent));
  }, []);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true); setError(null);
    const { error: err } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, data: { lang }, emailRedirectTo: `${window.location.origin}${next}` },
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setStep("code"); setCode("");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (err || !data.user) { setBusy(false); setError(t.bad); return; }
    if (isEmployer(data.user)) {
      await supabase.auth.signOut();
      setBusy(false); setError(EMP[lang].employerAccount); return;
    }
    // Signed in: show it, un-stick the button, and navigate with a full page load so the new session cookie is
    // always picked up (a soft router.push could hang on "Checking…" and leave the visitor stranded).
    setBusy(false); setDone(true);
    if (next !== window.location.pathname) window.location.assign(next);
    else window.location.reload(); // same page (sign-in popup): reload; the CV draft is kept on the device
  };

  const google = async () => {
    setError(null);
    const { error: err } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}${next}` } });
    if (err) setError(err.message);
  };

  const input: React.CSSProperties = { padding: "12px 14px", borderRadius: 10, border: "1px solid #e3e8eb", fontSize: 16, fontFamily: "inherit", width: "100%", boxSizing: "border-box" };
  const primary: React.CSSProperties = { padding: "12px 14px", borderRadius: 10, border: "none", background: "#0079a8", color: "#fff", fontSize: 15, fontWeight: 700, cursor: busy ? "wait" : "pointer", fontFamily: "inherit", opacity: busy ? 0.7 : 1, width: "100%" };
  const link: React.CSSProperties = { background: "none", border: "none", padding: 0, color: "#0079a8", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" };

  return (
    <div dir={rtl ? "rtl" : "ltr"} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 6 }}>
      {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13 }}>⚠ {error}</div>}

      {showGoogle && (
        <>
          <button type="button" onClick={google} style={{ ...primary, background: "#fff", color: "#0e1a21", border: "1px solid #d9d2c6", opacity: 1, cursor: "pointer" }}>
            <span aria-hidden style={{ marginInlineEnd: 8, fontWeight: 800, color: "#4285f4" }}>G</span>{t.google}
          </button>
          <div style={{ textAlign: "center", fontSize: 12.5, color: "#5f7280" }}>{t.orG}</div>
        </>
      )}

      {step === "email" ? (
        <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input type="email" required autoComplete="email" inputMode="email" placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
          <button type="submit" disabled={busy} style={primary}>{busy ? t.ctaBusy : t.cta}</button>
          <div style={{ fontSize: 12.5, color: "#5f7280" }}>{t.hint}</div>
        </form>
      ) : (
        <form onSubmit={verify} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13.5, color: "#26343d" }}>{t.sent} <b dir="ltr">{email}</b></div>
          <input type="text" required autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" maxLength={8} placeholder={t.code} value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            style={{ ...input, textAlign: "center", letterSpacing: "0.3em", fontSize: 22, fontWeight: 700 }} dir="ltr" />
          <button type="submit" disabled={busy || done || code.length < 6} style={primary}>{done ? t.ok : busy ? t.verifying : t.verify}</button>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <button type="button" onClick={() => void send()} disabled={busy} style={link}>{t.resend}</button>
            <button type="button" onClick={() => { setStep("email"); setError(null); }} style={link}>{t.change}</button>
          </div>
        </form>
      )}

      {!hideDivider && <div style={{ textAlign: "center", fontSize: 12.5, color: "#5f7280", margin: "6px 0 0" }}>— {t.or} —</div>}
    </div>
  );
}
