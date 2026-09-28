/**
 * A one-shot sessionStorage flag the homepage sets right before routing
 * into /cv/builder, so the builder knows "the store was just populated
 * in-memory by the homepage — use it as-is, don't overwrite it with an
 * older localStorage draft."
 */
export const HANDOFF_KEY = "opportunity_cv_handoff";

export function markHandoff(): void {
  try {
    window.sessionStorage.setItem(HANDOFF_KEY, "1");
  } catch {
    // ignore
  }
}
