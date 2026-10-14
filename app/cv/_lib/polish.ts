/**
 * Deterministic text hygiene for CV text, applied to every AI result (and the
 * heuristic fallback) as a safety net on top of the prompts' grammar rules.
 * Conservative on purpose: it never rewrites wording, only fixes mechanics
 * (spacing, doubled words/punctuation, leading bullet glyphs, capitalisation,
 * and the missing full stop at the end of a summary).
 */

const LEADING_GLYPHS = /^[\s•·▪■◦●○\-–—*►>]+/u;

/** One line: a title, a bullet, a degree, a skill. */
export function polishLine(v: unknown): string {
  if (typeof v !== "string") return "";
  let s = v.replace(/\s+/g, " ").trim();
  s = s.replace(LEADING_GLYPHS, "");
  s = s.replace(/\s+([,.])/g, "$1");               // "word ," → "word,"  (French ; : ! ? keep their space)
  s = s.replace(/([,;])(?=\p{L})/gu, "$1 ");       // "a,b" → "a, b"
  s = s.replace(/,{2,}/g, ",").replace(/\.{4,}/g, "...").replace(/([!?])\1+/g, "$1");
  s = s.replace(/\b(\p{L}{2,})\s+\1\b/giu, "$1");  // "the the" → "the"
  s = s.replace(/^\p{Ll}/u, (c) => c.toUpperCase()); // sentence-case the first letter
  return s.trim();
}

/** A paragraph (summary): polished, and always ends with terminal punctuation. */
export function polishParagraph(v: unknown): string {
  const s = polishLine(v);
  if (!s) return "";
  return /[.!?…。؟]$/u.test(s) ? s : s + ".";
}

/** "A, B and C" — Oxford-comma-free list join used by the fallback sentence. */
export function joinList(items: string[], and = "and"): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}
