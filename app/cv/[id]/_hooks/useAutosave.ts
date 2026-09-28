"use client";
/**
 * useAutosave — subscribes to the CV store and persists 800 ms after the
 * last change.
 *
 * Two targets depending on `cvId`:
 *  - cvId is a real id  → persists to the `cvs` row in Supabase (signed-in,
 *    saved-CV builder at /cv/[id]).
 *  - cvId is null       → persists to localStorage only (anonymous draft
 *    at /cv/builder) — opportunity.com never creates a Supabase row for a
 *    signed-out visitor.
 */

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCVStore } from "../../_store/cv-store";
import { saveLocalDraft } from "../../_lib/local-draft";
import type { Json } from "../../_lib/db-types";

const supabase = createClient();

export function useAutosave(cvId: string | null) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = useCVStore.subscribe((state, prev) => {
      if (
        state.cv       === prev.cv       &&
        state.template === prev.template &&
        state.accent   === prev.accent   &&
        state.lang     === prev.lang     &&
        state.order    === prev.order    &&
        state.enabled  === prev.enabled  &&
        state.cvName   === prev.cvName
      ) return;

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => (cvId ? doPersistCloud(cvId) : doPersistLocal()), 800);
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [cvId]);
}

function doPersistLocal() {
  const s = useCVStore.getState();
  s.markSaving();
  saveLocalDraft({
    cv:       s.cv,
    template: s.template,
    accent:   s.accent,
    lang:     s.lang,
    order:    s.order,
    enabled:  s.enabled,
    cvName:   s.cvName,
  });
  s.markSaved();
}

async function doPersistCloud(cvId: string) {
  const s = useCVStore.getState();
  s.markSaving();
  try {
    await supabase
      .from("cvs")
      .update({
        name:             s.cvName,
        data:             s.cv        as unknown as Json,
        template:         s.template,
        accent:           s.accent,
        lang:             s.lang,
        section_order:    s.order     as unknown as Json,
        sections_enabled: s.enabled   as unknown as Json,
      })
      .eq("id", cvId);
  } catch {
    // Non-fatal: the user hasn't lost data, just this save attempt failed.
  }
  s.markSaved();
}
