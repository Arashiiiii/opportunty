"use client";
/**
 * Landing page for the link in our auth emails. The one-time token is only used when the person presses the
 * button here — mail scanners and link previewers open links automatically, and would otherwise burn the token
 * (and the 6-digit code that shares it) before the person ever sees it.
 */
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "../../_components/LogoMark";
import { useUiLang } from "../../_lib/useUiLang";
import type { Lang } from "../../i18n";

const T: Record<Lang, { h: string; p: string; btn: string; busy: string; ok: string; bad: string }> = {
  en: { h: "One last step", p: "Press the button to finish and open your account.", btn: "Confirm and continue", busy: "Checking…", ok: "Done ✓ Redirecting…", bad: "This link was already used or has expired. Go to Sign in and request a new code." },
  fr: { h: "Dernière étape", p: "Appuyez sur le bouton pour terminer et ouvrir votre compte.", btn: "Confirmer et continuer", busy: "Vérification…", ok: "Terminé ✓ Redirection…", bad: "Ce lien a déjà été utilisé ou a expiré. Allez sur Connexion et demandez un nouveau code." },
  ar: { h: "خطوة أخيرة", p: "اضغط الزر لإكمال العملية وفتح حسابك.", btn: "تأكيد ومتابعة", busy: "جارٍ التحقق…", ok: "تم ✓ جارٍ التحويل…", bad: "تم استخدام هذا الرابط من قبل أو انتهت صلاحيته. اذهب إلى تسجيل الدخول واطلب رمزاً جديداً." },
};
const TYPES = ["signup", "magiclink", "recovery", "invite", "email_change"] as const;
type OtpType = (typeof TYPES)[number];

export default function ConfirmClient() {
  const [lang] = useUiLang();
  const t = T[lang];
  const sp = useSearchParams();
  const [state, setState] = useState<"idle" | "busy" | "ok" | "bad">("idle");

  const tokenHash = sp.get("token_hash") ?? "";
  const type = (TYPES as readonly string[]).includes(sp.get("type") ?? "") ? (sp.get("type") as OtpType) : null;
  const rawNext = sp.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  async function go() {
    if (!tokenHash || !type) { setState("bad"); return; }
    setState("busy");
    const { error } = await createClient().auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) { setState("bad"); return; }
    setState("ok");
    window.location.assign(next);
  }

  return (
    <main dir={lang === "ar" ? "rtl" : "ltr"} style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#f3f2ed", padding: 20, fontFamily: "'Inter Variable', Inter, system-ui, sans-serif", color: "#0e1a21" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", border: "1px solid #e3e8eb", borderRadius: 16, padding: 28, boxShadow: "0 18px 50px rgba(16,25,31,.08)", display: "flex", flexDirection: "column", gap: 16, textAlign: "center", alignItems: "center" }}>
        <LogoMark size={44} />
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{t.h}</h1>
        <p style={{ margin: 0, color: "#26343d", fontSize: 16, lineHeight: 1.5 }}>{t.p}</p>
        {state === "bad" && <div role="alert" style={{ color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 12px", fontSize: 14.5 }}>{t.bad}</div>}
        <button type="button" onClick={go} disabled={state === "busy" || state === "ok"}
          style={{ width: "100%", padding: "15px 20px", fontSize: 17, fontWeight: 700, fontFamily: "inherit", color: "#fff", background: "#0079a8", border: "none", borderRadius: 12, cursor: "pointer" }}>
          {state === "ok" ? t.ok : state === "busy" ? t.busy : t.btn}
        </button>
      </div>
    </main>
  );
}
