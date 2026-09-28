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
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
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
  } catch {
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

  // Skills: look for a "Skills" / "Compétences" heading and pull the
  // following lines (comma or bullet separated) until the next blank
  // paragraph or heading-looking line.
  const skillsIdx = lines.findIndex((l) => SKILLS_HEADING_RE.test(l));
  if (skillsIdx >= 0) {
    const items: string[] = [];
    for (let i = skillsIdx + 1; i < lines.length && i < skillsIdx + 6; i++) {
      const l = lines[i];
      if (!l || l.length > 200 || /:\s*$/.test(l)) break;
      items.push(
        ...l.split(/[,•·|]/).map((s) => s.trim()).filter(Boolean),
      );
    }
    if (items.length > 0) {
      cv.skills = [{ id: uid(), group: "Skills", items: items.slice(0, 20) }];
    }
  }

  // Summary: the rest of the extracted text, capped so it's editable
  // rather than overwhelming — the visitor reorganizes freely from here.
  const summary = fullText.replace(/\s+/g, " ").trim();
  cv.summary = summary.slice(0, 1200);

  return cv;
}
