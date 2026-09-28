"use client";
/**
 * CV Builder — /cv/[id]
 *
 * This is the *saved* builder: it loads and autosaves a real `cvs` row in
 * Supabase, so it's only reachable signed in (enforced upstream by
 * lib/supabase/middleware.ts — no anonymous sessions, ever). A signed-out
 * visitor who just wants to try the editor lands on /cv/builder instead,
 * which works the same way but keeps everything in the browser.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCVStore } from "../_store/cv-store";
import { CVDataSchema, DEFAULT_SECTION_ORDER, DEFAULT_SECTIONS_ENABLED } from "../_lib/schema";
import type { TemplateId, Lang, SectionId } from "../_lib/schema";
import { BuilderShell } from "../_components/BuilderShell";

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
