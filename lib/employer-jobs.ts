import type { CountryCode } from "@/app/i18n";

export const EMPLOYER_COUNTRIES: CountryCode[] = ["MA", "FR", "DE", "BE", "NL", "SA"];
export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance", "Temporary"] as const;
export const APPLICATION_STATUSES = ["new", "viewed", "shortlisted", "rejected", "hired"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface JobInput {
  title: string; location: string; country: CountryCode; job_type: string; salary_range?: string;
  description: string; tags: string[]; apply_url?: string; company?: string;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+\n/g, "\n").trim().slice(0, max) : "");

/** Validate and normalise a posted job. Returns the cleaned input or a human-readable error. */
export function parseJobInput(raw: unknown): { ok: true; value: JobInput } | { ok: false; error: string } {
  const b = (raw ?? {}) as Record<string, unknown>;
  const title = clean(b.title, 120), location = clean(b.location, 100), description = clean(b.description, 10000);
  const country = String(b.country ?? "") as CountryCode;
  const job_type = clean(b.job_type, 30);
  if (title.length < 3) return { ok: false, error: "Add a job title." };
  if (!location) return { ok: false, error: "Add a location." };
  if (!EMPLOYER_COUNTRIES.includes(country)) return { ok: false, error: "Choose a country." };
  if (!(JOB_TYPES as readonly string[]).includes(job_type)) return { ok: false, error: "Choose a contract type." };
  if (description.length < 200) return { ok: false, error: "The description needs at least 200 characters: candidates need real detail." };
  const apply = clean(b.apply_url, 500);
  if (apply && !/^https?:\/\/[^\s]+$/i.test(apply)) return { ok: false, error: "The application link must start with http(s)://." };
  const tags = Array.isArray(b.tags) ? b.tags.map((t) => clean(t, 30)).filter(Boolean).slice(0, 8) : [];
  return { ok: true, value: { title, location, country, job_type, salary_range: clean(b.salary_range, 60) || undefined, description, tags, apply_url: apply || undefined, company: clean(b.company, 100) || undefined } };
}
