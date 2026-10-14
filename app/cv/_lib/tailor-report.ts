/** What the tailoring did + how well the CV fits the job. Carried from the homepage into the builder. */
export interface TailorReport {
  score: number;          // 0-100 honest fit
  matched: string[];      // job requirements the CV covers
  missing: string[];      // requirements the CV doesn't show (suggestions only)
  changes: string[];      // plain-language list of edits
  source: "ai" | "heuristic";
  jobTitle: string;
  company: string;
}

export const REPORT_KEY = "opportunity_tailor_report_v1";

/** Stored in sessionStorage so the builder can show it once, with the original CV for "undo". */
export function saveReport(report: TailorReport, before: unknown): void {
  try { window.sessionStorage.setItem(REPORT_KEY, JSON.stringify({ report, before })); } catch { /* ignore */ }
}
