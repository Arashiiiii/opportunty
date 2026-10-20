import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";
import { idFromSlug } from "@/lib/jobs-seo";

// Renders a job as a "card" image (same look as the job cards on the site).
// Used by the social-video workflow: GET /api/job-card/<job id>[?w=960] → PNG with a transparent background.
export const revalidate = 3600;

const INK = "#0e1a21";
const ORANGE = "#0079a8";

/** Logos come from third-party hosts; satori only draws png/jpeg, so anything else falls back to the initial. */
async function logoDataUri(url: string | null): Promise<string | null> {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = (r.headers.get("content-type") ?? "").split(";")[0];
    if (!r.ok || !["image/png", "image/jpeg"].includes(type)) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 600_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch { return null; }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = idFromSlug(raw) ?? raw;
  const { data: job } = await createPublicClient()
    .from("jobs").select("id,title,company,location,salary_range,logo_url").eq("id", id).eq("is_active", true).maybeSingle();
  if (!job) return new Response("Not found", { status: 404 });

  // satori cannot shape Arabic, so those jobs get no card (the video workflow falls back to plain text).
  if (/[\u0600-\u06FF]/.test(`${job.title}${job.company}${job.location ?? ""}`)) return new Response("Unsupported script", { status: 422 });

  const w = Math.min(1400, Math.max(600, Number(new URL(req.url).searchParams.get("w")) || 960));
  const k = w / 960;                       // everything below is designed at 960px wide
  const px = (n: number) => Math.round(n * k);
  const logo = await logoDataUri(job.logo_url);
  const title = job.title.length > 80 ? job.title.slice(0, 77).trimEnd() + "…" : job.title;
  const sub = [job.company, (job.location ?? "").split(",")[0].trim()].filter(Boolean).join(" · ");
  const h = px(salaryHeight(!!job.salary_range));

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f3f2ed", borderRadius: px(36), border: `${px(3)}px solid #e3e8eb`, padding: px(40), fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", gap: px(28), alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: px(132), height: px(132), flexShrink: 0, background: "#fff", border: `${px(2)}px solid #e3e8eb`, borderRadius: px(26), overflow: "hidden" }}>
            {logo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={logo} alt="" width={px(104)} height={px(104)} style={{ objectFit: "contain" }} />
              : <div style={{ display: "flex", fontSize: px(60), fontWeight: 800, color: ORANGE }}>{(job.company || "?").trim().charAt(0).toUpperCase()}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: px(12), flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", fontSize: px(46), fontWeight: 800, lineHeight: 1.12, color: INK }}>{title}</div>
            <div style={{ display: "flex", fontSize: px(28), color: "#4a5b66" }}>{sub}</div>
            {job.salary_range && (
              <div style={{ display: "flex", marginTop: px(4) }}>
                <div style={{ display: "flex", fontSize: px(26), fontWeight: 700, color: "#166534", background: "#dcfce7", borderRadius: 9999, padding: `${px(6)}px ${px(18)}px` }}>{job.salary_range}</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: px(28), fontWeight: 700, color: INK, textDecoration: "underline" }}>View details</div>
          <div style={{ display: "flex", gap: px(16) }}>
            <div style={{ display: "flex", fontSize: px(28), fontWeight: 800, color: "#ffffff", background: INK, borderRadius: 9999, padding: `${px(16)}px ${px(38)}px` }}>Apply ↗</div>
            <div style={{ display: "flex", fontSize: px(28), fontWeight: 800, color: "#fff", background: ORANGE, borderRadius: 9999, padding: `${px(16)}px ${px(38)}px` }}>Drag to CV →</div>
          </div>
        </div>
      </div>
    ),
    { width: w, height: h, headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } },
  );
}

function salaryHeight(hasSalary: boolean) { return hasSalary ? 440 : 390; }
