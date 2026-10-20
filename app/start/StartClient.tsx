"use client";
/** Single-purpose landing page for Instagram traffic: one button, upload a CV, land in the builder. */
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark } from "../_components/LogoMark";
import { UiLangSwitch } from "../_components/UiLangSwitch";
import { useUiLang } from "../_lib/useUiLang";
import { useCVStore } from "../cv/_store/cv-store";
import { saveLocalDraft } from "../cv/_lib/local-draft";
import { markHandoff } from "../cv/_lib/handoff";
import type { CVData } from "../cv/_lib/schema";
import type { Lang } from "../i18n";

const PRIMARY = "#0079a8";

const T: Record<Lang, { h1: string; sub: string; cta: string; busy: string; steps: string[]; no: string; fmt: string; jobs: string; err: string }> = {
  en: { h1: "Upload your CV. Get it tailored to a job.", sub: "Our AI rewrites your CV for the job you want — in about a minute.", cta: "Upload my CV", busy: "Reading your CV…", steps: ["Upload your PDF or Word CV", "Pick a template and edit", "Download it, ready to send"], no: "No CV yet? Start from scratch", fmt: "PDF or Word · free to edit", jobs: "Browse jobs instead", err: "We couldn't read this file. Try another PDF or Word file." },
  fr: { h1: "Téléversez votre CV. Adaptez-le à une offre.", sub: "Notre IA réécrit votre CV pour le poste visé, en environ une minute.", cta: "Téléverser mon CV", busy: "Lecture de votre CV…", steps: ["Téléversez votre CV en PDF ou Word", "Choisissez un modèle et modifiez", "Téléchargez-le, prêt à envoyer"], no: "Pas de CV ? Commencer de zéro", fmt: "PDF ou Word · modification gratuite", jobs: "Voir les offres d'emploi", err: "Impossible de lire ce fichier. Essayez un autre PDF ou Word." },
  ar: { h1: "ارفع سيرتك الذاتية. خصّصها لأي وظيفة.", sub: "الذكاء الاصطناعي يعيد كتابة سيرتك حسب الوظيفة التي تريدها في دقيقة تقريباً.", cta: "ارفع سيرتي الذاتية", busy: "جارٍ قراءة سيرتك…", steps: ["ارفع سيرتك بصيغة PDF أو Word", "اختر قالباً وعدّل", "حمّلها جاهزة للإرسال"], no: "ليس لديك سيرة؟ ابدأ من الصفر", fmt: "PDF أو Word · التعديل مجاني", jobs: "تصفّح الوظائف", err: "تعذّرت قراءة هذا الملف. جرّب ملف PDF أو Word آخر." },
};

export default function StartClient() {
  const [lang] = useUiLang();
  const t = T[lang];
  const rtl = lang === "ar";
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null); setBusy(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/cv/parse", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? t.err); setBusy(false); return; }
      const cv = json.cv as CVData;
      const store = useCVStore.getState();
      store.loadCV(cv);
      const s = useCVStore.getState();
      saveLocalDraft({ cv, template: s.template, accent: s.accent, lang: s.lang, order: s.order, enabled: s.enabled, cvName: s.cvName });
      markHandoff();
      router.push("/cv/builder");
    } catch {
      setError(t.err); setBusy(false);
    }
  }

  return (
    <main dir={rtl ? "rtl" : "ltr"} style={{ minHeight: "100dvh", background: "#ffffff", color: "#0e1a21", display: "flex", flexDirection: "column", fontFamily: "inherit" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>
          <LogoMark size={28} /><span>opportunty<span style={{ color: PRIMARY }}>.</span></span>
        </div>
        <UiLangSwitch />
      </header>

      <div style={{ flex: 1, width: "100%", maxWidth: 480, margin: "0 auto", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 22 }}>
        <h1 style={{ fontSize: 34, lineHeight: 1.12, letterSpacing: rtl ? 0 : "-1px", margin: 0, fontWeight: 800 }}>{t.h1}</h1>
        <p style={{ fontSize: 17, lineHeight: 1.5, color: "#26343d", margin: 0 }}>{t.sub}</p>

        <input ref={input} type="file" onChange={onFile} style={{ display: "none" }}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
        <button type="button" onClick={() => input.current?.click()} disabled={busy}
          style={{ width: "100%", padding: "18px 20px", fontSize: 19, fontWeight: 700, fontFamily: "inherit", color: "#fff", background: PRIMARY, border: "none", borderRadius: 14, cursor: busy ? "default" : "pointer", opacity: busy ? 0.75 : 1, boxShadow: "0 6px 18px rgba(0,121,168,0.28)" }}>
          {busy ? t.busy : t.cta}
        </button>
        <div style={{ fontSize: 13.5, color: "#26343d", textAlign: "center", marginTop: -12 }}>{t.fmt}</div>
        {error && <div role="alert" style={{ fontSize: 14.5, color: "#b3261e", background: "#fdeceb", padding: "10px 12px", borderRadius: 10 }}>{error}</div>}

        <ol style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
          {t.steps.map((s, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16 }}>
              <span style={{ flex: "0 0 auto", width: 28, height: 28, borderRadius: "50%", background: "#0e1a21", color: "#ffffff", fontWeight: 700, fontSize: 14, display: "grid", placeItems: "center" }}>{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", marginTop: 8, fontSize: 15 }}>
          <Link href="/cv/builder" style={{ color: "#0e1a21", fontWeight: 600 }}>{t.no}</Link>
          <Link href="/" style={{ color: "#26343d" }}>{t.jobs}</Link>
        </div>
      </div>
    </main>
  );
}
