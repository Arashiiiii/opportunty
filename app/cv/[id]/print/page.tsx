"use client";
/**
 * /cv/[id]/print — the paid download. Renders the CV at A4 without
 * watermark or editing chrome and opens the browser's print dialog
 * ("Save as PDF"). Only reachable once the template is unlocked.
 */
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUI } from "@/app/_lib/useUiLang";
import { CVDataSchema, DEFAULT_SECTION_ORDER, DEFAULT_SECTIONS_ENABLED } from "../../_lib/schema";
import type { CVData, TemplateId, Lang, SectionId } from "../../_lib/schema";
import { CVRender, A4_W } from "../_components/templates";

const supabase = createClient();

type Loaded = { cv: CVData; template: TemplateId; accent: string; lang: Lang; order: SectionId[]; enabled: Record<SectionId, boolean>; name: string };

export default function PrintPage() {
  const { u, rtl } = useUI();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<"loading" | "locked" | "error" | "ready">("loading");
  const [d, setD] = useState<Loaded | null>(null);
  const printed = useRef(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("cvs").select("*").eq("id", id).single();
      if (error || !data) { setState("error"); return; }
      const { data: owned } = await supabase.from("cv_template_purchases").select("id").eq("template_id", data.template).maybeSingle();
      if (!owned) { setState("locked"); router.replace(`/cv/${id}/checkout`); return; }
      const parsed = CVDataSchema.safeParse(data.data);
      if (!parsed.success) { setState("error"); return; }
      setD({
        cv: parsed.data, template: (data.template as TemplateId) ?? "corso", accent: data.accent ?? "#ff4f00", lang: (data.lang as Lang) ?? "fr",
        order: (data.section_order as SectionId[]) ?? DEFAULT_SECTION_ORDER,
        enabled: (data.sections_enabled as Record<SectionId, boolean>) ?? { ...DEFAULT_SECTIONS_ENABLED }, name: data.name ?? "CV",
      });
      setState("ready");
    })();
  }, [id, router]);

  useEffect(() => {
    if (state !== "ready" || printed.current) return;
    printed.current = true;
    const prev = document.title;
    if (d) document.title = d.name;
    const t = setTimeout(() => window.print(), 600);
    return () => { clearTimeout(t); document.title = prev; };
  }, [state, d]);

  if (state !== "ready" || !d) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: state === "error" ? "#dc2626" : "#605d52" }}>{state === "locked" ? u.printLocked : state === "error" ? u.deleteFailed : "…"}</div>;
  }

  return (
    <div dir={rtl ? "rtl" : "ltr"} style={{ background: "#f3f4f6", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-sheet { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>
      <div className="no-print" style={{ maxWidth: A4_W, margin: "0 auto", padding: "20px 16px 4px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#201515" }}>{u.printTitle}</div>
          <div style={{ fontSize: 12.5, color: "#605d52", marginTop: 2 }}>{u.printHint}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => window.print()} style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: "#ff4f00", color: "#fffefb", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>↓ {u.downloadNow}</button>
          <Link href={`/cv/${id}`} style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(32,21,21,0.24)", color: "#201515", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>{u.backToEditor}</Link>
        </div>
      </div>
      <div className="print-sheet" style={{ width: A4_W, maxWidth: "100%", margin: "16px auto 40px", background: "#fff", boxShadow: "0 4px 16px rgba(15,23,42,.08)", direction: "ltr", overflow: "hidden" }}>
        <CVRender template={d.template} cv={d.cv} accent={d.accent} lang={d.lang} order={d.order} enabled={d.enabled} readOnly />
      </div>
    </div>
  );
}
