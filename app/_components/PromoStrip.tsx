"use client";
/** Moving announcement strip for the discount code. Tap it to copy the code; × hides it for the session. */
import { useEffect, useState } from "react";
import { useUiLang } from "../_lib/useUiLang";
import { PROMO } from "@/lib/promo";
import type { Lang } from "../i18n";

const KEY = "opportunty_promo_closed";
const TEXT: Record<Lang, { msg: string; copy: string; copied: string; close: string }> = {
  en: { msg: `${PROMO.percent}% OFF your CV download — use code`, copy: "Tap to copy", copied: "Copied!", close: "Close" },
  fr: { msg: `-${PROMO.percent}% sur le téléchargement de votre CV — code`, copy: "Touchez pour copier", copied: "Copié !", close: "Fermer" },
  ar: { msg: `خصم ${PROMO.percent}% على تحميل سيرتك الذاتية — استخدم الرمز`, copy: "المس للنسخ", copied: "تم النسخ!", close: "إغلاق" },
};

export function PromoStrip() {
  const [lang] = useUiLang();
  const [closed, setClosed] = useState(true); // hidden until we know, avoids a flash for people who closed it
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    try { setClosed(sessionStorage.getItem(KEY) === "1"); } catch { setClosed(false); }
  }, []);
  if (!PROMO.active || closed) return null;
  const t = TEXT[lang];
  const copy = async () => {
    try { await navigator.clipboard.writeText(PROMO.code); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  };
  const item = (k: number) => (
    <span key={k} lang={lang} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "0 28px", whiteSpace: "nowrap" }}>
      <span aria-hidden>🎉</span>
      <span>{t.msg}</span>
      <b style={{ background: "#ffffff", color: "#0e1a21", borderRadius: 6, padding: "2px 9px", letterSpacing: 1 }}>{PROMO.code}</b>
      <span style={{ opacity: 0.85, fontSize: 12 }}>· {copied ? t.copied : t.copy}</span>
    </span>
  );
  return (
    <div role="region" aria-label="Promotion" style={{ position: "relative", background: "#0079a8", color: "#ffffff", fontFamily: "'Inter Variable', 'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 600, height: 40, display: "flex", alignItems: "center", overflow: "hidden", direction: "ltr" }}>
      <button onClick={copy} aria-label={`${t.msg} ${PROMO.code}. ${t.copy}`} className="opp-promo" style={{ all: "unset", cursor: "pointer", flex: "1 1 0", minWidth: 0, overflow: "hidden", display: "block", height: 40, lineHeight: "40px" }}>
        <span className="opp-promo-track" style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
          {[0, 1, 2, 3].map(item)}
        </span>
      </button>
      <button onClick={() => { try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ } setClosed(true); }} aria-label={t.close}
        style={{ all: "unset", cursor: "pointer", flexShrink: 0, width: 40, height: 40, textAlign: "center", lineHeight: "40px", fontSize: 20, background: "#0079a8" }}>×</button>
      <style>{`
        .opp-promo-track { animation: opp-marquee 26s linear infinite; will-change: transform; }
        .opp-promo:hover .opp-promo-track { animation-play-state: paused; }
        @keyframes opp-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .opp-promo-track { animation: none; } }
      `}</style>
    </div>
  );
}
