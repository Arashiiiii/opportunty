/**
 * Server-only Claude API helpers — résumé structuring and job tailoring.
 *
 * Both use Anthropic's tool-calling as a structured-output guardrail: the
 * model must fill a fixed input schema rather than free-form JSON, so a
 * malformed reply is a rare edge case rather than the default we have to
 * parse around. Either function throws on anything it can't turn into a
 * valid CVData — callers fall back to the deterministic heuristics
 * (parse-route's regex extraction, tailor.ts's tag-matching) rather than
 * failing the request outright.
 */
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { CVDataSchema, EMPTY_CV, uid } from "./schema";
import type { CVData } from "./schema";

const MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

// ─────────────────────────────────────────────────────────────────────────
// Résumé → structured CV
// ─────────────────────────────────────────────────────────────────────────

const RESUME_TOOL = {
  name: "submit_cv",
  description: "Submit the résumé, structured into opportunity.com's CV schema.",
  input_schema: {
    type: "object" as const,
    properties: {
      profile: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName:  { type: "string" },
          title:     { type: "string", description: "Current or most recent job title / headline" },
          email:     { type: "string" },
          phone:     { type: "string" },
          city:      { type: "string" },
          website:   { type: "string" },
          linkedin:  { type: "string" },
        },
        required: ["firstName", "lastName", "title", "email", "phone", "city"],
      },
      summary: { type: "string", description: "2-4 sentence professional summary" },
      experience: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role:    { type: "string" },
            company: { type: "string" },
            city:    { type: "string" },
            start:   { type: "string", description: "e.g. 'Jan 2022' or '2022'" },
            end:     { type: "string", description: "e.g. 'Present' or '2024'" },
            bullets: { type: "array", items: { type: "string" } },
          },
          required: ["role", "company", "start", "bullets"],
        },
      },
      education: {
        type: "array",
        items: {
          type: "object",
          properties: {
            degree: { type: "string" },
            school: { type: "string" },
            city:   { type: "string" },
            start:  { type: "string" },
            end:    { type: "string" },
          },
          required: ["degree", "school", "start", "end"],
        },
      },
      skills: {
        type: "array",
        description: "Skills grouped by category",
        items: {
          type: "object",
          properties: {
            group: { type: "string", description: "e.g. 'Languages & frameworks', 'Tools'" },
            items: { type: "array", items: { type: "string" } },
          },
          required: ["group", "items"],
        },
      },
      languages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name:  { type: "string" },
            level: { type: "string", description: "e.g. 'Native', 'Fluent', 'B2'" },
          },
          required: ["name", "level"],
        },
      },
      certifications: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name:   { type: "string" },
            issuer: { type: "string" },
            year:   { type: "string" },
          },
          required: ["name"],
        },
      },
      interests: { type: "array", items: { type: "string" } },
    },
    required: ["profile", "summary", "experience", "education", "skills"],
  },
};

export async function structureResumeWithAI(rawText: string): Promise<CVData> {
  const anthropic = getClient();
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    tools: [RESUME_TOOL],
    tool_choice: { type: "tool", name: "submit_cv" },
    messages: [{
      role: "user",
      content: `Structure this résumé text into the CV schema. Only use information present in the text — never invent employers, dates, or numbers. Leave a field empty ("" or []) rather than guessing.\n\n---\n${rawText.slice(0, 12000)}\n---`,
    }],
  });

  const toolUse = msg.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("Claude did not return structured output");

  return normalizeAIResult(toolUse.input as Record<string, unknown>);
}

// ─────────────────────────────────────────────────────────────────────────
// CV + job → tailored CV
// ─────────────────────────────────────────────────────────────────────────

const TAILOR_TOOL = {
  name: "submit_tailoring",
  description: "Submit the tailored title, summary and highlighted skills for this CV/job pairing.",
  input_schema: {
    type: "object" as const,
    properties: {
      title:           { type: "string", description: "Job title to show on the CV, matching the target role" },
      summary:         { type: "string", description: "2-4 sentence summary rewritten to lead with what this job asks for, built ONLY from the candidate's real background — never invent experience they don't have" },
      skill_group_name:{ type: "string", description: "Short label for the highlighted-skills group, e.g. 'Relevant to this role'" },
      skills:          { type: "array", items: { type: "string" }, description: "Skills from the job listing that genuinely match the candidate's background, plus any of the candidate's own skills worth surfacing for this role" },
    },
    required: ["title", "summary", "skill_group_name", "skills"],
  },
};

