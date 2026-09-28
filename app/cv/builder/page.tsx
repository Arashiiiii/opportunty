"use client";
/**
 * CV Builder — /cv/builder
 *
 * The anonymous-capable editor. No login required: reachable straight from
 * the homepage (upload a CV, drag a job onto it, or pick a template) with
 * zero friction. The CV lives in the Zustand store and is mirrored to
 * localStorage only — opportunity.com never creates a Supabase row, let
 * alone an anonymous session, for a signed-out visitor.
 *
 * The store may already be populated when this page mounts (the homepage
 * sets it before calling router.push, and the SPA navigation keeps the
 * module-level store alive) — that in-memory state wins. Otherwise we
 * fall back to whatever draft was saved to localStorage on a previous
 * visit, and finally to a blank CV.
 *
 * Real value (downloading) still requires signing in — Topbar handles
 * that gate and, at that point, claims this draft into a real `cvs` row.
 */
import { useEffect, useState } from "react";
import { useCVStore } from "../_store/cv-store";
import { readLocalDraft } from "../_lib/local-draft";
import { HANDOFF_KEY } from "../_lib/handoff";
import { BuilderShell } from "../_components/BuilderShell";

export default function AnonymousBuilderPage() {
  const init  = useCVStore((s) => s.init);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The homepage just populated the store directly (upload / drag-a-job /
    // pick-a-template) and flagged the handoff — that in-memory state wins,
    // don't clobber it with an older localStorage draft.
    let handedOff = false;
    try {
      handedOff = window.sessionStorage.getItem(HANDOFF_KEY) === "1";
      if (handedOff) window.sessionStorage.removeItem(HANDOFF_KEY);
    } catch {
      // ignore
    }
    if (handedOff) {
      useCVStore.setState({ cvId: "__local__" });
      setReady(true);
      return;
    }

    const draft = readLocalDraft();
    if (draft) {
      init("__local__", {
        cv:       draft.cv,
        template: draft.template,
        accent:   draft.accent,
        lang:     draft.lang,
        order:    draft.order,
        enabled:  draft.enabled,
        cvName:   draft.cvName,
      });
    } else {
      init("__local__", {});
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #f2ded1", borderTopColor: "#ff4f00", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return <BuilderShell cvId={null} />;
}
