"use client";
/**
 * BuilderShell — the editor chrome (Topbar + form + preview), shared by
 * both the anonymous builder (/cv/builder, cvId=null) and the saved-CV
 * builder (/cv/[id], cvId=<uuid>). Only useAutosave's target differs.
 */
import { useEffect, useState } from "react";
import { useAutosave } from "../[id]/_hooks/useAutosave";

import { CVForm }    from "../[id]/_components/CVForm";
import { CVPreview } from "../[id]/_components/CVPreview";
import { Topbar }    from "../[id]/_components/Topbar";

export function BuilderShell({ cvId }: { cvId: string | null }) {
  useAutosave(cvId);

  const [isMobile,  setIsMobile]  = useState(false);
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#fafbfc", fontFamily: "'Inter', system-ui, sans-serif", color: "#0f172a" }}>
      <Topbar
        cvId={cvId}
        mobileTab={isMobile ? mobileTab : undefined}
        onToggleMobile={isMobile ? () => setMobileTab((t) => t === "form" ? "preview" : "form") : undefined}
      />

      {!isMobile && (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(380px, 480px) 1fr", minHeight: 0 }}>
          <CVForm />
          <CVPreview />
        </div>
      )}

      {isMobile && (
        <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          {mobileTab === "form"    && <CVForm />}
          {mobileTab === "preview" && <CVPreview />}
        </div>
      )}
    </div>
  );
}
