"use client";
/**
 * Shown once in /cv/builder right after a job was dropped on the CV:
 * how well the CV fits, what was changed, what the job asks for that the
 * CV doesn't show — plus a one-click way back to the original CV.
 */
import { useEffect, useState } from "react";
import { useUI } from "@/app/_lib/useUiLang";
import { useCVStore } from "../_store/cv-store";
import { REPORT_KEY, clearReport, type TailorReport } from "../_lib/tailor-report";
import type { CVData } from "../_lib/schema";

const PRIMARY = "#ff4f00";

function scoreColor(n: number) { return n >= 70 ? "#16a34a" : n >= 40 ? "#f97316" : "#ef4444"; }

export function TailorReportPanel() {
  const { u, rtl } = useUI();
  const [data, setData] = useState<{ report: TailorReport; before: CVData } | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(REPORT_KEY);
      // Kept until dismissed: the builder may hand over to /cv/[id] right after saving the CV.
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && Date.now() - (parsed.at ?? 0) < 2 * 3600_000) setData(parsed); else if (raw) clearReport();
    } catch { /* ignore */ }
  }, []);

  if (!data) return null;
  const { report, before } = data;

  const chip = (t: string, bg: string, fg: string) => (
    <span key={t} dir="auto" style={{ fontSize: 12.5, padding: "2px 9px", borderRadius: 9999, background: bg, color: fg, fontWeight: 600 }}>{t}</span>
  );

  return (
    <div dir={rtl ? "rtl" : "ltr"} style={{ position: "fixed", bottom: 16, [rtl ? "right" : "left"]: 16, zIndex: 8000, width: "min(360px, calc(100vw - 32px))", maxHeight: "70vh", overflowY: "auto", background: "#fffefb", border: "1px solid rgba(32,21,21,0.15)", borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,.18)", fontFamily: "'Inter', system-ui, sans-serif", color: "#201515" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "start", fontFamily: "inherit", color: "inherit" }}>
        <span style={{ flex: "0 0 auto", width: 42, height: 42, borderRadius: "50%", border: `3px solid ${scoreColor(report.score)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: scoreColor(report.score) }}>{report.score}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span dir="auto" style={{ display: "block", fontSize: 14.5, fontWeight: 700, lineHeight: 1.25 }}>{u.reportTitle.replace("{job}", report.jobTitle)}</span>
          <span style={{ display: "block", fontSize: 12.5, color: "#605d52" }}>{u.reportFit} · {report.score}/100</span>
        </span>
        <span aria-hidden style={{ color: "#939084" }}>{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          {report.source === "heuristic" && <div style={{ fontSize: 12.5, color: "#8a3a10", background: "#fff1e8", borderRadius: 8, padding: "6px 10px" }}>{u.reportBasic}</div>}

          {report.changes.length > 0 && (
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#605d52", marginBottom: 4 }}>{u.reportChanged}</div>
              <ul dir="auto" style={{ margin: 0, paddingInlineStart: 18, fontSize: 13.5, lineHeight: 1.45 }}>
                {report.changes.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          )}

          {report.matched.length > 0 && (
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#605d52", marginBottom: 4 }}>{u.reportMatched}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{report.matched.map((t) => chip(t, "#e8f7ee", "#166534"))}</div>
            </div>
          )}

          {report.missing.length > 0 && (
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#605d52", marginBottom: 4 }}>{u.reportMissing}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{report.missing.map((t) => chip(t, "#fff1e8", "#8a3a10"))}</div>
              <div style={{ fontSize: 12, color: "#939084", marginTop: 5 }}>{u.reportMissingNote}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => { useCVStore.getState().loadCV(before); clearReport(); setData(null); }} style={{ fontSize: 13, fontWeight: 700, padding: "8px 12px", borderRadius: 9, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: "pointer", fontFamily: "inherit" }}>{u.reportRestore}</button>
            <button type="button" onClick={() => { clearReport(); setData(null); }} style={{ fontSize: 13, fontWeight: 700, padding: "8px 12px", borderRadius: 9, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", fontFamily: "inherit" }}>{u.reportClose}</button>
          </div>
        </div>
      )}
    </div>
  );
}
