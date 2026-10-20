import type { Metadata } from "next";
import { SITE_URL } from "./site";

export type SeoLang = "en" | "fr" | "ar";

export const SEO: Record<SeoLang, { title: string; description: string; locale: string }> = {
  en: {
    title: "opportunty — Jobs & free AI CV builder (Morocco, Europe, Saudi Arabia)",
    description: "Find jobs in Morocco, France, Germany, Belgium, the Netherlands and Saudi Arabia, then tailor your CV to each offer with AI. Free CV builder with 10 ATS-friendly templates.",
    locale: "en_US",
  },
  fr: {
    title: "opportunty — Offres d'emploi et créateur de CV gratuit avec IA",
    description: "Trouvez un emploi au Maroc, en France, en Allemagne, en Belgique, aux Pays-Bas et en Arabie saoudite, puis adaptez votre CV à chaque offre grâce à l'IA. Créateur de CV gratuit : 10 modèles compatibles ATS.",
    locale: "fr_FR",
  },
  ar: {
    title: "opportunty — وظائف ومنشئ سيرة ذاتية مجاني بالذكاء الاصطناعي",
    description: "ابحث عن وظائف في المغرب وفرنسا وألمانيا وبلجيكا وهولندا والسعودية، ثم كيّف سيرتك الذاتية مع كل عرض بالذكاء الاصطناعي. منشئ سيرة ذاتية مجاني بـ 10 قوالب متوافقة مع أنظمة ATS.",
    locale: "ar_MA",
  },
};

export const HOME_ALTERNATES = {
  canonicalFor: (l: SeoLang) => (l === "en" ? "/" : `/${l}`),
  languages: { en: `${SITE_URL}/`, fr: `${SITE_URL}/fr`, ar: `${SITE_URL}/ar`, "x-default": `${SITE_URL}/` },
};

export function homeMetadata(l: SeoLang): Metadata {
  const s = SEO[l];
  const url = HOME_ALTERNATES.canonicalFor(l);
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: url, languages: HOME_ALTERNATES.languages },
    openGraph: { type: "website", url, title: s.title, description: s.description, locale: s.locale, siteName: "opportunty.com" },
    twitter: { card: "summary_large_image", title: s.title, description: s.description },
  };
}
