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
import type { TailorReport } from "./tailor-report";
import { CVDataSchema, EMPTY_CV, uid } from "./schema";
import type { CVData } from "./schema";
import { polishLine, polishParagraph } from "./polish";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

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

/** Writing-quality rules shared by every prompt whose output lands on a CV. */
const WRITING_RULES = `Writing quality (mandatory): every string you output must be grammatically correct, correctly spelled and properly punctuated in its own language, and read like polished professional CV prose written by a native speaker.
Verb form (mandatory): use the INFINITIVE for every verb, in every experience bullet, project description and other list-style line. French: infinitif ("Piloter une équipe de 5 développeurs", "Concevoir et déployer des API REST"). English: the base/infinitive form without "to" ("Lead a team of 5 engineers", "Design and deploy REST APIs"). Arabic: the verbal noun / masdar ("قيادة فريق من 5 مهندسين", "تصميم ونشر واجهات برمجية"). Never use conjugated verbs (no past tense such as "Managed"/"Géré"/"J'ai géré", no present tense such as "Manages"/"Gère", no first person "I"/"je"), including for previous roles. In the summary, write in nominal CV style (noun phrases and infinitives, no first person, no conjugated verbs), e.g. "Développeur full-stack avec 5 ans d'expérience, spécialisé dans React et Node.js".
Style: start each bullet with a strong, precise action verb (in the infinitive form above), rephrased professionally and concisely; no filler, no vague wording. Keep a consistent register and capitalisation (sentence case for bullets and summary, standard capitalisation for job titles and proper nouns). Fix typos, broken words, stray hyphenation, stray line breaks and spacing errors found in the source, but never change facts, names, numbers or dates. Do not mix languages inside one CV unless the source does (technology names excepted).`;

