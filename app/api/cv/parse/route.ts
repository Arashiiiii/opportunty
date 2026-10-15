/**
 * POST /api/cv/parse — turns an uploaded PDF/DOCX résumé into a starting
 * CVData the builder can load.
 *
 * Real text extraction (pdf-parse / mammoth) feeds Claude
 * (cv/_lib/ai.ts), which structures it into the full CV schema —
 * experience, education, skills, dates, the works. If the AI call fails
 * for any reason (no API key configured, rate limit, bad response), we
 * fall back to a deterministic regex pass so uploading never just breaks;
 * the visitor still gets name/email/phone/skills pulled out and the rest
 * of the text dropped into summary to reorganize by hand.
 *
 * No auth required: uploading and editing is anonymous. Nothing here is
 * persisted server-side — the parsed CV is returned directly to the
 * browser and lives in the client store / localStorage from there on.
 */
import { NextRequest, NextResponse } from "next/server";
import { EMPTY_CV, uid } from "@/app/cv/_lib/schema";
import type { CVData } from "@/app/cv/_lib/schema";
import { structureResumeWithAI } from "@/app/cv/_lib/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const SKILLS_HEADING_RE = /^(skills|compétences|competences|technical skills)\s*:?\s*$/i;

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data with a 'file' field." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File is too large (max 10MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  let text = "";
  try {
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      // unpdf ships a serverless build of pdf.js with no worker file or native
      // canvas, so it works on Vercel's function runtime (pdf-parse didn't).
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const result = await extractText(pdf, { mergePages: true });
      text = result.text;
    } else if (
      name.endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const mammoth = await import("mammoth");
      const { value } = await mammoth.extractRawText({ buffer });
      text = value;
    } else {
      return NextResponse.json({ error: "Please upload a PDF or DOCX file." }, { status: 400 });
    }
  } catch (err) {
    console.error("CV file text extraction failed:", err);
    return NextResponse.json({ error: "Couldn't read that file — it may be corrupted or scanned as an image." }, { status: 422 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "Couldn't find any text in that file — if it's a scanned image, try a text-based PDF or DOCX instead." }, { status: 422 });
  }

  try {
    const cv = await structureResumeWithAI(text);
    return NextResponse.json({ cv, source: "ai" });
  } catch (err) {
    console.error("AI résumé structuring failed, falling back to heuristic parse:", err);
    const cv = structureResume(text);
    return NextResponse.json({ cv, source: "heuristic" });
  }
}

