/**
 * Deterministic, client-side CV tailoring for the "drag a job onto your
 * CV" flow. This is NOT an LLM call (opportunity.com has no AI backend
 * wired up yet) — it's a real, useful heuristic: it sets the target title,
 * writes an honest lead sentence naming the role and company, and surfaces
 * the job's listed skills/tags as a dedicated skills group (deduped
 * against whatever the CV already has). Works whether `base` is a CV the
 * visitor just uploaded or a blank starting point.
 */
import type { CVData } from "./schema";
import { uid } from "./schema";

export interface TailorJob {
  title:       string;
  company:     string;
  location?:   string;
  tags:        string[];
}

export function tailorCVForJob(base: CVData, job: TailorJob): CVData {
  const next: CVData = JSON.parse(JSON.stringify(base));

  next.profile.title = job.title;

  const existingSkills = new Set(
    next.skills.flatMap((g) => g.items.map((i) => i.toLowerCase().trim())),
  );
  const matched = job.tags.filter((t) => existingSkills.has(t.toLowerCase().trim()));
  const newTags = job.tags.filter((t) => !existingSkills.has(t.toLowerCase().trim()));

  const lead = matched.length > 0
    ? `Tailored for the ${job.title} role at ${job.company}, bringing hands-on experience in ${matched.join(", ")}.`
    : `Tailored for the ${job.title} role at ${job.company}.`;

  next.summary = next.summary?.trim()
    ? `${lead} ${next.summary.trim()}`
    : lead;

  if (newTags.length > 0) {
    next.skills = [
      { id: uid(), group: `Relevant to ${job.title}`, items: newTags },
      ...next.skills,
    ];
  }

  return next;
}
