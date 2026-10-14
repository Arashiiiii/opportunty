"use client";
import { useRef, useState } from "react";
import { useCVStore } from "../../_store/cv-store";
import { useUI } from "@/app/_lib/useUiLang";
import { cvHasText } from "../../_lib/cv-text";
import type { CVData } from "../../_lib/schema";

/** "Fix grammar" — proofreads the whole CV with Claude in its own language; one-click undo. */
export function ProofreadButton() {
  const { u } = useUI();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "none" | "err"; prev?: CVData } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = (t: NonNullable<typeof toast>) => {
    setToast(t);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 8000);
  };

  const run = async () => {
    if (busy) return;
    const before = useCVStore.getState().cv;
    if (!cvHasText(before)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/cv/proofread", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cv: before }) });
      const json = await res.json();
      if (!res.ok || !json.cv) throw new Error(json.error ?? "failed");
      if (json.changed > 0) { useCVStore.getState().loadCV(json.cv as CVData); flash({ kind: "ok", prev: before }); }
      else flash({ kind: "none" });
    } catch {
      flash({ kind: "err" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={run} disabled={busy} title={u.fixGrammarTitle}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", border: "1px solid #e5e7eb", borderRadius: 7, background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1, whiteSpace: "nowrap", flexShrink: 0 }}>
        <span aria-hidden style={{ color: "#16a34a" }}>✓</span>{u.fixGrammar}
      </button>

      {(busy || toast) && (
        <div role="status" style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9500, background: toast?.kind === "err" ? "#fef2f2" : "#201515", color: toast?.kind === "err" ? "#991b1b" : "#fffefb", border: toast?.kind === "err" ? "1px solid #fecaca" : "none", borderRadius: 10, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 8px 28px rgba(0,0,0,.25)", maxWidth: "calc(100vw - 32px)" }}>
          {busy ? <span>{u.proofreading}</span> : toast?.kind === "err" ? <span>{u.proofreadFailed}</span> : toast?.kind === "none" ? <span>{u.proofreadNone}</span> : (
            <>
              <span>{u.proofreadDone}</span>
              <button type="button" onClick={() => { if (toast?.prev) useCVStore.getState().loadCV(toast.prev); setToast(null); }}
                style={{ background: "none", border: "none", color: "#ffb38a", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, padding: 0 }}>{u.undo}</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
