/**
 * A one-shot sessionStorage flag the homepage sets right before routing
 * into /cv/builder, so the builder knows "the store was just populated
 * in-memory by the homepage — use it as-is, don't overwrite it with an
 * older localStorage draft."
 */
import type { CVData } from "./schema";

/** A CV counts as "there" once it has a name, summary or any experience. */
export function cvHasContent(cv: CVData | null | undefined): cv is CVData {
  if (!cv) return false;
  return !!(cv.profile.firstName || cv.profile.lastName || cv.summary.trim() || cv.experience.length);
}

export const HANDOFF_KEY = "opportunity_cv_handoff";

export function markHandoff(): void {
  try {
    window.sessionStorage.setItem(HANDOFF_KEY, "1");
  } catch {
    // ignore
  }
}
