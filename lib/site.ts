import type { Lang } from "@/app/i18n";

export const SITE_URL = "https://opportunty.com";
export const SITE_NAME = "opportunty";

/** Homepage title/description per language (also used as site-wide defaults in English). */
export const HOME_META: Record<Lang, { title: string; description: string; ogLocale: string }> = {
  en: {
    title: "opportunty — Free AI CV builder & jobs in Morocco, Europe, Saudi",
    description: "Free CV builder with AI: tailor your CV to any job in Morocco, France, Germany, Belgium, the Netherlands or Saudi Arabia. 10 ATS templates. Pay only to download.",
    ogLocale: "en_US",
  },
  fr: {
    title: "opportunty — CV gratuit avec l'IA & offres d'emploi au Maroc",
    description: "Créez votre CV gratuitement et adaptez-le avec l'IA à chaque offre d'emploi au Maroc, en France, en Belgique, en Allemagne ou en Arabie saoudite. 10 modèles ATS.",
    ogLocale: "fr_FR",
  },
  ar: {
    title: "opportunty — إنشاء سيرة ذاتية مجاناً بالذكاء الاصطناعي ووظائف في المغرب",
    description: "أنشئ سيرتك الذاتية مجاناً وكيّفها بالذكاء الاصطناعي مع كل وظيفة في المغرب والسعودية وأوروبا. 10 قوالب متوافقة مع ATS، والدفع عند التحميل فقط.",
    ogLocale: "ar_MA",
  },
};

export const SITE_TITLE = HOME_META.en.title;
export const SITE_DESCRIPTION = HOME_META.en.description;
