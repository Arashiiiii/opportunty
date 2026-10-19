import type { Lang } from "@/app/i18n";

/**
 * Copy for the server-rendered CV builder landing pages (/cv-builder, /fr/cv-builder, /ar/cv-builder).
 * The editor itself (/cv/builder) is an app screen with nothing for search engines to read;
 * these pages are what ranks for "free CV builder" / "CV gratuit" / "سيرة ذاتية" and send people into it.
 */
export interface CvLanding {
  title: string; description: string; ogLocale: string;
  eyebrow: string; h1: string; sub: string; ctaBuild: string; ctaUpload: string; free: string;
  stepsH: string; steps: { h: string; p: string }[];
  templatesH: string; templatesP: string;
  whyH: string; why: string[];
  pricingH: string; pricing: string;
  jobsH: string; jobsP: string; countries: { slug: string; label: string }[];
  faqH: string; faq: { q: string; a: string }[];
}

const COUNTRY_SLUGS = ["morocco", "france", "belgium", "germany", "netherlands", "saudi-arabia"] as const;

export const CV_LANDING: Record<Lang, CvLanding> = {
  en: {
    title: "Free CV builder with AI — 10 ATS-friendly templates | opportunty",
    description: "Build your CV online for free: upload your old CV or start from scratch, pick one of 10 ATS-friendly templates and let AI tailor it to any job. English, French and Arabic.",
    ogLocale: "en_US",
    eyebrow: "Free CV builder", h1: "Build a CV that fits the job — free, with AI",
    sub: "Upload your current CV or start from scratch, pick a template, then let AI tailor it to a real job offer in Morocco, Europe or Saudi Arabia. No account needed to start.",
    ctaBuild: "Build my CV now", ctaUpload: "Upload my CV & pick a job", free: "Free to edit · pay only when you download",
    stepsH: "How it works",
    steps: [
      { h: "Add your CV", p: "Upload a PDF or Word file and we read it into an editable CV — or start from a blank page." },
      { h: "Pick a job", p: "Choose a live offer from the job feed. AI rewrites your title, summary and skills to match it." },
      { h: "Download", p: "Choose one of 10 templates, fine-tune anything, and download a clean PDF." },
    ],
    templatesH: "10 ATS-friendly templates", templatesP: "Clean layouts that recruiters' applicant-tracking systems can read, from minimal to creative.",
    whyH: "Why opportunty",
    why: [
      "AI tailoring to a specific job, not generic rewriting",
      "CVs in English, French and Arabic (right-to-left supported)",
      "Live job feed for Morocco, France, Belgium, Germany, the Netherlands and Saudi Arabia",
      "Proofreading and a CV score that shows what to improve",
    ],
    pricingH: "What it costs", pricing: "Building, editing and tailoring are free. You pay a one-time fee only when you download a finished PDF.",
    jobsH: "Find a job to tailor your CV to", jobsP: "Browse open roles by country:",
    countries: [
      { slug: "morocco", label: "Jobs in Morocco" }, { slug: "france", label: "Jobs in France" }, { slug: "belgium", label: "Jobs in Belgium" },
      { slug: "germany", label: "Jobs in Germany" }, { slug: "netherlands", label: "Jobs in the Netherlands" }, { slug: "saudi-arabia", label: "Jobs in Saudi Arabia" },
    ],
    faqH: "Frequently asked questions",
    faq: [
      { q: "Is the CV builder really free?", a: "Yes. Creating, editing, tailoring with AI and previewing are free. You only pay once, when you download your finished CV as a PDF." },
      { q: "Do I need an account?", a: "No account is needed to build or tailor your CV. You sign in only at download, so your CV is saved to your dashboard." },
      { q: "Can I import my existing CV?", a: "Yes. Upload a PDF or DOCX file and we turn it into an editable CV you can tailor and restyle." },
      { q: "What does “tailor to a job” mean?", a: "You pick a job offer and AI rewrites your headline, summary and highlighted skills so they match what that employer is asking for. You can edit everything afterwards." },
      { q: "Which languages are supported?", a: "English, French and Arabic, including right-to-left layouts for Arabic CVs." },
    ],
  },
  fr: {
    title: "Créer un CV gratuit avec l'IA — 10 modèles compatibles ATS | opportunty",
    description: "Créez votre CV en ligne gratuitement : importez votre ancien CV ou partez de zéro, choisissez parmi 10 modèles ATS et laissez l'IA l'adapter à chaque offre. Français, anglais et arabe.",
    ogLocale: "fr_FR",
    eyebrow: "Créateur de CV gratuit", h1: "Un CV adapté à chaque offre — gratuit, avec l'IA",
    sub: "Importez votre CV actuel ou partez de zéro, choisissez un modèle, puis laissez l'IA l'adapter à une vraie offre d'emploi au Maroc, en Europe ou en Arabie saoudite. Sans compte pour commencer.",
    ctaBuild: "Créer mon CV maintenant", ctaUpload: "Importer mon CV et choisir une offre", free: "Modification gratuite · payez seulement au téléchargement",
    stepsH: "Comment ça marche",
    steps: [
      { h: "Ajoutez votre CV", p: "Importez un PDF ou un fichier Word : nous le transformons en CV modifiable. Ou partez d'une page vierge." },
      { h: "Choisissez une offre", p: "Sélectionnez une offre du fil d'emplois. L'IA réécrit votre titre, votre résumé et vos compétences pour y correspondre." },
      { h: "Téléchargez", p: "Choisissez l'un des 10 modèles, ajustez ce que vous voulez et téléchargez un PDF propre." },
    ],
    templatesH: "10 modèles compatibles ATS", templatesP: "Des mises en page lisibles par les logiciels de recrutement, du plus sobre au plus créatif.",
    whyH: "Pourquoi opportunty",
    why: [
      "Une IA qui adapte votre CV à une offre précise, pas une réécriture générique",
      "CV en français, anglais et arabe (mise en page de droite à gauche incluse)",
      "Offres d'emploi au Maroc, en France, en Belgique, en Allemagne, aux Pays-Bas et en Arabie saoudite",
      "Relecture et score de CV qui montrent quoi améliorer",
    ],
    pricingH: "Combien ça coûte", pricing: "La création, la modification et l'adaptation sont gratuites. Vous payez une seule fois, uniquement au téléchargement du PDF final.",
    jobsH: "Trouvez une offre pour adapter votre CV", jobsP: "Parcourez les offres par pays :",
    countries: [
      { slug: "morocco", label: "Emploi au Maroc" }, { slug: "france", label: "Emploi en France" }, { slug: "belgium", label: "Emploi en Belgique" },
      { slug: "germany", label: "Emploi en Allemagne" }, { slug: "netherlands", label: "Emploi aux Pays-Bas" }, { slug: "saudi-arabia", label: "Emploi en Arabie saoudite" },
    ],
    faqH: "Questions fréquentes",
    faq: [
      { q: "Le créateur de CV est-il vraiment gratuit ?", a: "Oui. Créer, modifier, adapter avec l'IA et prévisualiser votre CV est gratuit. Vous payez une seule fois, au téléchargement du PDF final." },
      { q: "Faut-il créer un compte ?", a: "Non, aucun compte n'est nécessaire pour créer ou adapter votre CV. Vous vous connectez seulement au téléchargement, pour retrouver votre CV dans votre espace." },
      { q: "Puis-je importer mon CV actuel ?", a: "Oui. Importez un fichier PDF ou DOCX : nous le transformons en CV modifiable que vous pouvez adapter et remettre en forme." },
      { q: "Que veut dire « adapter à une offre » ?", a: "Vous choisissez une offre et l'IA réécrit votre titre, votre résumé et vos compétences clés pour correspondre à ce que recherche l'employeur. Tout reste modifiable ensuite." },
      { q: "Quelles langues sont disponibles ?", a: "Français, anglais et arabe, avec une mise en page de droite à gauche pour les CV en arabe." },
    ],
  },
  ar: {
    title: "إنشاء سيرة ذاتية مجاناً بالذكاء الاصطناعي — 10 قوالب متوافقة مع ATS | opportunty",
    description: "أنشئ سيرتك الذاتية مجاناً: ارفع سيرتك الحالية أو ابدأ من الصفر، اختر أحد 10 قوالب متوافقة مع ATS، ودع الذكاء الاصطناعي يكيّفها مع أي وظيفة. بالعربية والفرنسية والإنجليزية.",
    ogLocale: "ar_MA",
    eyebrow: "منشئ سيرة ذاتية مجاني", h1: "سيرة ذاتية تناسب الوظيفة — مجاناً وبالذكاء الاصطناعي",
    sub: "ارفع سيرتك الحالية أو ابدأ من الصفر، اختر قالباً، ثم دع الذكاء الاصطناعي يكيّفها مع عرض عمل حقيقي في المغرب أو أوروبا أو السعودية. لا حاجة لحساب للبدء.",
    ctaBuild: "أنشئ سيرتي الآن", ctaUpload: "ارفع سيرتي واختر وظيفة", free: "التعديل مجاني · الدفع عند التحميل فقط",
    stepsH: "كيف يعمل",
    steps: [
      { h: "أضف سيرتك الذاتية", p: "ارفع ملف PDF أو Word ونحوّله إلى سيرة قابلة للتعديل — أو ابدأ من صفحة فارغة." },
      { h: "اختر وظيفة", p: "اختر عرضاً من قائمة الوظائف، ويعيد الذكاء الاصطناعي كتابة مسمّاك وملخّصك ومهاراتك لتناسبه." },
      { h: "حمّل", p: "اختر أحد القوالب العشرة، عدّل ما تريد، وحمّل ملف PDF نظيفاً." },
    ],
    templatesH: "10 قوالب متوافقة مع ATS", templatesP: "تصاميم واضحة تقرأها أنظمة تتبّع المتقدمين، من البسيط إلى الإبداعي.",
    whyH: "لماذا opportunty",
    why: [
      "ذكاء اصطناعي يكيّف سيرتك مع وظيفة محددة، لا إعادة صياغة عامة",
      "سير ذاتية بالعربية والفرنسية والإنجليزية مع دعم الكتابة من اليمين إلى اليسار",
      "وظائف في المغرب وفرنسا وبلجيكا وألمانيا وهولندا والسعودية",
      "تدقيق لغوي وتقييم للسيرة يوضح ما يجب تحسينه",
    ],
    pricingH: "كم يكلّف", pricing: "الإنشاء والتعديل والتكييف مجانية. تدفع مرة واحدة فقط عند تحميل ملف PDF النهائي.",
    jobsH: "ابحث عن وظيفة لتكييف سيرتك معها", jobsP: "تصفّح الوظائف حسب الدولة:",
    countries: [
      { slug: "morocco", label: "وظائف في المغرب" }, { slug: "saudi-arabia", label: "وظائف في السعودية" }, { slug: "france", label: "وظائف في فرنسا" },
      { slug: "belgium", label: "وظائف في بلجيكا" }, { slug: "germany", label: "وظائف في ألمانيا" }, { slug: "netherlands", label: "وظائف في هولندا" },
    ],
    faqH: "أسئلة شائعة",
    faq: [
      { q: "هل منشئ السيرة الذاتية مجاني فعلاً؟", a: "نعم. الإنشاء والتعديل والتكييف بالذكاء الاصطناعي والمعاينة كلها مجانية. تدفع مرة واحدة فقط عند تحميل سيرتك بصيغة PDF." },
      { q: "هل أحتاج إلى حساب؟", a: "لا حاجة لحساب لإنشاء سيرتك أو تكييفها. تسجّل الدخول فقط عند التحميل لحفظ سيرتك في لوحة التحكم." },
      { q: "هل يمكنني استيراد سيرتي الحالية؟", a: "نعم. ارفع ملف PDF أو DOCX ونحوّله إلى سيرة قابلة للتعديل يمكنك تكييفها وتغيير تصميمها." },
      { q: "ماذا يعني «تكييف السيرة مع وظيفة»؟", a: "تختار عرض عمل، ويعيد الذكاء الاصطناعي كتابة مسمّاك وملخّصك وأبرز مهاراتك لتطابق ما يطلبه صاحب العمل. ويبقى كل شيء قابلاً للتعديل." },
      { q: "ما اللغات المتاحة؟", a: "العربية والفرنسية والإنجليزية، مع تصميم من اليمين إلى اليسار للسير الذاتية بالعربية." },
    ],
  },
};

export const TEMPLATE_IMAGES = ["corso", "meridian", "aria", "dahab", "medina", "vertex", "atlas", "lumen", "helix", "slate"] as const;
export { COUNTRY_SLUGS };