function structureResume(rawText: string): CVData {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const cv: CVData = JSON.parse(JSON.stringify(EMPTY_CV));

  const fullText = rawText;
  const emailMatch = fullText.match(EMAIL_RE);
  const phoneMatch = fullText.match(PHONE_RE);
  if (emailMatch) cv.profile.email = emailMatch[0];
  if (phoneMatch) cv.profile.phone = phoneMatch[0].trim();

  // Name: first line that isn't the email/phone and looks name-shaped
  // (short, mostly letters, no @ or digits).
  const nameLine = lines.find((l) =>
    l.length > 1 && l.length < 60 &&
    !l.includes("@") &&
    !/\d{3}/.test(l) &&
    /^[A-Za-zÀ-ÿ' -]+$/.test(l),
  );
  if (nameLine) {
    const parts = nameLine.split(/\s+/);
    cv.profile.firstName = parts[0] ?? "";
    cv.profile.lastName  = parts.slice(1).join(" ");
  }

  // Title: the next short line right after the name line, if it reads
  // like a job title rather than a paragraph.
  if (nameLine) {
    const idx = lines.indexOf(nameLine);
    const candidate = lines[idx + 1];
    if (candidate && candidate.length < 80 && !EMAIL_RE.test(candidate) && !PHONE_RE.test(candidate)) {
      cv.profile.title = candidate;
    }
  }

  // Sections: headings are matched with spaces removed so letter-spaced
  // PDF headings ("P RO F I L E") still count.
  const SECTION_KEYS: [string, RegExp][] = [
    ["summary", /^(profile|profil|summary|about|aboutme|resume|résumé|objective|apropos)$/],
    ["experience", /^(professionalexperiences?|workexperience|experiences?|expériences?|experienceprofessionnelle|expérienceprofessionnelle|employment|workhistory)$/],
    ["education", /^(training|education|formation|formations|studies|academicbackground|diplomas?)$/],
    ["skills", /^(skills|technicalskills|compétences|competences|keyskills)$/],
    ["languages", /^(languages|langues)$/],
  ];
  const keyOf = (l: string) => {
    const k = l.toLowerCase().replace(/[\s:|–-]+/g, "");
    return k.length < 28 ? SECTION_KEYS.find(([, re]) => re.test(k))?.[0] : undefined;
  };
  const sections: Record<string, string[]> = {};
  let cur: string | null = null;
  for (const l of lines) {
    const k = keyOf(l);
    if (k) { cur = k; sections[k] = sections[k] ?? []; continue; }
    if (cur) sections[cur].push(l);
  }

  const YEAR = /(?:19|20)\d{2}/;
  const RANGE = new RegExp(String.raw`((?:(?:jan|feb|fév|mar|apr|avr|may|mai|jun|juin|jul|juil|aug|aoû|sep|oct|nov|dec|déc)[a-zéû.]*\s+)?(?:19|20)\d{2})\s*[–—-]\s*((?:(?:jan|feb|fév|mar|apr|avr|may|mai|jun|juin|jul|juil|aug|aoû|sep|oct|nov|dec|déc)[a-zéû.]*\s+)?(?:(?:19|20)\d{2}|present|présent|aujourd'hui|now|current|today))\s*$`, "i");

  if (sections.summary?.length) cv.summary = sections.summary.join(" ").replace(/\s+/g, " ").trim();

  // Experience: a line ending in a date range closes a "company  dates" line;
  // the line(s) just before it are the role, the lines after are bullets.
  const exp = sections.experience ?? [];
  const items: CVData["experience"] = [];
  let role: string[] = [];
  let curItem: CVData["experience"][number] | null = null;
  let bullet = "";
  const flush = () => { if (curItem && bullet.trim()) curItem.bullets.push(bullet.trim()); bullet = ""; };
  for (const l of exp) {
    const m = l.match(RANGE);
    if (m) {
      flush();
      const present = /present|présent|aujourd|now|current|today/i.test(m[2]);
      curItem = { id: uid(), role: role.join(" ").trim(), company: l.slice(0, m.index).trim(), start: m[1].trim(), end: present ? "" : m[2].trim(), current: present, bullets: [] };
      items.push(curItem);
      role = [];
      continue;
    }
    if (!curItem) { role.push(l); continue; }
    // A wrapped line continues the previous bullet; a line starting a new
    // sentence after a finished one starts a new bullet. Short title-cased
    // lines directly before a dated line are the next entry's role.
    const clean = l.replace(/^[•·▪◦*-]\s*/, "");
    if (bullet && !/[.!?]$/.test(bullet) && (/^[a-zà-ÿ0-9(%]/.test(clean) || clean.length < 25)) bullet += " " + clean;
    else { flush(); bullet = clean; }
  }
  flush();
  // Role lines that were swallowed as bullets of the previous entry: a trailing
  // 1-2 lines of the previous entry that precede the next dated line belong to
  // the next entry. Handle by re-scanning: move them when the next entry has no role.
  for (let k = 1; k < items.length; k++) {
    if (!items[k].role) {
      const prev = items[k - 1];
      const take = prev.bullets.length && prev.bullets[prev.bullets.length - 1].length < 80 && !/[.!?]$/.test(prev.bullets[prev.bullets.length - 1]) ? prev.bullets.pop()! : "";
      items[k].role = take;
    }
  }
  cv.experience = items;

  // Education: groups of "degree / school / year".
  const ed = sections.education ?? [];
  for (let k = 0; k < ed.length;) {
    const degree = ed[k], school = ed[k + 1] ?? "", yr = ed[k + 2] ?? "";
    if (YEAR.test(yr) && yr.length <= 12) {
      cv.education.push({ id: uid(), degree, school, start: "", end: yr.match(YEAR)![0] });
      k += 3;
    } else if (YEAR.test(school) && school.length <= 12) {
      cv.education.push({ id: uid(), degree, school: "", start: "", end: school.match(YEAR)![0] });
      k += 2;
    } else { cv.education.push({ id: uid(), degree, school: "", start: "", end: "" }); k += 1; }
  }

  // Languages: "Arabic — Native".
  for (const l of sections.languages ?? []) {
    const [n, ...rest] = l.split(/\s*[—–:-]\s*/);
    if (!n || n.length > 30) continue;
    const level = rest.join(" - ").trim();
    const lv = level.toLowerCase();
    const dots = /native|natif|maternelle|c2/.test(lv) ? 5 : /c1|advanced|courant|fluent|avanc/.test(lv) ? 4 : /b2|upper|b1|interm/.test(lv) ? 3 : 2;
    cv.languages.push({ id: uid(), name: n.trim(), level, dots });
  }

  // Skills: the extracted grid is flattened, so keep it as lines.
  const sk = (sections.skills ?? []).flatMap((l) => l.split(/[,•·|]/)).map((x) => x.trim()).filter(Boolean);
  if (sk.length) cv.skills = [{ id: uid(), group: "Skills", items: sk.slice(0, 30) }];

  // Nothing recognisable? Keep the text so the visitor can reorganise by hand.
  if (!cv.summary && !cv.experience.length) {
    cv.summary = rawText.replace(/\s+/g, " ").trim().slice(0, 1200);
  }

  return cv;
}
