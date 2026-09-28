"use client";
/**
 * opportunity.com homepage — built from the approved design mockup
 * (Artifact 6eda429d…): search bar, job feed (left) + CV space (right),
 * CV template strip below.
 *
 * No login required to use the CV workspace: uploading a résumé, dragging
 * a job onto it, and picking a template all work signed out — the CV
 * lives in the browser (Zustand store, mirrored to localStorage) and
 * hands off into /cv/builder. opportunity.com only asks for a real
 * account at the one point that matters: downloading (Topbar), which is
 * also where a signed-in visitor is sent on to pay.
 *
 * "Tailoring" calls Claude (via /api/cv/tailor) to rewrite the title,
 * summary and a highlighted-skills group for the dropped job — falling
 * back to a deterministic tag-matching pass (cv/_lib/tailor.ts) if that
 * call fails, so dragging a job never just breaks.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TEMPLATE_REGISTRY, EMPTY_CV } from "./cv/_lib/schema";
import type { TemplateId, CVData } from "./cv/_lib/schema";
import { useCVStore } from "./cv/_store/cv-store";
import { tailorCVForJob } from "./cv/_lib/tailor";
import { markHandoff } from "./cv/_lib/handoff";
import { TemplateThumb } from "./TemplateThumb";
import { LoginGateModal } from "./_components/LoginGateModal";

const PRIMARY = "#ff4f00";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  tags: string[];
  description: string;
}

const PLACEHOLDER_JOBS: Job[] = [
  { id: "1", title: "Senior Backend Engineer", company: "Atlas Cloud", location: "Casablanca", job_type: "Full-time", salary_range: "25,000–35,000 MAD", tags: ["Node.js", "PostgreSQL", "AWS"], description: "Own core API services for a fast-growing fintech platform used across North Africa." },
  { id: "2", title: "Product Designer", company: "Cedar Studio", location: "Casablanca", job_type: "Full-time", salary_range: "15,000–20,000 MAD", tags: ["Figma", "Design systems", "UX research"], description: "Shape the product experience for a design-led SaaS studio working with regional retailers." },
  { id: "3", title: "DevOps Engineer", company: "Meridian Bank", location: "Casablanca", job_type: "Full-time", salary_range: "20,000–28,000 MAD", tags: ["Kubernetes", "CI/CD", "Terraform"], description: "Modernize deployment pipelines for a bank's digital-first lending platform." },
  { id: "4", title: "Growth Marketing Manager", company: "Route6 Logistics", location: "Tangier", job_type: "Full-time", salary_range: "12,000–18,000 MAD", tags: ["SEO", "Paid media", "Analytics"], description: "Drive customer acquisition for a logistics platform expanding across the Maghreb." },
  { id: "5", title: "Data Analyst", company: "BluePeak Analytics", location: "Rabat", job_type: "Hybrid", salary_range: "14,000–19,000 MAD", tags: ["SQL", "Python", "Tableau"], description: "Turn operational data into decisions for consumer-goods clients across Morocco." },
  { id: "6", title: "Frontend Developer", company: "Atlas Cloud", location: "Casablanca", job_type: "Remote", salary_range: "18,000–24,000 MAD", tags: ["React", "TypeScript", "Tailwind"], description: "Build the customer dashboard for a fintech product used by thousands of SMEs." },
];

const supabase = createClient();

export default function HomeClient() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [jobs, setJobs] = useState<Job[]>(PLACEHOLDER_JOBS);
  const [usingPlaceholders, setUsingPlaceholders] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cvJobId, setCvJobId] = useState<string | null>(null);
  const [tailoring, setTailoring] = useState(false);
  const [tailoredCV, setTailoredCV] = useState<CVData | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId | null>(null);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setAuthed(!!user));

    supabase
      .from("jobs")
      .select("id, title, company, location, job_type, salary_range, tags, description")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setJobs(data as Job[]);
          setUsingPlaceholders(false);
        }
      });
  }, []);

  const enterBuilder = useCallback((cv: CVData, template?: TemplateId) => {
    const store = useCVStore.getState();
    store.loadCV(cv);
    if (template) { store.setTemplate(template); }
    markHandoff();
    router.push("/cv/builder");
  }, [router]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData("text/plain");
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    setCvJobId(id);
    setTailoring(true);

    const base = useCVStore.getState().cv ?? EMPTY_CV;
    try {
      const res = await fetch("/api/cv/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: base, job }),
      });
      const json = await res.json();
      if (res.ok && json.cv) {
        setTailoredCV(json.cv as CVData);
      } else {
        setTailoredCV(tailorCVForJob(base, job));
      }
    } catch {
      setTailoredCV(tailorCVForJob(base, job));
    } finally {
      setTailoring(false);
    }
  }, [jobs]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cv/parse", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error ?? "Couldn't read that file.");
        return;
      }
      enterBuilder(json.cv as CVData);
    } catch {
      setUploadError("Upload failed — check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }, [enterBuilder]);

  const useSavedCV = useCallback(async () => {
    if (!authed) { setShowLoginGate(true); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setShowLoginGate(true); return; }
    const { data } = await supabase
      .from("cvs")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.id) {
      router.push(`/cv/${data.id}`);
    } else {
      // No saved CV yet — anonymous builder is the right place to start one.
      enterBuilder(EMPTY_CV);
    }
  }, [authed, router, enterBuilder]);

  const cvJob = jobs.find((j) => j.id === cvJobId) ?? null;
  const showResult = !!cvJob && !tailoring && !!tailoredCV;
  const showEmpty = !cvJob && !tailoring;

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#fffefb", display: "flex", flexDirection: "column", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#201515" }}>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />

      {/* Header */}
      <header className="opp-header" style={{ position: "sticky", top: 0, zIndex: 20, background: "#fffefb", borderBottom: "1px solid rgba(32,21,21,0.12)", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>opportunity<span style={{ color: PRIMARY }}>.</span></div>
        <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="#" className="opp-hide-mobile" style={{ fontSize: 16, textDecoration: "none", color: "#605d52" }}>For employers</a>
          {authed ? (
            <Link href="/cv" style={{ fontSize: 16, textDecoration: "none", color: "#605d52" }}>My CVs</Link>
          ) : (
            <Link href="/login" style={{ fontSize: 16, textDecoration: "none", color: "#605d52" }}>Sign in</Link>
          )}
          <button type="button" className="opp-post-btn" style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "12px 24px", borderRadius: 12, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", fontFamily: "inherit" }}>
            Post a job
          </button>
        </nav>
      </header>

      {/* Hero + search */}
      <div className="opp-hero" style={{ padding: "64px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: PRIMARY, marginBottom: 12 }}>Morocco&apos;s job board</div>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(32px, 6vw, 56px)", lineHeight: 1.05, fontWeight: 500, maxWidth: 680 }}>Find work you actually want</h1>
        <p style={{ margin: "0 0 32px", fontSize: "clamp(16px, 3vw, 20px)", lineHeight: 1.5, letterSpacing: "-0.2px", color: "#605d52", maxWidth: 480 }}>
          Search open roles across Morocco, then drag one into your CV and let AI tailor it to the job — no account needed to try it.
        </p>

        <div className="opp-search" style={{ width: "100%", maxWidth: 720, display: "flex", alignItems: "center", background: "#f8f4f0", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 6, gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexGrow: 1, padding: "8px 12px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Job title, skill or company" style={{ border: "none", outline: "none", fontSize: 16, fontFamily: "inherit", width: "100%", color: "#201515", background: "transparent" }} />
          </div>
          <div className="opp-search-divider" style={{ width: 1, height: 24, background: "rgba(32,21,21,0.12)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", minWidth: 160 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <span style={{ fontSize: 16, color: "#605d52" }}>All of Morocco</span>
          </div>
          <button type="button" className="opp-search-btn" style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "12px 24px", borderRadius: 6, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
            Search
          </button>
        </div>
      </div>

      {/* Two-column workspace */}
      <div className="opp-workspace" style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "8px 24px 32px", display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(380px, 1.15fr)", gap: 24, alignItems: "start" }}>

        {/* Left: job feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 14, color: "#605d52" }}>
            {jobs.length} open roles · drag any card into your CV
            {usingPlaceholders && <span style={{ color: "#c5a15a" }}> (sample listings — connect real postings)</span>}
          </div>

          {jobs.map((job) => {
            const isExpanded = expandedId === job.id;
            return (
              <div
                key={job.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", job.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                style={{ background: "#f8f4f0", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 24, cursor: "grab" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 24, lineHeight: "30px", fontWeight: 600, letterSpacing: "-0.6px", marginBottom: 4 }}>{job.title}</div>
                    <div style={{ fontSize: 16, lineHeight: "24px", color: "#605d52" }}>{job.company} · {job.location} · {job.job_type}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, background: "#fffefb", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 9999, padding: "4px 12px", whiteSpace: "nowrap" }}>{job.salary_range}</div>
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
                  {job.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 14, color: "#605d52", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 9999, padding: "3px 12px" }}>{tag}</span>
                  ))}
                </div>

                {isExpanded && (
                  <p style={{ fontSize: 16, lineHeight: "24px", color: "#36342e", margin: "14px 0 0", paddingTop: 14, borderTop: "1px solid rgba(32,21,21,0.12)" }}>{job.description}</p>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(32,21,21,0.12)" }}>
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : job.id)} style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2, fontFamily: "inherit" }}>
                    {isExpanded ? "Hide details" : "View details"}
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#939084" }}>
                    <span style={{ fontSize: 14 }}>Drag to CV</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: CV space */}
        <div className="opp-cv-panel" style={{ position: "sticky", top: 88 }}>
          <div style={{ background: "#f8f4f0", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 20, lineHeight: "25px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>Your CV</div>
            <p style={{ fontSize: 16, lineHeight: "24px", color: "#605d52", margin: "0 0 24px" }}>Drag a job from the left and we&apos;ll tailor your CV to it. No account needed until you download.</p>

            {uploadError && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13.5, display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span>⚠ {uploadError}</span>
                <button type="button" onClick={() => setUploadError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: 15 }}>×</button>
              </div>
            )}

            {showEmpty && (
              <div
                onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{ border: `2px dashed ${dragOver ? PRIMARY : "rgba(32,21,21,0.24)"}`, borderRadius: 12, padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, transition: "border-color 120ms", background: "#fffefb" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <div style={{ fontSize: 16, color: "#605d52", maxWidth: 220 }}>Drop a job here, or</div>
                <button type="button" onClick={handleUploadClick} disabled={uploading} style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: uploading ? "wait" : "pointer", fontFamily: "inherit", opacity: uploading ? 0.6 : 1 }}>
                  {uploading ? "Reading your CV…" : "Upload your CV"}
                </button>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); useSavedCV(); }}
                  style={{ fontSize: 14, color: "#605d52", textDecoration: "underline", textUnderlineOffset: 2 }}
                >
                  Use my saved CV instead
                </a>
              </div>
            )}

            {tailoring && (
              <div style={{ border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, background: "#fffefb" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9999, border: "3px solid rgba(32,21,21,0.12)", borderTopColor: PRIMARY, animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 16, color: "#36342e" }}>Tailoring your CV for <span style={{ fontWeight: 600 }}>{cvJob?.title}</span> at {cvJob?.company}…</div>
              </div>
            )}

            {showResult && cvJob && tailoredCV && (
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: PRIMARY, color: "#fffefb", fontSize: 14, fontWeight: 600, borderRadius: 9999, padding: "5px 14px", marginBottom: 16 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fffefb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Tailored for {cvJob.title}
                </div>

                <div style={{ border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 20, background: "#fffefb" }}>
                  <div style={{ fontSize: 20, lineHeight: "25px", fontWeight: 700, letterSpacing: "-0.5px" }}>
                    {tailoredCV.profile.firstName || tailoredCV.profile.lastName
                      ? `${tailoredCV.profile.firstName} ${tailoredCV.profile.lastName}`.trim()
                      : "[Your name]"}
                  </div>
                  <div style={{ fontSize: 16, lineHeight: "24px", color: "#605d52", marginBottom: 16 }}>{cvJob.title} · {cvJob.location}</div>
                  <p style={{ fontSize: 16, lineHeight: "24px", color: "#36342e", margin: "0 0 16px" }}>
                    {tailoredCV.summary}
                  </p>

                  <div style={{ fontSize: 14, fontWeight: 600, color: "#605d52", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Key matches</div>
                  {cvJob.tags.map((tag) => (
                    <div key={tag} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: "#36342e", marginBottom: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      {tag}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => enterBuilder(tailoredCV, templateId ?? undefined)}
                    style={{ flexGrow: 1, fontSize: 18, lineHeight: "27px", fontWeight: 600, padding: 12, borderRadius: 12, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Continue in CV builder
                  </button>
                  <button type="button" onClick={() => { setCvJobId(null); setTailoring(false); setTailoredCV(null); setDragOver(false); }} style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: "pointer", fontFamily: "inherit" }}>
                    Start over
                  </button>
                </div>
                <p style={{ fontSize: 14, color: "#c5c0b1", margin: "12px 0 0" }}>Free to edit — sign in only when you&apos;re ready to download.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CV templates */}
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "32px 24px 96px", borderTop: "1px solid rgba(32,21,21,0.12)" }}>
        <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: PRIMARY, marginBottom: 8 }}>Pay once, no subscription</div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ fontSize: 32, lineHeight: "36px", fontWeight: 500, letterSpacing: 1 }}>Choose a CV template</div>
          <div style={{ fontSize: 16, color: "#605d52" }}>10 ATS-compatible templates · free to edit, pay only to download</div>
        </div>

        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
          {TEMPLATE_REGISTRY.map((tpl) => {
            const selected = templateId === tpl.id;
            return (
              <div key={tpl.id} style={{ flex: "0 0 200px", background: "#f8f4f0", border: `2px solid ${selected ? PRIMARY : "rgba(32,21,21,0.12)"}`, borderRadius: 12, padding: 12, position: "relative" }}>
                {selected && (
                  <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: 9999, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fffefb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}

                <div style={{ background: "#fffefb", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 8, height: 190, marginBottom: 10, overflow: "hidden" }}>
                  <TemplateThumb id={tpl.id} accent={tpl.accent} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <div style={{ fontSize: 16, lineHeight: "24px", fontWeight: 600 }}>{tpl.name}</div>
                  <span style={{ fontSize: 11, lineHeight: "15px", fontWeight: 700, letterSpacing: "0.144px", color: tpl.accent, background: hexToRgbaLite(tpl.accent), borderRadius: 9999, padding: "1px 8px", whiteSpace: "nowrap" }}>Pro</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: "21px", color: "#939084", marginBottom: 10 }}>{tpl.sub}</div>

                <button
                  type="button"
                  onClick={() => {
                    setTemplateId(tpl.id);
                    enterBuilder(useCVStore.getState().cv ?? EMPTY_CV, tpl.id);
                  }}
                  style={{ width: "100%", fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: 8, borderRadius: 8, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Use this template
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showLoginGate && <LoginGateModal onClose={() => setShowLoginGate(false)} />}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .opp-workspace { grid-template-columns: 1fr !important; }
          .opp-cv-panel  { position: static !important; top: auto !important; }
        }

        @media (max-width: 640px) {
          .opp-hero        { padding: 40px 16px 28px !important; }
          .opp-workspace   { padding: 8px 16px 24px !important; gap: 20px !important; }
          .opp-hide-mobile { display: none !important; }
          .opp-post-btn    { padding: 10px 16px !important; font-size: 13px !important; }
          .opp-header      { padding: 0 16px !important; }
          .opp-search      { flex-direction: column; align-items: stretch !important; padding: 10px !important; gap: 8px; }
          .opp-search-divider { display: none !important; }
          .opp-search-btn  { width: 100%; padding: 13px 0 !important; }
        }
      `}</style>
    </div>
  );
}

function hexToRgbaLite(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},0.1)`;
}
