/** Homepage copy in English, French and Arabic. Job content itself (titles, descriptions) is shown as posted. */
export type Lang = "en" | "fr" | "ar";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "عربي" },
];
export type CountryCode = "MA" | "FR" | "DE" | "BE" | "NL" | "SA";

export interface Dict {
  arrow: string;
  nav: { employers: string; myCVs: string; signIn: string; postJob: string; dashboard: string };
  eyebrow: string; h1: string; sub: string;
  searchPlaceholder: string; search: string; countryLabel: string; cityLabel: string; allCities: string;
  pickTemplate: string; templatesMeta: string; useTemplate: string; prevTemplate: string; nextTemplate: string;
  loading: string; dragHint: string; sample: string;
  rolesIn: (n: number, inCountry: string) => string;
  noMatch: (q: string, inCountry: string) => string;
  noRoles: (inCountry: string) => string;
  viewDetails: string; hideDetails: string; apply: string; applySample: string; confirmTitle: string; confirmMsg: string; tailorFirst: string; applyAnyway: string; dragToCV: string; dragTitle: string; tapToCV: string; tapTitle: string; tapHint: string; panelIntroTap: string; startWithCVTap: string; nowTap: string; prev: string; next: string; newBadge: string; posted: string; pageOf: (p: number, n: number) => string;
  yourCV: string; panelIntro: string; startWithCV: string; pending: string;
  uploadCV: string; reading: string; pdfDocx: string; createScratch: string; useSaved: string;
  cvReady: string; cvFallback: string; dropIt: string; nowDrag: string; openBuilder: string; replaceCV: string; readingShort: string;
  tailoring: string; tailoredFor: string; keyMatches: string; continueBuilder: string; startOver: string; freeToEdit: string;
  uploadFailed: string; couldntRead: string; nameFallback: string;
  buildCV: string; freeHook: string; orTemplate: string;
  countries: Record<CountryCode, { name: string; in: string }>;
}

