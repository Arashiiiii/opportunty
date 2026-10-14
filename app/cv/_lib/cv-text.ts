import type { CVData } from "./schema";

/** True once the CV has any free text worth translating. */
export function cvHasText(cv: CVData): boolean {
  return !!(cv.summary.trim() || cv.profile.title.trim() || cv.experience.length || cv.education.length || cv.interests.length);
}