const RESUME_TOOL = {
  name: "submit_cv",
  description: "Submit the résumé, structured into opportunty.com's CV schema.",
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
    tool_choice: { type: "auto" },
    messages: [{
      role: "user",
      content: `Call the submit_cv tool exactly once with the result. Structure this résumé text into the CV schema. Only use information present in the text — never invent employers, dates, or numbers. Leave a field empty ("" or []) rather than guessing.\n\n${WRITING_RULES}\n\n---\n${rawText.slice(0, 12000)}\n---`,
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
  description: "Submit the tailored CV text and a short honest fit report for this CV/job pairing.",
  input_schema: {
    type: "object" as const,
    properties: {
      title:           { type: "string", description: "The candidate's professional headline. Move it toward the target role ONLY where their real experience supports that; otherwise keep their current headline. Never claim a title they haven't held." },
      summary:         { type: "string", description: "The CV summary text itself (2-4 sentences, CV voice, no first-person commentary). Lead with the parts of the candidate's REAL background most relevant to this job, framing transferable strengths positively. Never invent experience. NEVER write commentary about fit, mismatch or what the candidate lacks — only the CV text." },
      skill_group_name:{ type: "string", description: "Short label for the highlighted-skills group, e.g. 'Relevant to this role'" },
      skills:          { type: "array", items: { type: "string" }, description: "Skills the candidate genuinely has (from their CV) that matter for this role, ordered by relevance" },
      experience: {
        type: "array",
        description: "Rewritten bullets for the experience entries, one object per entry you changed. Reorder bullets so the most relevant come first and reword them with the job's vocabulary. Same facts only: do not add bullets, numbers, tools, results or responsibilities that are not already in that entry's bullets. Never output more bullets than the entry already has.",
        items: {
          type: "object",
          properties: {
            index:   { type: "integer", description: "0-based position of the entry in the CV's experience array" },
            bullets: { type: "array", items: { type: "string" } },
          },
          required: ["index", "bullets"],
        },
      },
      match_score:    { type: "integer", description: "0-100: how much of the job's key requirements the candidate's REAL background covers. Be strict and honest." },
      matched_skills: { type: "array", items: { type: "string" }, description: "Up to 8 job requirements/skills the candidate's CV genuinely covers" },
      missing_skills: { type: "array", items: { type: "string" }, description: "Up to 6 important job requirements/skills the CV does not show. These are suggestions for the candidate, not added to the CV." },
      changes:        { type: "array", items: { type: "string" }, description: "3-6 short plain statements of what you changed on the CV (e.g. 'Reworded 3 bullets at Acme to stress API design')" },
    },
    required: ["title", "summary", "skill_group_name", "skills", "match_score", "matched_skills", "missing_skills", "changes"],
  },
};

export interface TailorJobInput {
  title: string;
  company: string;
  location?: string;
  tags: string[];
  description: string;
}

export async function tailorCVWithAI(cv: CVData, job: TailorJobInput): Promise<{ cv: CVData; report: TailorReport }> {
  const anthropic = getClient();
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    tools: [TAILOR_TOOL],
    tool_choice: { type: "auto" },
    messages: [{
      role: "user",
      content: `Call the submit_tailoring tool exactly once with the result.\n\nCandidate's current CV (JSON; experience entries are identified by their 0-based position in "experience"):\n${JSON.stringify(cv)}\n\nTarget job:\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location ?? ""}\nTags: ${job.tags.join(", ")}\nDescription: ${job.description}\n\nTailor this CV for this job.\n\nRules:\n- Stay honest. Never claim experience, titles, tools, numbers or results the CV does not support. Rephrase and reorder only; the facts must stay the same.\n- Headline and summary: CV text only, no notes or commentary about fit.\n- Experience: for each entry that benefits, return its bullets reordered (most relevant first) and reworded with the job's own vocabulary where it is truthful. Keep the original language of the CV. Do not add bullets. Leave entries untouched if nothing helps.\n- Skills list: only skills the candidate really has.\n- match_score, matched_skills and missing_skills describe the real fit, strictly. missing_skills are suggestions for the candidate and are NOT added to the CV.\n- changes: 3-6 short factual lines about what you changed.\n${WRITING_RULES}\nThe output goes straight onto the candidate's CV, so no markup, notes or warnings inside the CV fields.`,
    }],
  });

  const toolUse = msg.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("Claude did not return structured output");

  const out = toolUse.input as {
    title: string; summary: string; skill_group_name: string; skills: string[];
    experience?: { index: number; bullets: string[] }[];
    match_score?: number; matched_skills?: string[]; missing_skills?: string[]; changes?: string[];
  };
  const list = (v: unknown, n: number) => (Array.isArray(v) ? v : []).map((x) => polishLine(cleanText(x))).filter(Boolean).slice(0, n);
  out.title = polishLine(cleanText(out.title));
  out.summary = polishParagraph(cleanText(out.summary));
  out.skill_group_name = cleanText(out.skill_group_name);
  out.skills = list(out.skills, 20);

  const next: CVData = JSON.parse(JSON.stringify(cv));
  next.profile.title = out.title || next.profile.title;
  next.summary = out.summary || next.summary;

  // Bullets: accept rewording/reordering only — never more bullets than the entry had.
  for (const e of Array.isArray(out.experience) ? out.experience : []) {
    const item = Number.isInteger(e?.index) ? next.experience[e.index] : undefined;
    if (!item) continue;
    const bullets = list(e.bullets, item.bullets.length);
    if (bullets.length > 0) item.bullets = bullets;
  }

  if (out.skills.length > 0) {
    const existing = new Set(next.skills.flatMap((g) => g.items.map((i) => i.toLowerCase().trim())));
    const fresh = out.skills.filter((s) => !existing.has(s.toLowerCase().trim()));
    if (fresh.length > 0) {
      next.skills = [{ id: uid(), group: out.skill_group_name || `Relevant to ${job.title}`, items: fresh }, ...next.skills];
    }
  }

  const score = Math.max(0, Math.min(100, Math.round(Number(out.match_score) || 0)));
  const report: TailorReport = {
    score, source: "ai", jobTitle: job.title, company: job.company,
    matched: list(out.matched_skills, 8), missing: list(out.missing_skills, 6), changes: list(out.changes, 6),
  };
  return { cv: next, report };
}

// ─────────────────────────────────────────────────────────────────────────
// CV → same CV in another language
// ─────────────────────────────────────────────────────────────────────────

const LANG_NAME: Record<string, string> = { fr: "French", en: "English", ar: "Arabic" };

type Slot = { get: () => string; set: (v: string) => void };

/** Every human-language string on the CV (names, companies, dates, contacts are NOT included). */
function translatableSlots(cv: CVData): Slot[] {
  const out: Slot[] = [];
  const add = (obj: Record<string, unknown>, key: string) => {
    if (typeof obj[key] === "string" && (obj[key] as string).trim()) out.push({ get: () => obj[key] as string, set: (v) => { obj[key] = v; } });
  };
  add(cv.profile as unknown as Record<string, unknown>, "title");
  add(cv as unknown as Record<string, unknown>, "summary");
  for (const e of cv.experience) { add(e as unknown as Record<string, unknown>, "role"); e.bullets.forEach((_, i) => add(e.bullets as unknown as Record<string, unknown>, String(i))); }
  for (const e of cv.education) { add(e as unknown as Record<string, unknown>, "degree"); add(e as unknown as Record<string, unknown>, "detail"); }
  for (const g of cv.skills) add(g as unknown as Record<string, unknown>, "group");
  for (const l of cv.languages) { add(l as unknown as Record<string, unknown>, "name"); add(l as unknown as Record<string, unknown>, "level"); }
  for (const p of cv.projects) { add(p as unknown as Record<string, unknown>, "role"); add(p as unknown as Record<string, unknown>, "detail"); }
  cv.interests.forEach((_, i) => add(cv.interests as unknown as Record<string, unknown>, String(i)));
  return out;
}

