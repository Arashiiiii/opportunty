"use client";
/** Bottom-corner visual tutorial: 4 illustrated steps, shown once, re-openable from a small "?" button. */
import { useEffect, useState } from "react";
import { useUiLang } from "../_lib/useUiLang";
import type { Lang } from "../i18n";

const KEY = "opportunity_tour_v1";
const PRIMARY = "#0079a8";

const T: Record<Lang, { steps: { t: string; d: string }[]; next: string; back: string; done: string; skip: string; help: string; of: string }> = {
  en: { steps: [
    { t: "Find a job", d: "Search and filter live job listings from across the region." },
    { t: "Upload your CV", d: "Drop a PDF or Word file. We read it for you in seconds." },
    { t: "Tailor it with AI", d: "Pick a job and the AI rewrites your CV to match it." },
    { t: "Download & apply", d: "Choose a template and colour, then download a clean PDF." } ],
    next: "Next", back: "Back", done: "Got it", skip: "Skip", help: "How it works", of: "of" },
  fr: { steps: [
    { t: "Trouvez un emploi", d: "Cherchez et filtrez des offres en direct de toute la région." },
    { t: "Téléversez votre CV", d: "Déposez un PDF ou Word. Nous le lisons en quelques secondes." },
    { t: "Adaptez-le avec l'IA", d: "Choisissez une offre et l'IA réécrit votre CV pour elle." },
    { t: "Téléchargez et postulez", d: "Choisissez un modèle et une couleur, puis téléchargez un PDF propre." } ],
    next: "Suivant", back: "Retour", done: "Compris", skip: "Passer", help: "Comment ça marche", of: "sur" },
  ar: { steps: [
    { t: "ابحث عن وظيفة", d: "ابحث وصفّ عروض العمل المباشرة من أنحاء المنطقة." },
    { t: "ارفع سيرتك الذاتية", d: "أسقط ملف PDF أو Word وسنقرؤه لك في ثوانٍ." },
    { t: "خصّصها بالذكاء الاصطناعي", d: "اختر وظيفة وسيعيد الذكاء الاصطناعي كتابة سيرتك لتناسبها." },
    { t: "حمّل وقدّم", d: "اختر قالباً ولوناً ثم حمّل ملف PDF أنيقاً." } ],
    next: "التالي", back: "السابق", done: "فهمت", skip: "تخطّي", help: "كيف يعمل", of: "من" },
};

function Art({ i }: { i: number }) {
  const bar = (x: number, y: number, w: number, c = "#e3e8eb") => <rect x={x} y={y} width={w} height="6" rx="3" fill={c} />;
  return (
    <svg viewBox="0 0 280 120" width="100%" height="120" aria-hidden="true" style={{ display: "block", background: "#eaf6fc", borderRadius: 12 }}>
      {i === 0 && (<g>
        <rect x="24" y="14" width="232" height="26" rx="13" fill="#fff" stroke="#e3e8eb" />
        <circle cx="44" cy="27" r="6" fill="none" stroke={PRIMARY} strokeWidth="2.5" /><path d="M48.5 31.5l5 5" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" />
        {bar(62, 24, 80)}
        {[52, 78, 104].map((y, k) => (<g key={y}><rect x="24" y={y} width="232" height="20" rx="6" fill="#fff" stroke="#e3e8eb" />{bar(34, y + 7, 90 - k * 10, "#0e1a21")}{bar(200, y + 7, 44, k === 0 ? PRIMARY : "#e3e8eb")}</g>))}
      </g>)}
      {i === 1 && (<g>
        <rect x="70" y="14" width="140" height="92" rx="12" fill="#fff" stroke={PRIMARY} strokeWidth="2" strokeDasharray="6 5" />
        <g className="opp-tour-bob"><path d="M140 80V42M140 42l-12 12M140 42l12 12" stroke={PRIMARY} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
        <text x="140" y="98" textAnchor="middle" fontSize="11" fontWeight="700" fill="#26343d">PDF · DOCX</text>
      </g>)}
      {i === 2 && (<g>
        <rect x="22" y="16" width="92" height="88" rx="8" fill="#fff" stroke="#e3e8eb" />{bar(32, 28, 50, "#0e1a21")}{bar(32, 44, 70)}{bar(32, 56, 60)}{bar(32, 68, 66)}
        <path d="M126 60h28m0 0l-8-8m8 8l-8 8" stroke={PRIMARY} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="166" y="16" width="92" height="88" rx="8" fill="#fff" stroke={PRIMARY} strokeWidth="2" />{bar(176, 28, 50, "#0e1a21")}{bar(176, 44, 70, "#9fd3ea")}{bar(176, 56, 60, "#9fd3ea")}{bar(176, 68, 66, "#9fd3ea")}
        <circle cx="248" cy="22" r="11" fill={PRIMARY} /><path d="M243 22l4 4 6-8" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>)}
      {i === 3 && (<g>
        <rect x="86" y="10" width="76" height="100" rx="6" fill="#fff" stroke="#e3e8eb" /><rect x="86" y="10" width="76" height="22" rx="6" fill={PRIMARY} />{bar(94, 42, 50)}{bar(94, 54, 58)}{bar(94, 66, 44)}{bar(94, 78, 54)}
        {["#0079a8", "#0e1a21", "#2563eb", "#16a34a"].map((c, k) => <circle key={c} cx={188} cy={26 + k * 22} r="8" fill={c} stroke="#fff" strokeWidth="2" />)}
        <g className="opp-tour-bob"><circle cx="48" cy="60" r="20" fill="#0e1a21" /><path d="M48 50v16m0 0l-7-7m7 7l7-7M39 72h18" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      </g>)}
    </svg>
  );
}

