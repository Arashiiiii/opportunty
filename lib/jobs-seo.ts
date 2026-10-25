/**
 * Everything the public job pages need: slugs, descriptions, country, and the
 * schema.org JobPosting JSON-LD that makes jobs eligible for Google Jobs.
 */
import { inferCountry } from "@/app/_lib/country";
import type { CountryCode } from "@/app/i18n";
import { SITE_URL } from "./site";

export interface JobRow {
  id: string; title: string; company: string; location: string | null; job_type: string | null; salary_range: string | null;
  tags: string[] | null; description: string | null; external_url: string | null; original_url: string | null;
  logo_url: string | null; created_at: string; updated_at: string | null; Country: string | null;
}
export const JOB_COLUMNS = "id,title,company,location,job_type,salary_range,tags,description,external_url,original_url,logo_url,created_at,updated_at,Country";

export const COUNTRY_INFO: Record<CountryCode, { slug: string; name: string; iso: string; demonym: string }> = {
  MA: { slug: "morocco", name: "Morocco", iso: "MA", demonym: "Moroccan" },
  FR: { slug: "france", name: "France", iso: "FR", demonym: "French" },
  DE: { slug: "germany", name: "Germany", iso: "DE", demonym: "German" },
  BE: { slug: "belgium", name: "Belgium", iso: "BE", demonym: "Belgian" },
  NL: { slug: "netherlands", name: "Netherlands", iso: "NL", demonym: "Dutch" },
  SA: { slug: "saudi-arabia", name: "Saudi Arabia", iso: "SA", demonym: "Saudi" },
};
export const COUNTRY_BY_SLUG = Object.fromEntries(Object.entries(COUNTRY_INFO).map(([code, v]) => [v.slug, code as CountryCode])) as Record<string, CountryCode>;

export function countryOf(j: Pick<JobRow, "location" | "Country">): CountryCode {
  const c = (j.Country ?? "").trim().toUpperCase();
  if (c in COUNTRY_INFO) return c as CountryCode;
  return inferCountry(j.location ?? "");
}

export function slugify(s: string, max = 70): string {
  const out = s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
  return out.slice(0, max).replace(/-+$/g, "");
}

const UUID_END = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
export function jobSlug(j: Pick<JobRow, "id" | "title" | "company" | "location">): string {
  const base = slugify([j.title, j.company, (j.location ?? "").split(",")[0]].filter(Boolean).join(" "));
  return `${base || "job"}-${j.id}`;
}
export const jobPath = (j: Pick<JobRow, "id" | "title" | "company" | "location">) => `/jobs/${jobSlug(j)}`;
export function idFromSlug(slug: string): string | null {
  const m = decodeURIComponent(slug).match(UUID_END);
  return m ? m[1] : null;
}

/** Source descriptions are messy scraped text: normalise whitespace into clean paragraphs. */
export function descriptionParagraphs(d: string | null): string[] {
  if (!d) return [];
  return d.replace(/\r/g, "").split(/\n\s*\n+/).map((p) => p.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n")).filter(Boolean);
}

export function metaDescription(j: JobRow): string {
  const place = j.location ? ` in ${j.location}` : "";
  const first = descriptionParagraphs(j.description)[0]?.replace(/\s+/g, " ") ?? "";
  const base = `${j.title} at ${j.company}${place}. `;
  return (base + first).slice(0, 158).replace(/\s+\S*$/, "") + (base.length + first.length > 158 ? "…" : "");
}

const TYPE_MAP: [RegExp, string][] = [
  [/full|vollzeit|voltijd|temps plein/i, "FULL_TIME"], [/part|temps partiel|teilzeit|deeltijd/i, "PART_TIME"], [/contract|cdd|freelance|interim|intérim|zzp/i, "CONTRACTOR"],
  [/intern|stage|stagiaire|praktikum|werkstudent/i, "INTERN"], [/temp/i, "TEMPORARY"],
];

/**
 * employmentType for JobPosting. The scraped job_type column is empty, so read it from what the posting
 * itself says: the title for internships, explicit full/part-time wording anywhere. No match → omit the field
 * (we never guess).
 */
export function employmentTypeOf(j: Pick<JobRow, "job_type" | "title" | "description">): string | undefined {
  const fromCol = TYPE_MAP.find(([re]) => re.test(j.job_type ?? ""))?.[1];
  if (fromCol) return fromCol;
  if (/\b(intern|internship|stagiaire|stage|praktikum|werkstudent|stagiair)\b/i.test(j.title)) return "INTERN";
  const text = `${j.title} ${j.description ?? ""}`;
  const full = /\b(full[- ]?time|vollzeit|voltijd|temps plein|cdi)\b/i.test(text);
  const part = /\b(part[- ]?time|teilzeit|deeltijd|temps partiel)\b/i.test(text);
  if (full && !part) return "FULL_TIME";
  if (part && !full) return "PART_TIME";
  if (/\b(freelance|zzp|cdd)\b/i.test(text) && !full && !part) return "CONTRACTOR";
  return undefined;
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function jobPostingJsonLd(j: JobRow, url: string) {
  const code = countryOf(j);
  const remote = /remote|télétravail|teletravail|عن بعد/i.test(`${j.location ?? ""} ${j.title}`);
  const posted = new Date(j.created_at);
  const validThrough = new Date(posted.getTime() + 45 * 86400_000);
  const type = employmentTypeOf(j);
  const html = descriptionParagraphs(j.description).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("") || `<p>${esc(j.title)} — ${esc(j.company)}</p>`;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: j.title,
    description: html,
    datePosted: posted.toISOString(),
    validThrough: validThrough.toISOString(),
    ...(type ? { employmentType: type } : {}),
    identifier: { "@type": "PropertyValue", name: j.company, value: j.id },
    hiringOrganization: { "@type": "Organization", name: j.company, ...(j.logo_url ? { logo: j.logo_url } : {}) },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: (j.location ?? "").split(",")[0] || undefined, addressCountry: COUNTRY_INFO[code].iso },
    },
    ...(remote ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: COUNTRY_INFO[code].name } } : {}),
    directApply: false,
    url,
  };
}

export const absolute = (path: string) => `${SITE_URL}${path}`;