const TRANSLATE_TOOL = {
  name: "submit_translation",
  description: "Submit the translated strings, in the same order and count as the input.",
  input_schema: {
    type: "object" as const,
    properties: { strings: { type: "array", items: { type: "string" } } },
    required: ["strings"],
  },
};

export async function translateCVWithAI(cv: CVData, target: "fr" | "en" | "ar"): Promise<CVData> {
  const next: CVData = JSON.parse(JSON.stringify(cv));
  const slots = translatableSlots(next);
  if (slots.length === 0) return next;

  const anthropic = getClient();
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 6000,
    tools: [TRANSLATE_TOOL],
    tool_choice: { type: "auto" },
    messages: [{
      role: "user",
      content: `Call the submit_translation tool exactly once with the result. Translate each CV text below into ${LANG_NAME[target]}. Return exactly ${slots.length} strings in the same order.\n\nRules: natural professional CV register; keep company names, school names, people names, product/tool/technology names, numbers and dates unchanged; do not add, remove or merge anything; if a string is already in ${LANG_NAME[target]}, return it unchanged. ${WRITING_RULES} Output only the translated text, no notes.\n\n${JSON.stringify(slots.map((x) => x.get()))}`,
    }],
  });

  const toolUse = msg.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("Claude did not return structured output");
  const strings = (toolUse.input as { strings?: unknown }).strings;
  if (!Array.isArray(strings) || strings.length !== slots.length) throw new Error("Translation length mismatch");

  slots.forEach((slot, i) => { const t = polishLine(cleanText(strings[i])); if (t) slot.set(t); });
  return next;
}

// ─────────────────────────────────────────────────────────────────────────
// CV → same CV, proofread (grammar / spelling / punctuation) in its own language
// ─────────────────────────────────────────────────────────────────────────

export async function proofreadCVWithAI(cv: CVData): Promise<{ cv: CVData; changed: number }> {
  const next: CVData = JSON.parse(JSON.stringify(cv));
  const slots = translatableSlots(next);
  if (slots.length === 0) return { cv: next, changed: 0 };
  const original = slots.map((x) => x.get());

  const anthropic = getClient();
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 6000,
    tools: [TRANSLATE_TOOL],
    tool_choice: { type: "auto" },
    messages: [{
      role: "user",
      content: `Call the submit_translation tool exactly once with the result. Proofread and professionally rephrase each CV text below. Return exactly ${slots.length} strings in the same order, each in the SAME language as its input (do not translate).\n\nCorrect grammar, spelling, punctuation, agreement and capitalisation, and rephrase wording so every string reads like polished, concise, professional CV prose from a native speaker, using the infinitive verb form as specified in the rules below (convert any conjugated verb to its infinitive). Keep the meaning, facts, names, numbers, dates and technology names exactly; do not add, invent or remove information, and keep roughly the same length. If a string is already correct and professional, return it unchanged. Output only the corrected text, no notes.\n\n${WRITING_RULES}\n\n${JSON.stringify(original)}`,
    }],
  });

  const toolUse = msg.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("Claude did not return structured output");
  const strings = (toolUse.input as { strings?: unknown }).strings;
  if (!Array.isArray(strings) || strings.length !== slots.length) throw new Error("Proofread length mismatch");

  let changed = 0;
  slots.forEach((slot, i) => {
    const t = polishLine(cleanText(strings[i]));
    if (t && t !== original[i]) { slot.set(t); changed++; }
  });
  return { cv: next, changed };
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
      title:     polishLine(str(raw.profile, "title")),
      email:     str(raw.profile, "email"),
      phone:     str(raw.profile, "phone"),
      city:      str(raw.profile, "city"),
      website:   str(raw.profile, "website") || undefined,
      linkedin:  str(raw.profile, "linkedin") || undefined,
    },
    summary: polishParagraph(raw.summary),
    experience: arr(raw.experience).map((e) => ({
      id: uid(),
      role:    polishLine(str(e, "role")),
      company: str(e, "company"),
      city:    str(e, "city") || undefined,
      start:   str(e, "start"),
      end:     str(e, "end") || undefined,
      bullets: arr((e as Record<string, unknown>).bullets).map((b) => polishLine(b)).filter(Boolean),
    })),
    education: arr(raw.education).map((e) => ({
      id: uid(),
      degree: polishLine(str(e, "degree")),
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

/** Model output goes straight onto a CV: cut at any stray markup and trim. */
function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const cut = v.search(/<\/?[a-z_]+[ >]/i);
  return (cut >= 0 ? v.slice(0, cut) : v).trim();
}
