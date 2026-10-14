"use client";
/**
 * CV list — /cv
 *
 * Ported from talentmaroc's CVListPageClient, with two changes:
 *  1. No anonymous-session fallback — creating a CV requires a signed-in
 *     user; a signed-out visitor is sent to /login (middleware already
 *     enforces this for /cv/[id], this page also gates "New CV" directly).
 *  2. No Dodo import/entitlements modal — trimmed to "start from a template".
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EMPTY_CV, DEFAULT_SECTION_ORDER, DEFAULT_SECTIONS_ENABLED, TEMPLATE_REGISTRY } from "./_lib/schema";
import { useUI } from "@/app/_lib/useUiLang";

const supabase = createClient();

interface CVRow {
  id:         string;
  name:       string;
  template:   string;
  updated_at: string;
}

export default function CVListPage() {
  const { u, rtl } = useUI();
  const router = useRouter();
  const [cvs,     setCvs]     = useState<CVRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId,  setUserId]  = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      supabase
        .from("cvs")
        .select("id, name, template, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error) setCvs(data ?? []);
          setLoading(false);
        });
    });
  }, []);

  const removeCVs = useCallback(async (ids: string[]) => {
    if (!userId || ids.length === 0) return;
    setCreateError(null);
    // tailoring history points at the CV — remove it first so the delete can't be blocked
    await supabase.from("cv_job_tailorings").delete().eq("user_id", userId).in("cv_id", ids);
    const { error } = await supabase.from("cvs").delete().eq("user_id", userId).in("id", ids);
    if (error) { setCreateError(u.deleteFailed); return; }
    setCvs((prev) => prev.filter((c) => !ids.includes(c.id)));
  }, [userId, u]);

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !userId) return;
    setCreateError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cv/parse", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.cv) { setCreateError(json.error ?? u.uploadFailed); return; }
      const p = json.cv as { profile?: { firstName?: string; lastName?: string } };
      const name = `${p.profile?.firstName ?? ""} ${p.profile?.lastName ?? ""}`.trim() || file.name.replace(/\.[^.]+$/, "");
      const { data, error } = await supabase.from("cvs").insert({
        user_id: userId, name, data: json.cv, template: "corso", accent: "#ff4f00", lang: "fr",
        section_order: DEFAULT_SECTION_ORDER, sections_enabled: DEFAULT_SECTIONS_ENABLED,
      }).select("id").single();
      if (error || !data) { setCreateError(error?.message ?? u.uploadFailed); return; }
      router.push(`/cv/${data.id}`);
    } catch {
      setCreateError(u.uploadFailed);
    } finally {
      setUploading(false);
    }
  }, [userId, router, u]);

  const createCV = useCallback(async (template: string) => {
    setCreateError(null);
    if (!userId) {
      router.push(`/login?next=/cv`);
      return;
    }

    const { data, error } = await supabase
      .from("cvs")
      .insert({
        user_id:          userId,
        name:             "Mon CV",
        data:             EMPTY_CV,
        template,
        accent:           "#ff4f00",
        lang:             "fr",
        section_order:    DEFAULT_SECTION_ORDER,
        sections_enabled: DEFAULT_SECTIONS_ENABLED,
      })
      .select("id")
      .single();

    if (data && !error) {
      router.push(`/cv/${data.id}`);
    } else {
      setCreateError(error?.message ?? "Could not create the CV.");
    }
  }, [userId, router]);

  if (loading) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#fffefb" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #f2ded1", borderTopColor: "#ff4f00", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!userId) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fffefb", fontFamily: "'Inter', system-ui, sans-serif", padding: 24, textAlign: "center" }}>
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#201515", margin: "0 0 10px" }}>{u.needSignInBuild}</h1>
          <p style={{ fontSize: 14, color: "#6b6259", margin: "0 0 24px" }}>
            {u.needSignInNote}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href="/login" style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e5ded3", color: "#201515", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>{u.signIn}</Link>
            <Link href="/signup" style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#ff4f00", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>{u.createAccount}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafbfc", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" aria-label="opportunity.com" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg, #ff4f00 0%, #ff4f00 50%, #201515 50%, #201515 100%)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              opportunity<span style={{ color: "#ff4f00" }}>.com</span>
            </span>
          </Link>
          <span style={{ color: "#cbd5e1", margin: "0 6px", fontWeight: 300, fontSize: 18 }}>/</span>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{u.myCVs}</span>
        </div>
        <Link href="/" style={{ fontSize: 12, color: "#64748b", textDecoration: "none" }}>{u.home}</Link>
      </div>

      <input ref={fileRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFile} style={{ display: "none" }} />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>

        {createError && (
          <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠ {createError}</span>
            <button type="button" onClick={() => setCreateError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: 18 }}>×</button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>{u.myCVs}</h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: "5px 0 0" }}>
              {cvs.length === 0 ? u.firstCV : u.nCVs(cvs.length)}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {cvs.length > 0 && (
              <button type="button" onClick={() => { if (window.confirm(u.confirmClear)) void removeCVs(cvs.map((c) => c.id)); }} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#b91c1c", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {u.clearAll}
              </button>
            )}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a", fontSize: 13, fontWeight: 600, cursor: uploading ? "wait" : "pointer", fontFamily: "inherit", opacity: uploading ? 0.7 : 1 }}>
              {uploading ? u.uploadingCV : u.uploadCV}
            </button>
            <button type="button" onClick={() => setShowModal(true)} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#ff4f00", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {u.newCV}
            </button>
          </div>
        </div>

        {cvs.length === 0 && (
          <div style={{ textAlign: "center", padding: "72px 24px", border: "2px dashed #e2e8f0", borderRadius: 16, background: "#fff" }}>
            <div style={{ fontSize: 48, marginBottom: 16, lineHeight: 1 }}>📄</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>{u.noCVs}</h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>{u.noCVsNote}</p>
            <button type="button" onClick={() => setShowModal(true)} style={{ padding: "10px 26px", borderRadius: 8, border: "none", background: "#ff4f00", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {u.createFirst}
            </button>
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "10px 26px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a", fontSize: 14, fontWeight: 600, cursor: uploading ? "wait" : "pointer", fontFamily: "inherit" }}>
                {uploading ? u.uploadingCV : u.uploadCV}
              </button>
            </div>
          </div>
        )}

        {cvs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {cvs.map((cv) => <CVCard key={cv.id} cv={cv} onDelete={() => { if (window.confirm(u.confirmDelete)) void removeCVs([cv.id]); }} />)}
          </div>
        )}
      </div>

      {showModal && (
        <TemplateModal onClose={() => setShowModal(false)} onCreate={async (t) => { await createCV(t); setShowModal(false); }} />
      )}
    </div>
  );
}

function TemplateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (template: string) => Promise<void> }) {
  const { u } = useUI();
  const [busy, setBusy] = useState<string | null>(null);

  const pick = async (id: string) => {
    setBusy(id);
    await onCreate(id);
    setBusy(null);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(15,23,42,.55)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 16, width: 960, maxWidth: "calc(100vw - 32px)", maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>{u.chooseTemplate}</h2>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#f1f5f9", color: "#64748b", fontSize: 18, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "16px 24px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {TEMPLATE_REGISTRY.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pick(t.id)}
                disabled={!!busy}
                style={{
                  background:   "#fff",
                  border:       `2px solid #e5e7eb`,
                  borderRadius: 10,
                  padding:      10,
                  cursor:       busy ? "wait" : "pointer",
                  textAlign:    "left",
                  opacity:      busy && busy !== t.id ? 0.5 : 1,
                  position:     "relative",
                }}
              >
                <div style={{ borderRadius: 6, overflow: "hidden", border: "1px solid #e5e7eb", background: "#fff", position: "relative" }}>
                  <div style={{ width: "100%", aspectRatio: "794/1123", overflow: "hidden", position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/templates/${t.id}.png`} alt={`${t.name} template`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
                  </div>
                  {busy === t.id && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 20, animation: "spin .65s linear infinite", display: "inline-block", color: t.accent }}>⟳</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginTop: 8 }}>{t.name}</div>
                <p style={{ fontSize: 10.5, color: "#64748b", margin: "3px 0 0", lineHeight: 1.4 }}>{t.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function CVCard({ cv, onDelete }: { cv: CVRow; onDelete: () => void }) {
  const { u } = useUI();
  const [hov, setHov] = useState(false);
  const date = new Date(cv.updated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Link href={`/cv/${cv.id}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ background: "#fff", border: `1px solid ${hov ? "#ffcbab" : "#e5e7eb"}`, borderRadius: 12, padding: 16, cursor: "pointer", boxShadow: hov ? "0 4px 16px rgba(255,79,0,.10)" : "none" }}
      >
        <div style={{ height: 90, borderRadius: 6, background: "#f8fafc", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 11 }}>
          {cv.template}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", margin: "12px 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {cv.name || "Mon CV"}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#94a3b8" }}>
          <span>{cv.template}</span>
          <span>{date}</span>
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: hov ? "#ff4f00" : "#94a3b8" }}>
            Ouvrir l&apos;éditeur →
          </span>
          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} style={{ fontSize: 12, fontWeight: 600, color: "#b91c1c", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
            {u.deleteCV}
          </button>
        </div>
      </div>
    </Link>
  );
}
