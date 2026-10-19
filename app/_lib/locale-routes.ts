import type { Lang } from "../i18n";

/**
 * Pages that exist in all three languages under their own URL. The language
 * switch moves between these; everywhere else it only changes the UI language.
 */
export const LOCALE_GROUPS: Record<Lang, string>[] = [
  { en: "/", fr: "/fr", ar: "/ar" },
  { en: "/cv-builder", fr: "/fr/cv-builder", ar: "/ar/cv-builder" },
];

export function localizedPath(pathname: string, lang: Lang): string | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  const group = LOCALE_GROUPS.find((g) => Object.values(g).includes(p));
  return group ? group[lang] : null;
}

/** hreflang map for a group, for `alternates.languages` in metadata. */
export function hreflang(group: Record<Lang, string>) {
  return { en: group.en, fr: group.fr, ar: group.ar, "x-default": group.en };
}
