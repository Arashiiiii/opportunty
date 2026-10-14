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
import { readLocalDraft } from "./cv/_lib/local-draft";
import { TemplateCarousel } from "./TemplateCarousel";
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
  logo_url?: string | null;
  external_url?: string | null;
  original_url?: string | null;
}

const applyUrl = (j: Job) => j.external_url || j.original_url || null;

/** A CV counts as "there" once it has a name, summary or any experience. */
function cvHasContent(cv: CVData | null | undefined): cv is CVData {
  if (!cv) return false;
  return !!(cv.profile.firstName || cv.profile.lastName || cv.summary.trim() || cv.experience.length);
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

type CountryCode = "MA" | "FR" | "DE" | "BE" | "NL";
const COUNTRIES: { code: CountryCode; flag: string; name: string; hero: string }[] = [
  { code: "MA", flag: "🇲🇦", name: "Morocco", hero: "Morocco" },
  { code: "FR", flag: "🇫🇷", name: "France", hero: "France" },
  { code: "DE", flag: "🇩🇪", name: "Germany", hero: "Germany" },
  { code: "BE", flag: "🇧🇪", name: "Belgium", hero: "Belgium" },
  { code: "NL", flag: "🇳🇱", name: "Netherlands", hero: "the Netherlands" },
];
const COUNTRY_KEY = "opportunity_country_v1";

/** Fallback only for rows/DBs without a `country` value: guess from the location text. */
const CITY_COUNTRY: [CountryCode, RegExp][] = [
  ["MA", /morocco|maroc|casablanca|rabat|marrakesh|marrakech|tangier|tanger|agadir|f[eè]s\b|mekn[eè]s|oujda|t[eé]touan|kenitra|k[eé]nitra|settat|mellal|safi|el jadida|nador|laayoune|essaouira|mohammedia|sal[eé]\b/i],
  ["NL", /tilburg|den haag|the hague|enschede|utrecht|barendrecht|oldenzaal|gulpen|holland|amsterdam|rotterdam|eindhoven|groningen|breda|nijmegen|arnhem|almere|maastricht|delft|leiden|haarlem|zwolle|apeldoorn|nederland|netherlands/i],
  ["BE", /anderlecht|la hulpe|bruxelles|brussel|charleroi|braine|seneffe|gand\b|gent\b|mons\b|dinant|brabant|li[eè]ge|luik|antwerp|anvers|namur|leuven|louvain|mechelen|bruges|brugge|wavre|nivelles|belg/i],
  ["DE", /w[uü]rzburg|kehl|essen\b|wegscheid|monheim|g[oö]rlitz|marktsteft|bottrop|saarbr[uü]cken|papenburg|berlin|m[uü]nchen|munich|hamburg|k[oö]ln|cologne|frankfurt|stuttgart|d[uü]sseldorf|dortmund|bremen|hannover|leipzig|dresden|n[uü]rnberg|nuremberg|bonn|mannheim|karlsruhe|augsburg|wiesbaden|bochum|duisburg|deutschland|german/i],
  ["FR", /paris|toulouse|lyon|marseille|nice\b|nantes|bordeaux|lille|strasbourg|montpellier|rennes|grenoble|dijon|besan[cç]on|argenteuil|puteaux|dagneux|pornichet|beauvais|dunkerque|vitrolles|issy|v[eé]lizy|garenne|saint-vulbas|ch[aâ]lons|bron\b|ergu[eé]|france/i],
];
function inferCountry(location: string): CountryCode {
  for (const [c, re] of CITY_COUNTRY) if (re.test(location)) return c;
  return "FR";
}

export default function HomeClient() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [country, setCountry] = useState<CountryCode>("MA");
  const [jobs, setJobs] = useState<Job[]>(PLACEHOLDER_JOBS);
  const [feedLoading, setFeedLoading] = useState(false);
  const [query, setQuery] = useState("");
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
  const [homeCV, setHomeCV] = useState<CVData | null>(null);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setAuthed(!!user));

    // A CV the visitor already uploaded/created (in memory, or saved on this device).
    const inMemory = useCVStore.getState().cv;
    if (cvHasContent(inMemory)) {
      setHomeCV(inMemory);
    } else {
      const draft = readLocalDraft();
      if (draft && cvHasContent(draft.cv)) {
        useCVStore.getState().loadCV(draft.cv);
        setHomeCV(draft.cv);
      }
    }
  }, []);

  // Remembered country (client-only; first paint is Morocco to avoid hydration mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COUNTRY_KEY) as CountryCode | null;
      if (saved && COUNTRIES.some((c) => c.code === saved)) setCountry(saved);
    } catch { /* storage unavailable */ }
  }, []);

  // One country's feed at a time.
  useEffect(() => {
    let cancelled = false;
    setFeedLoading(true);
    const cols = "id, title, company, location, job_type, salary_range, tags, description, logo_url, external_url, original_url";
    (async () => {
      let rows: Job[] | null = null;
      const byCol = await supabase.from("jobs").select(cols).eq("is_active", true).eq("country", country)
        .order("created_at", { ascending: false }).limit(60);
      if (!byCol.error) {
        rows = (byCol.data ?? []) as Job[];
      } else {
        // `country` column not there yet → filter by guessed country instead.
        const all = await supabase.from("jobs").select(cols).eq("is_active", true)
          .order("created_at", { ascending: false }).limit(200);
        if (!all.error && all.data) rows = (all.data as Job[]).filter((j) => inferCountry(j.location) === country).slice(0, 60);
      }
      if (cancelled) return;
      if (rows && rows.length > 0) { setJobs(rows); setUsingPlaceholders(false); }
      else if (rows) { setJobs([]); setUsingPlaceholders(false); }
      else if (country === "MA") { setJobs(PLACEHOLDER_JOBS); setUsingPlaceholders(true); }
      else { setJobs([]); setUsingPlaceholders(false); }
      setExpandedId(null);
      setFeedLoading(false);
    })();
    return () => { cancelled = true; };
  }, [country]);

  const q = query.trim().toLowerCase();
  const visibleJobs = q
    ? jobs.filter((j) => [j.title, j.company, j.location, ...(j.tags ?? [])].some((t) => t?.toLowerCase().includes(q)))
    : jobs;

  const switchCountry = useCallback((c: CountryCode) => {
    setCountry(c);
    try { localStorage.setItem(COUNTRY_KEY, c); } catch { /* ignore */ }
  }, []);

  const enterBuilder = useCallback((cv: CVData, template?: TemplateId) => {
    const store = useCVStore.getState();
    store.loadCV(cv);
    if (template) { store.setTemplate(template); }
    markHandoff();
    router.push("/cv/builder");
  }, [router]);

  const runTailor = useCallback(async (job: Job, base: CVData) => {
    setCvJobId(job.id);
    setPendingJobId(null);
    setTailoredCV(null);
    setTailoring(true);
    try {
      const res = await fetch("/api/cv/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: base, job }),
      });
      const json = await res.json();
      setTailoredCV(res.ok && json.cv ? (json.cv as CVData) : tailorCVForJob(base, job));
    } catch {
      setTailoredCV(tailorCVForJob(base, job));
    } finally {
      setTailoring(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData("text/plain");
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    // Tailoring needs a CV to work from — ask for one instead of tailoring a blank page.
    if (!homeCV) {
      setPendingJobId(job.id);
      return;
    }
    void runTailor(job, homeCV);
  }, [jobs, homeCV, runTailor]);

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
      const parsed = json.cv as CVData;
      useCVStore.getState().loadCV(parsed);
      setHomeCV(parsed);
      const pending = jobs.find((j) => j.id === pendingJobId);
      if (pending) await runTailor(pending, parsed);
    } catch {
      setUploadError("Upload failed — check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }, [jobs, pendingJobId, runTailor]);

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
  const pendingJob = jobs.find((j) => j.id === pendingJobId) ?? null;
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
      <div className="opp-hero" style={{ padding: "40px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div className="opp-search" style={{ width: "100%", maxWidth: 720, marginBottom: 32, display: "flex", alignItems: "center", background: "#f8f4f0", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 6, gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexGrow: 1, padding: "8px 12px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Job title, skill or company" style={{ border: "none", outline: "none", fontSize: 16, fontFamily: "inherit", width: "100%", color: "#201515", background: "transparent" }} />
          </div>
          <div className="opp-search-divider" style={{ width: 1, height: 24, background: "rgba(32,21,21,0.12)" }} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", minWidth: 190, cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <select
              aria-label="Country"
              value={country}
              onChange={(e) => switchCountry(e.target.value as CountryCode)}
              style={{ flexGrow: 1, border: "none", outline: "none", background: "transparent", fontSize: 16, fontFamily: "inherit", color: "#201515", cursor: "pointer", appearance: "auto" }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </label>
          <button type="button" className="opp-search-btn" style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "12px 24px", borderRadius: 6, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
            Search
          </button>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: PRIMARY, marginBottom: 12 }}>Job board · Morocco &amp; Europe</div>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(32px, 6vw, 56px)", lineHeight: 1.05, fontWeight: 500, maxWidth: 680 }}>Find work you actually want</h1>
        <p style={{ margin: "0", fontSize: "clamp(16px, 3vw, 20px)", lineHeight: 1.5, letterSpacing: "-0.2px", color: "#605d52", maxWidth: 480 }}>
          Pick a country, browse its open roles, then drag one into your CV and let AI tailor it to the job — no account needed to try it.
        </p>

      </div>

      {/* CV templates */}
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "0 24px 32px" }}>
        <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: PRIMARY, marginBottom: 8 }}>Pay once, no subscription</div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ fontSize: 32, lineHeight: "36px", fontWeight: 500, letterSpacing: 1 }}>Choose a CV template</div>
          <div style={{ fontSize: 16, color: "#605d52" }}>10 ATS-compatible templates · free to edit, pay only to download</div>
        </div>

        <TemplateCarousel
          templates={TEMPLATE_REGISTRY.map((t) => ({ id: t.id, name: t.name, sub: t.sub, accent: t.accent }))}
          onUse={(id) => {
            const tid = id as TemplateId;
            setTemplateId(tid);
            enterBuilder(useCVStore.getState().cv ?? EMPTY_CV, tid);
          }}
        />
      </div>

      {/* Two-column workspace */}
      <div className="opp-workspace" style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "8px 24px 96px", display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(380px, 1.15fr)", gap: 24, alignItems: "start" }}>

        {/* Left: job feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div role="tablist" aria-label="Country" className="opp-country-tabs" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {COUNTRIES.map((c) => {
              const active = c.code === country;
              return (
                <button
                  key={c.code}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchCountry(c.code)}
                  style={{
                    flex: "0 0 auto", display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999,
                    border: active ? `1px solid ${PRIMARY}` : "1px solid rgba(32,21,21,0.12)",
                    background: active ? PRIMARY : "#f8f4f0", color: active ? "#fffefb" : "#201515",
                    fontSize: 14.4, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{c.flag}</span>{c.name}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: 14, color: "#605d52" }}>
            {feedLoading ? "Loading…" : `${visibleJobs.length} open roles in ${COUNTRIES.find((c) => c.code === country)!.hero}`} · drag any card into your CV
            {usingPlaceholders && <span style={{ color: "#c5a15a" }}> (sample listings — connect real postings)</span>}
          </div>

          {!feedLoading && visibleJobs.length === 0 && (
            <div style={{ background: "#f8f4f0", border: "1px dashed rgba(32,21,21,0.2)", borderRadius: 12, padding: 32, textAlign: "center", color: "#605d52", fontSize: 16 }}>
              {q ? `No roles matching “${query.trim()}” in ${COUNTRIES.find((c) => c.code === country)!.name}.` : `No open roles in ${COUNTRIES.find((c) => c.code === country)!.name} yet — check back soon, or try another country.`}
            </div>
          )}

          {visibleJobs.map((job) => {
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
                  <div style={{ display: "flex", gap: 14, minWidth: 0 }}>
                    <CompanyLogo company={job.company} logoUrl={job.logo_url} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 24, lineHeight: "30px", fontWeight: 600, letterSpacing: "-0.6px", marginBottom: 4 }}>{job.title}</div>
                      <div style={{ fontSize: 16, lineHeight: "24px", color: "#605d52" }}>{job.company} · {job.location} · {job.job_type}</div>
                    </div>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {applyUrl(job) ? (
                      <a href={applyUrl(job)!} target="_blank" rel="noopener noreferrer" className="opp-apply" style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "9px 20px", borderRadius: 9999, border: "1.5px solid #201515", background: "#201515", color: "#fffefb", textDecoration: "none", whiteSpace: "nowrap" }}>
                        Apply ↗
                      </a>
                    ) : (
                      <span title="Sample listing — no application link" style={{ fontSize: 14.4, fontWeight: 700, padding: "9px 20px", borderRadius: 9999, border: "1.5px solid rgba(32,21,21,0.2)", color: "#a39c8f", whiteSpace: "nowrap", cursor: "not-allowed" }}>Apply</span>
                    )}
                    <span className="opp-drag-pill" title="Drag this job onto your CV" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.4, fontWeight: 800, letterSpacing: "0.2px", padding: "9px 16px 9px 12px", borderRadius: 9999, background: "linear-gradient(135deg, #ff4f00, #ff8a3d)", color: "#fffefb", whiteSpace: "nowrap", userSelect: "none" }}>
                      <svg width="14" height="16" viewBox="0 0 14 18" fill="#fffefb"><circle cx="4" cy="3" r="1.6" /><circle cx="10" cy="3" r="1.6" /><circle cx="4" cy="9" r="1.6" /><circle cx="10" cy="9" r="1.6" /><circle cx="4" cy="15" r="1.6" /><circle cx="10" cy="15" r="1.6" /></svg>
                      Drag to CV
                      <span className="opp-drag-arrow" aria-hidden>→</span>
                    </span>
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

            {showEmpty && !homeCV && (
              <div
                onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{ border: `2px dashed ${pendingJob || dragOver ? PRIMARY : "rgba(32,21,21,0.24)"}`, borderRadius: 12, padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, transition: "border-color 120ms", background: "#fffefb" }}
              >
                {pendingJob ? (
                  <div style={{ background: "#fff1e8", border: "1px solid #ffcbab", borderRadius: 10, padding: "10px 14px", fontSize: 14.5, color: "#8a3a10", lineHeight: 1.45 }}>
                    To tailor your CV for <b>{pendingJob.title}</b> at {pendingJob.company}, first add your CV below.
                  </div>
                ) : (
                  <div style={{ fontSize: 16, color: "#605d52", maxWidth: 300 }}>Start with your CV — then drag any job here to tailor it.</div>
                )}
                <button type="button" onClick={handleUploadClick} disabled={uploading} style={{ width: "100%", maxWidth: 260, fontSize: 15, fontWeight: 700, padding: "13px 24px", borderRadius: 12, border: "none", background: PRIMARY, color: "#fffefb", cursor: uploading ? "wait" : "pointer", fontFamily: "inherit", opacity: uploading ? 0.7 : 1 }}>
                  {uploading ? "Reading your CV…" : "Upload your CV"}
                </button>
                <div style={{ fontSize: 13, color: "#939084" }}>PDF or DOCX · or</div>
                <button type="button" onClick={() => enterBuilder(EMPTY_CV)} style={{ width: "100%", maxWidth: 260, fontSize: 14.4, fontWeight: 700, padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: "pointer", fontFamily: "inherit" }}>
                  Create one from scratch
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

            {showEmpty && homeCV && (
              <div
                onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{ border: `2px dashed ${dragOver ? PRIMARY : "rgba(32,21,21,0.24)"}`, borderRadius: 12, padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, transition: "border-color 120ms", background: dragOver ? "#fff1e8" : "#fffefb" }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#e8f7ee", color: "#166534", fontSize: 13.5, fontWeight: 700, borderRadius: 9999, padding: "4px 12px" }}>✓ CV ready</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {`${homeCV.profile.firstName} ${homeCV.profile.lastName}`.trim() || "Your CV"}
                </div>
                {homeCV.profile.title && <div style={{ fontSize: 14.5, color: "#605d52", marginTop: -6 }}>{homeCV.profile.title}</div>}
                <div style={{ fontSize: 16, color: PRIMARY, fontWeight: 700 }}>{dragOver ? "Drop it!" : "Now drag a job here to tailor it →"}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  <button type="button" onClick={() => enterBuilder(homeCV, templateId ?? undefined)} style={{ fontSize: 14.4, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "none", background: "#201515", color: "#fffefb", cursor: "pointer", fontFamily: "inherit" }}>Open in builder</button>
                  <button type="button" onClick={handleUploadClick} disabled={uploading} style={{ fontSize: 14.4, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: uploading ? "wait" : "pointer", fontFamily: "inherit" }}>{uploading ? "Reading…" : "Replace CV"}</button>
                </div>
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

      {showLoginGate && <LoginGateModal onClose={() => setShowLoginGate(false)} />}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes oppNudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
        @keyframes oppGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,79,0,0.45); } 60% { box-shadow: 0 0 0 9px rgba(255,79,0,0); } }
        .opp-drag-pill { cursor: grab; animation: oppGlow 2.2s ease-out infinite; transition: transform 140ms; }
        .opp-drag-pill:hover { transform: translateY(-2px) rotate(-2deg) scale(1.04); }
        .opp-drag-arrow { display: inline-block; animation: oppNudge 1.1s ease-in-out infinite; }
        .opp-apply { transition: transform 140ms, background 140ms; }
        .opp-apply:hover { transform: translateY(-1px); background: #ff4f00 !important; border-color: #ff4f00 !important; }

        .opp-tpl-card { transition: transform .15s ease; }
        .opp-tpl-card:hover { transform: translateY(-3px); }
        .opp-tpl-fade { animation: oppFade .25s ease; }
        @keyframes oppFade { from { opacity: .4 } to { opacity: 1 } }
        @media (max-width: 900px) {
          .opp-tpl-showcase { grid-template-columns: 1fr !important; }
          .opp-tpl-showcase > div:first-child { max-width: 320px; margin: 0 auto; width: 100%; }
          .opp-tpl-grid { grid-template-columns: repeat(5, 1fr) !important; }
          .opp-workspace { grid-template-columns: 1fr !important; }
          .opp-cv-panel  { position: static !important; top: auto !important; }
        }

        @media (max-width: 640px) {
          .opp-hero        { padding: 40px 16px 28px !important; }
          .opp-workspace   { padding: 8px 16px 24px !important; gap: 20px !important; }
          .opp-hide-mobile { display: none !important; }
          .opp-tpl-grid { grid-template-columns: repeat(3, 1fr) !important; }
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

const LOGO_COLORS = ["#ff4f00", "#0f766e", "#7c3aed", "#be123c", "#1d4ed8", "#b45309", "#047857", "#9333ea"];

/** Company logo from the listing, falling back to a branded initials tile. */
function CompanyLogo({ company, logoUrl }: { company: string; logoUrl?: string | null }) {
  const [failed, setFailed] = useState(false);
  const size = 48;
  if (logoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${company} logo`}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: 10, objectFit: "contain", background: "#fffefb", border: "1px solid rgba(32,21,21,0.12)", flexShrink: 0 }}
      />
    );
  }
  let h = 0;
  for (const ch of company) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const color = LOGO_COLORS[h % LOGO_COLORS.length];
  const initials = company.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <div aria-hidden style={{ width: size, height: size, borderRadius: 10, background: color, color: "#fffefb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, letterSpacing: 0.5, flexShrink: 0 }}>
      {initials}
    </div>
  );
}