export function TourPopup() {
  const [lang] = useUiLang();
  const t = T[lang];
  const rtl = lang === "ar";
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    let seen = false;
    try { seen = localStorage.getItem(KEY) === "1"; } catch { /* ignore */ }
    if (seen) return;
    const id = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(id);
  }, []);

  function close() {
    setOpen(false); setI(0);
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
  }
  if (!ready) return null;
  const side = rtl ? { left: 16 } : { right: 16 };
  const last = i === t.steps.length - 1;

  return (
    <>
      <style>{`
        @keyframes opp-tour-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes opp-tour-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .opp-tour-bob{animation:opp-tour-bob 1.4s ease-in-out infinite}
        @media (max-width:640px){.opp-tour-card{left:12px!important;right:12px!important;width:auto!important;bottom:12px!important}}
        @media (prefers-reduced-motion:reduce){.opp-tour-bob,.opp-tour-card{animation:none!important}}
      `}</style>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} aria-label={t.help} title={t.help}
          style={{ position: "fixed", bottom: 16, ...side, zIndex: 40, width: 44, height: 44, borderRadius: "50%", border: "none", background: "#0e1a21", color: "#ffffff", fontSize: 20, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 18px rgba(14,26,33,0.25)", fontFamily: "inherit" }}>?</button>
      )}
      {open && (
        <div role="dialog" aria-label={t.help} dir={rtl ? "rtl" : "ltr"} className="opp-tour-card"
          style={{ position: "fixed", bottom: 16, ...side, zIndex: 50, width: 320, background: "#ffffff", border: "1px solid rgba(14,26,33,0.12)", borderRadius: 18, padding: 14, boxShadow: "0 18px 48px rgba(14,26,33,0.22)", animation: "opp-tour-in .35s ease-out", display: "flex", flexDirection: "column", gap: 10 }}>
          <button type="button" onClick={close} aria-label={t.skip}
            style={{ position: "absolute", top: 8, ...(rtl ? { left: 8 } : { right: 8 }), zIndex: 1, width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(255,254,251,0.9)", cursor: "pointer", fontSize: 16, color: "#26343d", fontFamily: "inherit" }}>×</button>
          <Art i={i} />
          <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>{i + 1} {t.of} {t.steps.length}</div>
          <div style={{ fontSize: 17, fontWeight: 800, marginTop: -6 }}>{t.steps[i].t}</div>
          <div style={{ fontSize: 14.5, lineHeight: 1.45, color: "#26343d", marginTop: -6 }}>{t.steps[i].d}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {t.steps.map((_, k) => <span key={k} style={{ width: k === i ? 18 : 7, height: 7, borderRadius: 4, background: k === i ? PRIMARY : "#e3e8eb", transition: "width .2s" }} />)}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {i > 0 && <button type="button" onClick={() => setI(i - 1)} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(14,26,33,0.15)", background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600 }}>{t.back}</button>}
              <button type="button" onClick={() => (last ? close() : setI(i + 1))} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700 }}>{last ? t.done : t.next}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
