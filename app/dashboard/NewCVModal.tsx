"use client";
/** "New CV" chooser: upload an existing CV, or start from a blank one. Never reopens the previous draft. */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCVStore } from "@/app/cv/_store/cv-store";
import { clearLocalDraft, saveLocalDraft } from "@/app/cv/_lib/local-draft";
import { markHandoff } from "@/app/cv/_lib/handoff";
import { EMPTY_CV, DEFAULT_SECTION_ORDER, DEFAULT_SECTIONS_ENABLED } from "@/app/cv/_lib/schema";
import type { CVData } from "@/app/cv/_lib/schema";
import type { Lang } from "@/app/i18n";

const PRIMARY = "#0079a8";
const T: Record<Lang, { title: string; upload: string; uploadNote: string; scratch: string; scratchNote: string; cancel: string; reading: string; err: string }> = {
  en: { title: "New CV", upload: "Upload a CV", uploadNote: "PDF or Word. We read it and open it in the editor.", scratch: "Create from scratch", scratchNote: "Start with a blank CV and pick a template.", cancel: "Cancel", reading: "Reading your CV…", err: "We couldn't read this file. Try another PDF or Word file." },
  fr: { title: "Nouveau CV", upload: "Importer un CV", uploadNote: "PDF ou Word. Nous le lisons et l'ouvrons dans l'éditeur.", scratch: "Créer de zéro", scratchNote: "Partez d'un CV vierge et choisissez un modèle.", cancel: "Annuler", reading: "Lecture de votre CV…", err: "Impossible de lire ce fichier. Essayez un autre PDF ou Word." },
  ar: { title: "سيرة ذاتية جديدة", upload: "ارفع سيرة ذاتية", uploadNote: "PDF أو Word. سنقرؤها ونفتحها في المحرر.", scratch: "أنشئ من الصفر", scratchNote: "ابدأ بسيرة فارغة واختر قالباً.", cancel: "إلغاء", reading: "جارٍ قراءة سيرتك…", err: "تعذّرت قراءة هذا الملف. جرّب ملف PDF أو Word آخر." },
};

export function NewCVModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = T[lang];
  const rtl = lang === "ar";
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function scratch() {
    clearLocalDraft();
    // init() only overwrites what it is given, so pass a blank CV explicitly or the previous one stays in memory.
    useCVStore.getState().init("__local__", { cv: structuredClone(EMPTY_CV), order: DEFAULT_SECTION_ORDER, enabled: DEFAULT_SECTIONS_ENABLED, cvName: "" });
    router.push("/cv/builder");
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null); setBusy(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/cv/parse", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.cv) { setError(json.error ?? t.err); setBusy(false); return; }
      const cv = json.cv as CVData;
      useCVStore.getState().loadCV(cv);
      const s = useCVStore.getState();
      saveLocalDraft({ cv, template: s.template, accent: s.accent, lang: s.lang, order: s.order, enabled: s.enabled, cvName: s.cvName });
      markHandoff();
      router.push("/cv/builder");
    } catch { setError(t.err); setBusy(false); }
  }

  const card: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, textAlign: rtl ? "right" : "left", padding: "16px 18px", border: "1px solid rgba(14,26,33,0.15)", borderRadius: 14, background: "#fff", cursor: "pointer", fontFamily: "inherit", color: "#0e1a21" };
  return (
    <div role="dialog" aria-modal="true" aria-label={t.title} dir={rtl ? "rtl" : "ltr"} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(14,26,33,0.5)", display: "grid", placeItems: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 18, padding: 22, display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 18px 50px rgba(16,25,31,.25)" }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{t.title}</h2>
        <input ref={input} type="file" onChange={onFile} style={{ display: "none" }}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
        <button type="button" disabled={busy} onClick={() => input.current?.click()} style={{ ...card, borderColor: PRIMARY, background: "#eaf6fc", opacity: busy ? 0.7 : 1 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: PRIMARY }}>{busy ? t.reading : t.upload}</span>
          <span style={{ fontSize: 13.5, color: "#26343d" }}>{t.uploadNote}</span>
        </button>
        <button type="button" disabled={busy} onClick={scratch} style={card}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{t.scratch}</span>
          <span style={{ fontSize: 13.5, color: "#26343d" }}>{t.scratchNote}</span>
        </button>
        {error && <div role="alert" style={{ fontSize: 14, color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "8px 10px" }}>{error}</div>}
        <button type="button" onClick={onClose} disabled={busy} style={{ alignSelf: "center", background: "none", border: "none", color: "#26343d", fontSize: 14, cursor: "pointer", fontFamily: "inherit", padding: 6 }}>{t.cancel}</button>
      </div>
    </div>
  );
}