export const DICT: Record<Lang, Dict> = {
  en: {
    buildCV: "Build my CV", freeHook: "Free CV builder · 10 ATS templates · pay only to download", orTemplate: "Or start from a template",
    arrow: "→",
    nav: { employers: "For employers", myCVs: "My CVs", signIn: "Sign in", postJob: "Post a job", dashboard: "Dashboard" },
    eyebrow: "Job board · Morocco, Europe & Saudi Arabia",
    h1: "Find work you actually want",
    sub: "Pick a country, browse its roles, then drag one into your CV and let AI tailor it — no account needed.",
    searchPlaceholder: "Job title, skill or company", search: "Search", countryLabel: "Country", cityLabel: "City", allCities: "All cities",
    pickTemplate: "Pick a CV template", templatesMeta: "10 ATS-friendly · free to edit, pay only to download",
    useTemplate: "Use this template", prevTemplate: "Previous template", nextTemplate: "Next template",
    loading: "Loading…", dragHint: "drag any card into your CV", sample: "(sample listings)",
    rolesIn: (n, c) => `${n} open roles ${c}`,
    noMatch: (q, c) => `No roles matching “${q}” ${c}.`,
    noRoles: (c) => `No open roles ${c} yet — check back soon, or try another country.`,
    viewDetails: "View details", hideDetails: "Hide details", apply: "Apply", confirmTitle: "Apply without tailoring your CV?", confirmMsg: "A CV tailored to {job} gets noticed more often. Are you sure you don't want to tailor your CV first?", tailorFirst: "Tailor my CV first", applyAnyway: "Apply anyway", applySample: "Sample listing — no application link",
    dragToCV: "Drag to CV", dragTitle: "Drag this job onto your CV",
    tapToCV: "Use for my CV", tapTitle: "Tailor your CV to this job", tapHint: "tap “Use for my CV” on any job", panelIntroTap: "Tap “Use for my CV” on a job and we’ll tailor your CV to it. No account needed until you download.", startWithCVTap: "Start with your CV — then tap “Use for my CV” on any job.", nowTap: "Now tap “Use for my CV” on a job", prev: "Previous", next: "Next", newBadge: "New", posted: "Posted", pageOf: (p, n) => `Page ${p} of ${n}`,
    yourCV: "Your CV", panelIntro: "Drag a job from the list and we'll tailor your CV to it. No account needed until you download.",
    startWithCV: "Start with your CV — then drag any job here to tailor it.",
    pending: "To tailor your CV for {job} at {company}, first add your CV below.",
    uploadCV: "Upload your CV", reading: "Reading your CV…", pdfDocx: "PDF or DOCX · or",
    createScratch: "Create one from scratch", useSaved: "Use my saved CV instead",
    cvReady: "✓ CV ready", cvFallback: "Your CV", dropIt: "Drop it!", nowDrag: "Now drag a job here to tailor it",
    openBuilder: "Open in builder", replaceCV: "Replace CV", readingShort: "Reading…",
    tailoring: "Tailoring your CV for {job} at {company}…", tailoredFor: "Tailored for {job}",
    keyMatches: "Key matches", continueBuilder: "Continue in CV builder", startOver: "Start over",
    freeToEdit: "Free to edit — sign in only when you're ready to download.",
    uploadFailed: "Upload failed — check your connection and try again.", couldntRead: "Couldn't read that file.", nameFallback: "[Your name]",
    countries: {
      MA: { name: "Morocco", in: "in Morocco" }, FR: { name: "France", in: "in France" }, DE: { name: "Germany", in: "in Germany" },
      BE: { name: "Belgium", in: "in Belgium" }, NL: { name: "Netherlands", in: "in the Netherlands" }, SA: { name: "Saudi Arabia", in: "in Saudi Arabia" },
    },
  },
  fr: {
    buildCV: "Créer mon CV", freeHook: "CV gratuit · 10 modèles ATS · payez seulement au téléchargement", orTemplate: "Ou partez d'un modèle",
    arrow: "→",
    nav: { employers: "Recruteurs", myCVs: "Mes CV", signIn: "Connexion", postJob: "Publier une offre", dashboard: "Tableau de bord" },
    eyebrow: "Offres d'emploi · Maroc, Europe & Arabie saoudite",
    h1: "Trouvez le travail qui vous plaît vraiment",
    sub: "Choisissez un pays, parcourez les offres, puis glissez-en une dans votre CV et laissez l'IA l'adapter — sans compte.",
    searchPlaceholder: "Poste ou entreprise", search: "Rechercher", countryLabel: "Pays", cityLabel: "Ville", allCities: "Toutes les villes",
    pickTemplate: "Choisissez un modèle de CV", templatesMeta: "10 modèles compatibles ATS · modification gratuite, paiement au téléchargement",
    useTemplate: "Utiliser ce modèle", prevTemplate: "Modèle précédent", nextTemplate: "Modèle suivant",
    loading: "Chargement…", dragHint: "glissez une carte dans votre CV", sample: "(offres d'exemple)",
    rolesIn: (n, c) => `${n} offres ${c}`,
    noMatch: (q, c) => `Aucune offre correspondant à « ${q} » ${c}.`,
    noRoles: (c) => `Aucune offre ${c} pour le moment — revenez bientôt ou essayez un autre pays.`,
    viewDetails: "Voir les détails", hideDetails: "Masquer les détails", apply: "Postuler", confirmTitle: "Postuler sans adapter votre CV ?", confirmMsg: "Un CV adapté à {job} est plus souvent remarqué. Êtes-vous sûr de ne pas vouloir adapter votre CV d'abord ?", tailorFirst: "Adapter mon CV d'abord", applyAnyway: "Postuler quand même", applySample: "Offre d'exemple — pas de lien de candidature",
    dragToCV: "Glisser vers le CV", dragTitle: "Glissez cette offre sur votre CV",
    tapToCV: "Utiliser pour mon CV", tapTitle: "Adapter votre CV à cette offre", tapHint: "touchez « Utiliser pour mon CV » sur une offre", panelIntroTap: "Touchez « Utiliser pour mon CV » sur une offre et nous adaptons votre CV. Aucun compte requis avant le téléchargement.", startWithCVTap: "Commencez par votre CV — puis touchez « Utiliser pour mon CV » sur une offre.", nowTap: "Touchez maintenant « Utiliser pour mon CV » sur une offre", prev: "Précédent", next: "Suivant", newBadge: "Nouveau", posted: "Publiée", pageOf: (p, n) => `Page ${p} sur ${n}`,
    yourCV: "Votre CV", panelIntro: "Glissez une offre depuis la liste et nous adapterons votre CV. Aucun compte requis avant le téléchargement.",
    startWithCV: "Commencez par votre CV — puis glissez une offre ici pour l'adapter.",
    pending: "Pour adapter votre CV à {job} chez {company}, ajoutez d'abord votre CV ci-dessous.",
    uploadCV: "Importer votre CV", reading: "Lecture de votre CV…", pdfDocx: "PDF ou DOCX · ou",
    createScratch: "Créer un CV de zéro", useSaved: "Utiliser mon CV enregistré",
    cvReady: "✓ CV prêt", cvFallback: "Votre CV", dropIt: "Déposez-la !", nowDrag: "Glissez maintenant une offre ici pour l'adapter",
    openBuilder: "Ouvrir dans l'éditeur", replaceCV: "Remplacer le CV", readingShort: "Lecture…",
    tailoring: "Adaptation de votre CV à {job} chez {company}…", tailoredFor: "Adapté pour {job}",
    keyMatches: "Points communs clés", continueBuilder: "Continuer dans l'éditeur de CV", startOver: "Recommencer",
    freeToEdit: "Modification gratuite — connectez-vous seulement pour télécharger.",
    uploadFailed: "Échec de l'import — vérifiez votre connexion et réessayez.", couldntRead: "Impossible de lire ce fichier.", nameFallback: "[Votre nom]",
    countries: {
      MA: { name: "Maroc", in: "au Maroc" }, FR: { name: "France", in: "en France" }, DE: { name: "Allemagne", in: "en Allemagne" },
      BE: { name: "Belgique", in: "en Belgique" }, NL: { name: "Pays-Bas", in: "aux Pays-Bas" }, SA: { name: "Arabie saoudite", in: "en Arabie saoudite" },
    },
  },
  ar: {
    buildCV: "أنشئ سيرتي", freeHook: "منشئ سيرة ذاتية مجاني · 10 قوالب ATS · الدفع عند التحميل فقط", orTemplate: "أو ابدأ من قالب",
    arrow: "←",
    nav: { employers: "للشركات", myCVs: "سيرتي الذاتية", signIn: "تسجيل الدخول", postJob: "انشر وظيفة", dashboard: "لوحة التحكم" },
    eyebrow: "وظائف · المغرب وأوروبا والسعودية",
    h1: "ابحث عن عمل تحبه فعلاً",
    sub: "اختر دولة، تصفّح الوظائف، ثم اسحب وظيفة إلى سيرتك الذاتية ودع الذكاء الاصطناعي يكيّفها — بدون حساب.",
    searchPlaceholder: "المسمى الوظيفي أو الشركة", search: "بحث", countryLabel: "الدولة", cityLabel: "المدينة", allCities: "كل المدن",
    pickTemplate: "اختر قالب السيرة الذاتية", templatesMeta: "10 قوالب متوافقة مع ATS · التعديل مجاني والدفع عند التحميل فقط",
    useTemplate: "استخدم هذا القالب", prevTemplate: "القالب السابق", nextTemplate: "القالب التالي",
    loading: "جارٍ التحميل…", dragHint: "اسحب أي بطاقة إلى سيرتك الذاتية", sample: "(وظائف تجريبية)",
    rolesIn: (n, c) => `${n} وظيفة ${c}`,
    noMatch: (q, c) => `لا توجد وظائف مطابقة لـ «${q}» ${c}.`,
    noRoles: (c) => `لا توجد وظائف مفتوحة ${c} حالياً — عد قريباً أو جرّب دولة أخرى.`,
    viewDetails: "عرض التفاصيل", hideDetails: "إخفاء التفاصيل", apply: "قدّم الآن", confirmTitle: "التقديم دون تخصيص سيرتك الذاتية؟", confirmMsg: "السيرة الذاتية المخصّصة لوظيفة {job} تلفت الانتباه أكثر. هل أنت متأكد أنك لا تريد تخصيص سيرتك أولاً؟", tailorFirst: "خصّص سيرتي أولاً", applyAnyway: "قدّم على أي حال", applySample: "وظيفة تجريبية — لا يوجد رابط تقديم",
    dragToCV: "اسحب إلى السيرة", dragTitle: "اسحب هذه الوظيفة إلى سيرتك الذاتية",
    tapToCV: "استخدمها لسيرتي", tapTitle: "كيّف سيرتك الذاتية مع هذه الوظيفة", tapHint: "اضغط «استخدمها لسيرتي» على أي وظيفة", panelIntroTap: "اضغط «استخدمها لسيرتي» على وظيفة وسنكيّف سيرتك الذاتية. لا حاجة لحساب قبل التحميل.", startWithCVTap: "ابدأ بسيرتك الذاتية — ثم اضغط «استخدمها لسيرتي» على أي وظيفة.", nowTap: "الآن اضغط «استخدمها لسيرتي» على وظيفة", prev: "السابق", next: "التالي", newBadge: "جديد", posted: "نُشرت", pageOf: (p, n) => `صفحة ${p} من ${n}`,
    yourCV: "سيرتك الذاتية", panelIntro: "اسحب وظيفة من القائمة وسنكيّف سيرتك الذاتية معها. لا حاجة لحساب حتى تقوم بالتحميل.",
    startWithCV: "ابدأ بسيرتك الذاتية — ثم اسحب أي وظيفة إلى هنا لتكييفها.",
    pending: "لتكييف سيرتك الذاتية مع {job} لدى {company}، أضف سيرتك الذاتية أولاً أدناه.",
    uploadCV: "ارفع سيرتك الذاتية", reading: "جارٍ قراءة سيرتك الذاتية…", pdfDocx: "PDF أو DOCX · أو",
    createScratch: "أنشئ واحدة من الصفر", useSaved: "استخدم سيرتي المحفوظة",
    cvReady: "✓ السيرة جاهزة", cvFallback: "سيرتك الذاتية", dropIt: "أفلتها هنا!", nowDrag: "الآن اسحب وظيفة إلى هنا لتكييفها",
    openBuilder: "افتح في المحرر", replaceCV: "استبدال السيرة", readingShort: "جارٍ القراءة…",
    tailoring: "جارٍ تكييف سيرتك الذاتية مع {job} لدى {company}…", tailoredFor: "مكيّفة لـ {job}",
    keyMatches: "أبرز نقاط التطابق", continueBuilder: "تابع في محرر السيرة", startOver: "ابدأ من جديد",
    freeToEdit: "التعديل مجاني — سجّل الدخول فقط عندما تكون جاهزاً للتحميل.",
    uploadFailed: "فشل الرفع — تحقق من اتصالك وحاول مجدداً.", couldntRead: "تعذّرت قراءة الملف.", nameFallback: "[اسمك]",
    countries: {
      MA: { name: "المغرب", in: "في المغرب" }, FR: { name: "فرنسا", in: "في فرنسا" }, DE: { name: "ألمانيا", in: "في ألمانيا" },
      BE: { name: "بلجيكا", in: "في بلجيكا" }, NL: { name: "هولندا", in: "في هولندا" }, SA: { name: "السعودية", in: "في السعودية" },
    },
  },
};
