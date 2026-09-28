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
import { SAMPLE_CV, SHOWCASE_ORDER, SHOWCASE_ENABLED } from "./_lib/sample-cv";
import { CVRender } from "./[id]/_components/templates";
import type { TemplateId } from "./_lib/schema";

const supabase = createClient();

interface CVRow {
  id:         string;
  name:       string;
  template:   string;
  updated_at: string;
}

export default function CVListPage() {
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#201515", margin: "0 0 10px" }}>Sign in to build your CV</h1>
          <p style={{ fontSize: 14, color: "#6b6259", margin: "0 0 24px" }}>
            opportunity.com saves your CVs to a real account — no anonymous sessions.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href="/login" style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e5ded3", color: "#201515", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Sign in</Link>
            <Link href="/signup" style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#ff4f00", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>Create account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafbfc", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg, #ff4f00 0%, #ff4f00 50%, #201515 50%, #201515 100%)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
            opportunity<span style={{ color: "#ff4f00" }}>.com</span>
          </span>
          <span style={{ color: "#cbd5e1", margin: "0 6px", fontWeight: 300, fontSize: 18 }}>/</span>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Mes CVs</span>
        </div>
        <Link href="/" style={{ fontSize: 12, color: "#64748b", textDecoration: "none" }}>← Accueil</Link>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>

        {createError && (
          <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠ {createError}</span>
            <button type="button" onClick={() => setCreateError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: 18 }}>×</button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Mes CVs</h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: "5px 0 0" }}>
              {cvs.length === 0 ? "Créez votre premier CV professionnel" : `${cvs.length} CV${cvs.length > 1 ? "s" : ""} enregistré${cvs.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <button type="button" onClick={() => setShowModal(true)} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#ff4f00", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            + Nouveau CV
          </button>
        </div>

        {cvs.length === 0 && (
          <div style={{ textAlign: "center", padding: "72px 24px", border: "2px dashed #e2e8f0", borderRadius: 16, background: "#fff" }}>
            <div style={{ fontSize: 48, marginBottom: 16, lineHeight: 1 }}>📄</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Aucun CV pour l&apos;instant</h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>Créez un CV professionnel en quelques minutes.</p>
            <button type="button" onClick={() => setShowModal(true)} style={{ padding: "10px 26px", borderRadius: 8, border: "none", background: "#ff4f00", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Créer mon premier CV
            </button>
          </div>
        )}

        {cvs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {cvs.map((cv) => <CVCard key={cv.id} cv={cv} />)}
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
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>Choisissez un modèle</h2>
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
                    <div style={{ width: 794, position: "absolute", top: 0, left: 0, transform: "scale(.238)", transformOrigin: "top left" }}>
                      <CVRender template={t.id as TemplateId} cv={SAMPLE_CV} accent={t.accent} lang="fr" order={SHOWCASE_ORDER} enabled={SHOWCASE_ENABLED} readOnly />
                    </div>
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

function CVCard({ cv }: { cv: CVRow }) {
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
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: hov ? "#ff4f00" : "#94a3b8" }}>
            Ouvrir l&apos;éditeur →
          </span>
        </div>
      </div>
    </Link>
  );
}
