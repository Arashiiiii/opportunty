"use client";
import { useRef, useState } from "react";
import { useCVStore } from "../../_store/cv-store";
import { useUI } from "@/app/_lib/useUiLang";
import { cvHasText } from "../../_lib/cv-text";
import type { CVData, Lang } from "../../_lib/schema";

const LANGS: { key: Lang; label: string }[] = [
  { key: "fr", label: "Fr" },
  { key: "en", label: "En" },
  { key: "ar", label: "ع"  },
];

/**
 * Switches the CV's language: headings/direction immediately, and the CV's own
 * text (summary, roles, bullets…) is translated by Claude. One-click undo.
 */
export function LangToggle() {
  const { u } = useUI();
  const lang    = useCVStore((s) => s.lang);
  const setLang = useCVStore((s) => s.setLang);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; prev?: { cv: CVData; lang: Lang } } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = (t: NonNullable<typeof toast>) => {
    setToast(t);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 8000);
  };

  const switchTo = async (target: Lang) => {
    if (busy || target === lang) return;
    const before = { cv: useCVStore.getState().cv, lang };
    setLang(target);
    if (!cvHasText(before.cv)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/cv/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: before.cv, target }),
      });
      const json = await res.json();
      if (!res.ok || !json.cv) throw new Error(json.error ?? "failed");
      useCVStore.getState().loadCV(json.cv as CVData);
      flash({ kind: "ok", prev: before });
    } catch {
      flash({ kind: "err" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: 7, padding: 2, background: "#fff", gap: 0, opacity: busy ? 0.6 : 1 }}>
        {LANGS.map(({ key, label }) => {
          const active = lang === key;
          return (
            <button
              key={key}
              type="button"
              disabled={busy}
              onClick={() => switchTo(key)}
              style={{
                padding:      "4px 9px",
                borderRadius: 5,
                border:       "none",
                fontSize:     11,
                fontWeight:   active ? 700 : 500,
                fontFamily:   "inherit",
                color:        active ? "#7c3aed" : "#64748b",
                background:   active ? "#f5f3ff" : "transparent",
                cursor:       busy ? "wait" : "pointer",
                textTransform: "uppercase",
                letterSpacing: ".04em",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {(busy || toast) && (
        <div role="status" style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9500, background: toast?.kind === "err" ? "#fef2f2" : "#201515", color: toast?.kind === "err" ? "#991b1b" : "#fffefb", border: toast?.kind === "err" ? "1px solid #fecaca" : "none", borderRadius: 10, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 8px 28px rgba(0,0,0,.25)", maxWidth: "calc(100vw - 32px)" }}>
          {busy ? <span>{u.translating}</span> : toast?.kind === "err" ? <span>{u.translateFailed}</span> : (
            <>
              <span>{u.translatedTo}</span>
              <button type="button" onClick={() => { if (toast?.prev) { useCVStore.getState().loadCV(toast.prev.cv); setLang(toast.prev.lang); } setToast(null); }}
                style={{ background: "none", border: "none", color: "#ffb38a", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, padding: 0 }}>{u.undo}</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
