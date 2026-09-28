"use client";
/**
 * CV Builder — /cv/[id]
 *
 * Ported from talentmaroc. Auth is enforced upstream by middleware
 * (lib/supabase/middleware.ts) — no anonymous sessions, ever — so by the
 * time this component mounts a real user is already signed in.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCVStore } from "../_store/cv-store";
import { CVDataSchema, DEFAULT_SECTION_ORDER, DEFAULT_SECTIONS_ENABLED } from "../_lib/schema";
import type { TemplateId, Lang, SectionId } from "../_lib/schema";

const supabase = createClient();

export default function CVBuilderPage() {
  const params  = useParams<{ id: string }>();
  const id      = params.id;
  const init    = useCVStore((s) => s.init);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from("cvs")
        .select("*")
        .eq("id", id)
        .single();

      if (err || !data) {
        setError(err?.message ?? "CV not found");
        return;
      }

      const parsed = CVDataSchema.safeParse(data.data);
      init(id, {
        cv:      parsed.success ? parsed.data : undefined,
        template: (data.template as TemplateId) ?? "corso",
        accent:   data.accent   ?? "#ff4f00",
        lang:     (data.lang    as Lang)       ?? "fr",
        order:    (data.section_order as SectionId[]) ?? DEFAULT_SECTION_ORDER,
        enabled:  (data.sections_enabled as Record<SectionId, boolean>) ?? { ...DEFAULT_SECTIONS_ENABLED },
        cvName:   data.name ?? "Mon CV",
      });
      setReady(true);
    }
    load();
  }, [id, init]);

  if (error) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#dc2626" }}>
      {error}
    </div>
  );

  if (!ready) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #f2ded1", borderTopColor: "#ff4f00", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return <BuilderShell cvId={id} />;
}

import { CVForm }      from "./_components/CVForm";
import { CVPreview }   from "./_components/CVPreview";
import { Topbar }      from "./_components/Topbar";
import { useAutosave } from "./_hooks/useAutosave";

function BuilderShell({ cvId }: { cvId: string }) {
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
