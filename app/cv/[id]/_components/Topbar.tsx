"use client";
/**
 * Topbar — ported from talentmaroc, stripped of the Dodo Payments
 * per-template unlock flow: opportunity.com has no template paywall,
 * so "Download PDF" opens the print tab directly for any template.
 */
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useCVStore } from "../../_store/cv-store";
import { computeScore } from "../../_lib/score";
import { ScoreRing }    from "./ScoreRing";
import { ScorePopover } from "./ScorePopover";
import { LangToggle }   from "./LangToggle";

interface Props {
  cvId:            string;
  mobileTab?:      "form" | "preview";
  onToggleMobile?: () => void;
}

export function Topbar({ cvId, mobileTab, onToggleMobile }: Props) {
  const cvName    = useCVStore((s) => s.cvName);
  const setCVName = useCVStore((s) => s.setCVName);
  const saving    = useCVStore((s) => s.saving);
  const lastSaved = useCVStore((s) => s.lastSaved);
  const cv        = useCVStore((s) => s.cv);
  const order     = useCVStore((s) => s.order);
  const enabled   = useCVStore((s) => s.enabled);

  const [scoreOpen, setScoreOpen] = useState(false);

  const openPrintTab = useCallback(() => {
    window.open(`/cv/${cvId}/print?autoprint=1`, "_blank");
  }, [cvId]);

  const { value: score } = useMemo(
    () => computeScore(cv, order, enabled),
    [cv, order, enabled],
  );

  const dotColor = saving ? "#f97316" : lastSaved ? "#16a34a" : "#94a3b8";

  const ghost = {
    padding:      "7px 12px",
    borderRadius: 7,
    border:       "1px solid #e5e7eb",
    background:   "#fff",
    color:        "#475569",
    fontSize:     12,
    fontWeight:   600,
    cursor:       "pointer",
    fontFamily:   "inherit",
    display:      "inline-flex",
    alignItems:   "center",
    gap:          5,
    whiteSpace:   "nowrap" as const,
  } as const;

  const primary = {
    ...ghost,
    border:     "none",
    background: "#0f172a",
    color:      "#fff",
    boxShadow:  "0 1px 3px rgba(0,0,0,.15)",
  } as const;

  const isMobile = mobileTab !== undefined;

  return (
    <div style={{
      display:      "flex",
      alignItems:   "center",
      gap:          isMobile ? 8 : 12,
      padding:      `0 ${isMobile ? 12 : 20}px`,
      height:       56,
      background:   "#fff",
      borderBottom: "1px solid #e5e7eb",
      flexShrink:   0,
      position:     "relative",
      overflow:     "hidden",
    }}>

      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: isMobile ? 8 : 14, borderRight: "1px solid #e5e7eb", height: "100%", flexShrink: 0, textDecoration: "none" }}
      >
        <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg, #ff4f00 0%, #ff4f00 50%, #201515 50%, #201515 100%)", flexShrink: 0 }} />
        {!isMobile && (
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
            opportunity<span style={{ color: "#ff4f00" }}>.com</span>
          </span>
        )}
      </Link>

      {!isMobile && (
        <Link href="/cv" style={{ fontSize: 12, color: "#64748b", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          ← CVs
        </Link>
      )}
      {!isMobile && <span style={{ color: "#cbd5e1", fontWeight: 300, fontSize: 18, flexShrink: 0 }}>/</span>}

      <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, flex: isMobile ? 1 : undefined }}>
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const next = e.currentTarget.innerText.trim();
            if (next) setCVName(next);
            else e.currentTarget.innerText = cvName;
          }}
          style={{
            fontSize:     13,
            fontWeight:   600,
            color:        "#0f172a",
            outline:      "none",
            cursor:       "text",
            minWidth:     60,
            maxWidth:     isMobile ? "100%" : 200,
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
            borderRadius: 4,
            padding:      "2px 4px",
          }}
          onFocus={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff4ec"; }}
          onBlurCapture={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          {cvName}
        </span>
        {!isMobile && <span style={{ color: "#cbd5e1", fontSize: 10, flexShrink: 0 }}>✏</span>}
      </div>

      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, animation: saving ? "pulse 1.2s infinite" : "none", flexShrink: 0 }} />
          {saving ? "Enregistrement…" : lastSaved ? "Enregistré" : ""}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {isMobile && onToggleMobile && (
        <button
          type="button"
          onClick={onToggleMobile}
          style={{
            padding:      "6px 12px",
            borderRadius: 7,
            border:       "1px solid #e5e7eb",
            background:   "#fff",
            color:        "#475569",
            fontSize:     12,
            fontWeight:   600,
            cursor:       "pointer",
            fontFamily:   "inherit",
            display:      "inline-flex",
            alignItems:   "center",
            gap:          5,
            flexShrink:   0,
          }}
        >
          {mobileTab === "form" ? "👁 Aperçu" : "✎ Formulaire"}
        </button>
      )}

      {!isMobile && (
        <>
          <LangToggle />

          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setScoreOpen((o) => !o)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 8px", border: "1px solid #e5e7eb", borderRadius: 100, background: scoreOpen ? "#fff4ec" : "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 11.5, fontWeight: 500, color: "#475569" }}
            >
              <ScoreRing value={score} />
              <span><b style={{ color: "#0f172a" }}>{score}%</b> complet</span>
            </button>
            {scoreOpen && <ScorePopover onClose={() => setScoreOpen(false)} />}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={openPrintTab}
        style={{ ...primary, opacity: score < 30 ? 0.6 : 1, cursor: score < 30 ? "not-allowed" : "pointer", padding: isMobile ? "6px 10px" : "7px 12px" }}
        disabled={score < 30}
        title={score < 30 ? "Atteignez 30% pour télécharger" : "Télécharger en PDF"}
      >
        ↓{!isMobile && <> Télécharger PDF</>}
      </button>
    </div>
  );
}