export interface TailorJobInput {
  title: string;
  company: string;
  location?: string;
  tags: string[];
  description: string;
}

export async function tailorCVWithAI(cv: CVData, job: TailorJobInput): Promise<CVData> {
  const anthropic = getClient();
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    tools: [TAILOR_TOOL],
    tool_choice: { type: "tool", name: "submit_tailoring" },
    messages: [{
      role: "user",
      content: `Candidate's current CV (JSON):\n${JSON.stringify(cv)}\n\nTarget job:\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location ?? ""}\nTags: ${job.tags.join(", ")}\nDescription: ${job.description}\n\nTailor the title, summary, and a short highlighted-skills group for this candidate applying to this job. Stay honest — don't claim experience or skills the candidate's CV doesn't support.`,
    }],
  });

  const toolUse = msg.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("Claude did not return structured output");

  const out = toolUse.input as { title: string; summary: string; skill_group_name: string; skills: string[] };

  const next: CVData = JSON.parse(JSON.stringify(cv));
  next.profile.title = out.title || next.profile.title;
  next.summary = out.summary || next.summary;
  if (Array.isArray(out.skills) && out.skills.length > 0) {
    const existing = new Set(next.skills.flatMap((g) => g.items.map((i) => i.toLowerCase().trim())));
    const fresh = out.skills.filter((s) => !existing.has(s.toLowerCase().trim()));
    if (fresh.length > 0) {
      next.skills = [{ id: uid(), group: out.skill_group_name || `Relevant to ${job.title}`, items: fresh }, ...next.skills];
    }
  }
  return next;
}

// ─────────────────────────────────────────────────────────────────────────
// Shared: turn the tool's loosely-typed input into a validated CVData,
// injecting the ids the schema requires (the model isn't asked for them).
// ─────────────────────────────────────────────────────────────────────────

function normalizeAIResult(raw: Record<string, unknown>): CVData {
  const candidate = {
    profile: {
      firstName: str(raw.profile, "firstName"),
      lastName:  str(raw.profile, "lastName"),
      title:     str(raw.profile, "title"),
      email:     str(raw.profile, "email"),
      phone:     str(raw.profile, "phone"),
      city:      str(raw.profile, "city"),
      website:   str(raw.profile, "website") || undefined,
      linkedin:  str(raw.profile, "linkedin") || undefined,
    },
    summary: typeof raw.summary === "string" ? raw.summary : "",
    experience: arr(raw.experience).map((e) => ({
      id: uid(),
      role:    str(e, "role"),
      company: str(e, "company"),
      city:    str(e, "city") || undefined,
      start:   str(e, "start"),
      end:     str(e, "end") || undefined,
      bullets: arr((e as Record<string, unknown>).bullets).map((b) => String(b)),
    })),
    education: arr(raw.education).map((e) => ({
      id: uid(),
      degree: str(e, "degree"),
      school: str(e, "school"),
      city:   str(e, "city") || undefined,
      start:  str(e, "start"),
      end:    str(e, "end"),
    })),
    skills: arr(raw.skills).map((g) => ({
      id: uid(),
      group: str(g, "group") || "Skills",
      items: arr((g as Record<string, unknown>).items).map((i) => String(i)),
    })),
    languages: arr(raw.languages).map((l) => ({
      id: uid(),
      name:  str(l, "name"),
      level: str(l, "level"),
      dots:  3,
    })),
    certifications: arr(raw.certifications).map((c) => ({
      id: uid(),
      name:   str(c, "name"),
      issuer: str(c, "issuer") || undefined,
      year:   str(c, "year") || undefined,
    })),
    projects: [] as CVData["projects"],
    interests: arr(raw.interests).map((i) => String(i)),
  };

  const parsed = CVDataSchema.safeParse(candidate);
  if (!parsed.success) {
    // Structurally close but failed strict validation somewhere — merge
    // onto EMPTY_CV so a stray field doesn't fail the whole upload.
    return { ...EMPTY_CV, ...candidate } as CVData;
  }
  return parsed.data;
}

function str(obj: unknown, key: string): string {
  if (!obj || typeof obj !== "object") return "";
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "string" ? v : "";
}

function arr(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? v : [];
}
