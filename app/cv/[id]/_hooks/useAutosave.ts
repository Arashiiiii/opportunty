"use client";
/**
 * useAutosave — subscribes to the CV store and persists to Supabase
 * 800 ms after the last change. Ported from talentmaroc; only the
 * client constructor changed (real cookie-session browser client
 * instead of a bare anon-key client).
 */

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCVStore } from "../../_store/cv-store";
import type { Json } from "../../_lib/db-types";

const supabase = createClient();

export function useAutosave(cvId: string) {
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
      timer = setTimeout(() => doPersist(cvId), 800);
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [cvId]);
}

async function doPersist(cvId: string) {
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
