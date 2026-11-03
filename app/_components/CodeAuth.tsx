"use client";
/**
 * Passwordless sign-in / sign-up: email → we mail a link with one button; pressing it (on our /auth/confirm page)
 * signs the person in. No code to type. If the visitor has an unfinished CV in this browser, it is parked on the
 * server first so it can follow them into whichever browser opens the link (see /api/drafts). Also offers
 * "Continue with Google" when enabled (NEXT_PUBLIC_GOOGLE_AUTH=1) — hidden in in-app webviews because Google
 * refuses OAuth there ("disallowed_useragent").
 */
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUI } from "@/app/_lib/useUiLang";
import { readLocalDraft } from "@/app/cv/_lib/local-draft";
import { cvHasContent } from "@/app/cv/_lib/handoff";
import { useTurnstile } from "./Turnstile";

type L = "en" | "fr" | "ar";
const T: Record<L, Record<string, string>> = {
  en: { cta: "Email me a sign-in link", ctaBusy: "Sending…", email: "Email", sentTitle: "Check your email", sent: "We sent a sign-in link to", sentHelp: "Open the email and press the button. It works on any device, and your CV will be waiting.", spam: "Not there? Check your spam folder.", resend: "Send a new link", resendIn: "Send a new link in", change: "Use another email", google: "Continue with Google", or: "or use a password", orG: "or", wait: "Please wait a minute before asking for another link.", fail: "We couldn't send the email. Please try again.", ok: "Signed in ✓ Redirecting…", verifying: "Verifying you are human… try again in a moment.", hint: "No password and no code — just a link in your inbox." },
  fr: { cta: "Recevoir un lien de connexion", ctaBusy: "Envoi…", email: "E-mail", sentTitle: "Vérifiez votre boîte mail", sent: "Nous avons envoyé un lien de connexion à", sentHelp: "Ouvrez l'e-mail et appuyez sur le bouton. Cela fonctionne sur n'importe quel appareil, et votre CV vous attendra.", spam: "Rien reçu ? Regardez dans vos spams.", resend: "Renvoyer un lien", resendIn: "Renvoyer un lien dans", change: "Utiliser un autre e-mail", google: "Continuer avec Google", or: "ou utilisez un mot de passe", orG: "ou", wait: "Patientez une minute avant de demander un autre lien.", fail: "L'e-mail n'a pas pu être envoyé. Réessayez.", ok: "Connecté ✓ Redirection…", verifying: "Vérification en cours… réessayez dans un instant.", hint: "Ni mot de passe ni code : juste un lien dans votre boîte mail." },
  ar: { cta: "أرسل لي رابط تسجيل الدخول", ctaBusy: "جارٍ الإرسال…", email: "البريد الإلكتروني", sentTitle: "تحقق من بريدك", sent: "أرسلنا رابط تسجيل الدخول إلى", sentHelp: "افتح الرسالة واضغط على الزر. يعمل على أي جهاز وستجد سيرتك الذاتية بانتظارك.", spam: "لم تصل؟ تحقق من البريد غير المرغوب.", resend: "إرسال رابط جديد", resendIn: "إرسال رابط جديد بعد", change: "استخدام بريد آخر", google: "المتابعة عبر Google", or: "أو استخدم كلمة مرور", orG: "أو", wait: "انتظر دقيقة قبل طلب رابط آخر.", fail: "تعذّر إرسال الرسالة. حاول مرة أخرى.", ok: "تم تسجيل الدخول ✓ جارٍ التحويل…", verifying: "جارٍ التحقق… حاول بعد لحظة.", hint: "دون كلمة مرور ودون رمز — فقط رابط في بريدك." },
};

const WEBVIEW = /Instagram|FBAN|FBAV|FB_IAB|Line\/|MicroMessenger|; wv\)/i;

export function CodeAuth({ next = "/dashboard", hideDivider = false }: { next?: string; hideDivider?: boolean }) {
  const { lang, rtl } = useUI();
  const t = T[lang];
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent">("email");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showGoogle, setShowGoogle] = useState(false);
  const cap = useTurnstile();

  useEffect(() => {
    setShowGoogle(process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1" && !WEBVIEW.test(navigator.userAgent));
  }, []);

  // Resend countdown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // If the link is opened in another tab of this same browser, this tab learns about the new session and moves on.
  useEffect(() => {
    if (step !== "sent") return;
    const { data } = createClient().auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN") return;
      setDone(true);
      if (next !== window.location.pathname) window.location.assign(next);
      else window.location.reload();
    });
    return () => data.subscription.unsubscribe();
  }, [step, next]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true); setError(null);
    const captchaToken = cap.enabled ? await cap.getToken() : null;
    if (cap.enabled && !captchaToken) { setBusy(false); setError(cap.failed ? `${t.fail} (check ${cap.errorCode ?? "?"})` : t.verifying); return; }
    const to = email.trim();
    // Park an unfinished CV on the server so it follows the person into the browser that opens the link.
    try {
      const d = readLocalDraft();
      if (d && cvHasContent(d.cv)) {
        await fetch("/api/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: to, draft: d }), signal: AbortSignal.timeout(5000) });
      }
    } catch { /* best effort: same-browser sign-in still has the local draft */ }
    const { error: err } = await createClient().auth.signInWithOtp({
      email: to,
      options: { shouldCreateUser: true, data: { lang }, captchaToken: captchaToken ?? undefined, emailRedirectTo: `${window.location.origin}${next}` },
    });
    setBusy(false);
    cap.reset();
    if (err) { setError(err.status === 429 || /rate|seconds|too many/i.test(err.message) ? t.wait : t.fail); return; }
    setStep("sent"); setCooldown(60);
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
          {cap.widget}
          <button type="submit" disabled={busy} style={primary}>{busy ? t.ctaBusy : t.cta}</button>
          <div style={{ fontSize: 12.5, color: "#5f7280" }}>{t.hint}</div>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }} role="status">
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0e1a21" }}>{done ? t.ok : t.sentTitle}</div>
          <div style={{ fontSize: 14, color: "#26343d", lineHeight: 1.5 }}>{t.sent} <b dir="ltr">{email}</b></div>
          <div style={{ fontSize: 14, color: "#26343d", lineHeight: 1.5 }}>{t.sentHelp}</div>
          <div style={{ fontSize: 12.5, color: "#5f7280" }}>{t.spam}</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={() => void send()} disabled={busy || cooldown > 0} style={{ ...link, opacity: busy || cooldown > 0 ? 0.55 : 1, cursor: busy || cooldown > 0 ? "default" : "pointer" }}>
              {cooldown > 0 ? `${t.resendIn} ${cooldown}s` : t.resend}
            </button>
            <button type="button" onClick={() => { setStep("email"); setError(null); }} style={link}>{t.change}</button>
          </div>
        </div>
      )}

      {!hideDivider && <div style={{ textAlign: "center", fontSize: 12.5, color: "#5f7280", margin: "6px 0 0" }}>— {t.or} —</div>}
    </div>
  );
}
