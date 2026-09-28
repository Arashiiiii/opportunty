/**
 * Local-draft persistence — how an anonymous visitor's in-progress CV
 * survives a page refresh without ever touching Supabase.
 *
 * opportunity.com has no anonymous accounts, so a signed-out visitor's
 * work lives ONLY in this browser's localStorage until they sign in and
 * download, at which point Topbar claims it into a real `cvs` row.
 */
import type { CVData, TemplateId, Lang, SectionId } from "./schema";

const KEY = "opportunity_draft_cv_v1";

export interface LocalDraft {
  cv:       CVData;
  template: TemplateId;
  accent:   string;
  lang:     Lang;
  order:    SectionId[];
  enabled:  Record<SectionId, boolean>;
  cvName:   string;
}

export function saveLocalDraft(draft: LocalDraft): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Storage full / disabled — not fatal, just means the draft won't
    // survive a refresh.
  }
}

export function readLocalDraft(): LocalDraft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalDraft;
  } catch {
    return null;
  }
}

export function clearLocalDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
