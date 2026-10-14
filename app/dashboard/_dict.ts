import type { Lang } from "../i18n";

export interface DashDict {
  dashboard: string; seeker: string; employer: string; home: string; signOut: string;
  loading: string; error: string;
  // seeker
  seekerTitle: string; seekerSub: string;
  kCVs: string; kCVsNote: string; kScore: string; kScoreNote: string; kTailored: string; kTailoredNote: string; kMatch: string; kMatchNote: string;
  noCV: string; noCVNote: string; createCV: string; openCV: string; openBuilder: string;
  checklist: string; checklistSub: string; allDone: string;
  activity: string; activitySub: string; noActivity: string;
  matches: string; matchesSub: string; noMatches: string; matchCol: string; skillsCol: string;
  tailored: string; tailoredSub: string; noTailored: string; jobCol: string; companyCol: string; whenCol: string; openCol: string;
  myCVs: string; updated: string; tailorCta: string; browseJobs: string;
  scoreItems: Record<string, string>;
  // employer
  employerTitle: string; employerSub: string;
  eActive: string; eActiveNote: string; eNew7: string; eNew7Note: string; eCompanies: string; eCompaniesNote: string; eCountries: string; eCountriesNote: string;
  perDay: string; perDaySub: string; byCountry: string; byCountrySub: string; topCompanies: string; topCompaniesSub: string; topSkills: string; topSkillsSub: string;
  byType: string; byTypeSub: string; latest: string; latestSub: string; title: string; location: string; type: string; posted: string;
  employerNote: string; today: string; daysAgo: (n: number) => string; none: string;
  countries: Record<string, string>;
}

const en: DashDict = {
  dashboard: "Dashboard", seeker: "Job seeker", employer: "Employer", home: "Back to jobs", signOut: "Sign out",
  loading: "Loading…", error: "Couldn't load your data. Please refresh.",
  seekerTitle: "Your job search", seekerSub: "Your CVs, the jobs you tailored them for, and the best matches right now.",
  kCVs: "Saved CVs", kCVsNote: "In your account", kScore: "CV score", kScoreNote: "Latest CV, out of 100", kTailored: "Jobs tailored", kTailoredNote: "CVs rewritten for a job", kMatch: "Best match", kMatchNote: "Top job vs your skills",
  noCV: "No CV in your dashboard yet", noCVNote: "Upload or build a CV and it will appear here with its score and best-matching jobs.", createCV: "Build a CV", openCV: "Open CV", openBuilder: "Open editor",
  checklist: "Make your CV stronger", checklistSub: "Biggest gains first", allDone: "Everything is complete. Nice work.",
  activity: "Tailoring activity", activitySub: "Jobs you tailored a CV for, per week", noActivity: "Nothing yet. Drag a job onto your CV on the home page.",
  matches: "Best matches", matchesSub: "Active jobs ranked by overlap with your CV skills", noMatches: "Add skills to your CV to see matches.", matchCol: "Match", skillsCol: "Shared skills",
  tailored: "Tailored for", tailoredSub: "Your latest tailored CVs", noTailored: "No tailored CV yet.", jobCol: "Job", companyCol: "Company", whenCol: "When", openCol: "CV",
  myCVs: "Your CVs", updated: "Updated", tailorCta: "Tailor a CV", browseJobs: "Browse jobs",
  scoreItems: {
    "contact-full": "Complete first name, email and phone", title: "Add a professional title", photo: "Add a profile photo",
    summary: "Write a professional summary (50+ words)", "exp-exists": "Add at least one work experience", "exp-bullets": "Give each job 2+ key points",
    education: "Add a degree or education", skills: "List at least 5 skills", languages: "Add the languages you speak",
    linkedin: "Add your LinkedIn URL", certifications: "Add a certification",
  },
  employerTitle: "Hiring market", employerSub: "Live view of the jobs on opportunity.com: where they are, who is hiring and what skills they ask for.",
  eActive: "Live listings", eActiveNote: "Open right now", eNew7: "New this week", eNew7Note: "Added in the last 7 days", eCompanies: "Hiring companies", eCompaniesNote: "With an open listing", eCountries: "Countries", eCountriesNote: "With listings",
  perDay: "New listings per day", perDaySub: "Last 30 days", byCountry: "Listings by country", byCountrySub: "Active listings", topCompanies: "Most active companies", topCompaniesSub: "Open listings",
  topSkills: "Skills in demand", topSkillsSub: "Mentions across active listings", byType: "Contract types", byTypeSub: "Active listings", latest: "Latest listings", latestSub: "Newest first",
  title: "Title", location: "Location", type: "Type", posted: "Posted",
  employerNote: "Posting your own jobs and seeing views and applicants per listing will arrive with employer accounts. Everything here comes from the live job feed.",
  today: "Today", daysAgo: (n) => `${n} d ago`, none: "No data yet.",
  countries: { MA: "Morocco", FR: "France", DE: "Germany", BE: "Belgium", NL: "Netherlands", SA: "Saudi Arabia" },
};

const fr: DashDict = {
  dashboard: "Tableau de bord", seeker: "Candidat", employer: "Recruteur", home: "Retour aux offres", signOut: "Déconnexion",
  loading: "Chargement…", error: "Impossible de charger vos données. Actualisez la page.",
  seekerTitle: "Votre recherche d'emploi", seekerSub: "Vos CV, les offres pour lesquelles vous les avez adaptés et les meilleures correspondances du moment.",
  kCVs: "CV enregistrés", kCVsNote: "Dans votre compte", kScore: "Score du CV", kScoreNote: "Dernier CV, sur 100", kTailored: "Offres ciblées", kTailoredNote: "CV réécrits pour une offre", kMatch: "Meilleure correspondance", kMatchNote: "Meilleure offre vs vos compétences",
  noCV: "Aucun CV dans votre tableau de bord", noCVNote: "Importez ou créez un CV : il apparaîtra ici avec son score et les offres les plus proches.", createCV: "Créer un CV", openCV: "Ouvrir le CV", openBuilder: "Ouvrir l'éditeur",
  checklist: "Renforcez votre CV", checklistSub: "Les plus gros gains d'abord", allDone: "Tout est complet. Bravo.",
  activity: "Activité d'adaptation", activitySub: "Offres pour lesquelles vous avez adapté un CV, par semaine", noActivity: "Rien pour l'instant. Glissez une offre sur votre CV depuis l'accueil.",
  matches: "Meilleures correspondances", matchesSub: "Offres actives classées selon vos compétences", noMatches: "Ajoutez des compétences à votre CV pour voir les correspondances.", matchCol: "Match", skillsCol: "Compétences communes",
  tailored: "CV adaptés", tailoredSub: "Vos derniers CV adaptés", noTailored: "Aucun CV adapté pour l'instant.", jobCol: "Offre", companyCol: "Entreprise", whenCol: "Quand", openCol: "CV",
  myCVs: "Vos CV", updated: "Modifié", tailorCta: "Adapter un CV", browseJobs: "Voir les offres",
  scoreItems: {
    "contact-full": "Compléter prénom, email et téléphone", title: "Ajouter un titre professionnel", photo: "Ajouter une photo de profil",
    summary: "Rédiger un résumé professionnel (50+ mots)", "exp-exists": "Ajouter au moins une expérience", "exp-bullets": "Donner 2+ points clés par poste",
    education: "Ajouter un diplôme ou une formation", skills: "Lister au moins 5 compétences", languages: "Ajouter les langues parlées",
    linkedin: "Ajouter votre URL LinkedIn", certifications: "Ajouter une certification",
  },
  employerTitle: "Marché de l'emploi", employerSub: "Vue en direct des offres d'opportunity.com : où elles sont, qui recrute et quelles compétences sont demandées.",
  eActive: "Offres actives", eActiveNote: "Ouvertes maintenant", eNew7: "Nouvelles cette semaine", eNew7Note: "Ajoutées ces 7 derniers jours", eCompanies: "Entreprises qui recrutent", eCompaniesNote: "Avec une offre ouverte", eCountries: "Pays", eCountriesNote: "Avec des offres",
  perDay: "Nouvelles offres par jour", perDaySub: "30 derniers jours", byCountry: "Offres par pays", byCountrySub: "Offres actives", topCompanies: "Entreprises les plus actives", topCompaniesSub: "Offres ouvertes",
  topSkills: "Compétences recherchées", topSkillsSub: "Mentions dans les offres actives", byType: "Types de contrat", byTypeSub: "Offres actives", latest: "Dernières offres", latestSub: "Les plus récentes d'abord",
  title: "Titre", location: "Lieu", type: "Type", posted: "Publiée",
  employerNote: "La publication de vos propres offres et les vues/candidats par offre arriveront avec les comptes recruteurs. Tout ici provient du flux d'offres en direct.",
  today: "Aujourd'hui", daysAgo: (n) => `il y a ${n} j`, none: "Pas encore de données.",
  countries: { MA: "Maroc", FR: "France", DE: "Allemagne", BE: "Belgique", NL: "Pays-Bas", SA: "Arabie saoudite" },
};

const ar: DashDict = {
  dashboard: "لوحة التحكم", seeker: "باحث عن عمل", employer: "صاحب عمل", home: "العودة إلى الوظائف", signOut: "تسجيل الخروج",
  loading: "جارٍ التحميل…", error: "تعذّر تحميل بياناتك. حدّث الصفحة.",
  seekerTitle: "بحثك عن عمل", seekerSub: "سيرك الذاتية، والوظائف التي كيّفتها لها، وأفضل الوظائف المطابقة الآن.",
  kCVs: "السير المحفوظة", kCVsNote: "في حسابك", kScore: "تقييم السيرة", kScoreNote: "آخر سيرة، من 100", kTailored: "وظائف مخصّصة", kTailoredNote: "سير أُعيدت كتابتها لوظيفة", kMatch: "أفضل تطابق", kMatchNote: "أفضل وظيفة مقابل مهاراتك",
  noCV: "لا توجد سيرة في لوحتك بعد", noCVNote: "ارفع سيرة أو أنشئ واحدة وستظهر هنا مع تقييمها وأفضل الوظائف المطابقة.", createCV: "أنشئ سيرة", openCV: "افتح السيرة", openBuilder: "افتح المحرر",
  checklist: "قوِّ سيرتك الذاتية", checklistSub: "الأكثر فائدة أولاً", allDone: "كل شيء مكتمل. أحسنت.",
  activity: "نشاط التخصيص", activitySub: "الوظائف التي خصّصت لها سيرتك، أسبوعياً", noActivity: "لا شيء بعد. اسحب وظيفة إلى سيرتك في الصفحة الرئيسية.",
  matches: "أفضل التطابقات", matchesSub: "الوظائف النشطة مرتبة حسب تطابق مهاراتك", noMatches: "أضف مهارات إلى سيرتك لتظهر التطابقات.", matchCol: "التطابق", skillsCol: "مهارات مشتركة",
  tailored: "سير مخصّصة", tailoredSub: "آخر سيرك المخصّصة", noTailored: "لا توجد سيرة مخصّصة بعد.", jobCol: "الوظيفة", companyCol: "الشركة", whenCol: "متى", openCol: "السيرة",
  myCVs: "سيرك الذاتية", updated: "آخر تعديل", tailorCta: "خصّص سيرة", browseJobs: "تصفح الوظائف",
  scoreItems: {
    "contact-full": "أكمل الاسم والبريد والهاتف", title: "أضف مسمى وظيفياً", photo: "أضف صورة شخصية",
    summary: "اكتب ملخصاً مهنياً (50+ كلمة)", "exp-exists": "أضف خبرة عمل واحدة على الأقل", "exp-bullets": "أضف نقطتين أو أكثر لكل وظيفة",
    education: "أضف شهادة أو تعليماً", skills: "اذكر 5 مهارات على الأقل", languages: "أضف اللغات التي تتحدثها",
    linkedin: "أضف رابط LinkedIn", certifications: "أضف شهادة مهنية",
  },
  employerTitle: "سوق التوظيف", employerSub: "نظرة مباشرة على وظائف opportunity.com: أين هي، ومن يوظّف، وما المهارات المطلوبة.",
  eActive: "وظائف نشطة", eActiveNote: "مفتوحة الآن", eNew7: "جديدة هذا الأسبوع", eNew7Note: "أُضيفت خلال 7 أيام", eCompanies: "شركات توظّف", eCompaniesNote: "لديها وظيفة مفتوحة", eCountries: "الدول", eCountriesNote: "فيها وظائف",
  perDay: "وظائف جديدة يومياً", perDaySub: "آخر 30 يوماً", byCountry: "الوظائف حسب الدولة", byCountrySub: "الوظائف النشطة", topCompanies: "الشركات الأكثر نشاطاً", topCompaniesSub: "وظائف مفتوحة",
  topSkills: "المهارات المطلوبة", topSkillsSub: "مرات الذكر في الوظائف النشطة", byType: "أنواع العقود", byTypeSub: "الوظائف النشطة", latest: "أحدث الوظائف", latestSub: "الأحدث أولاً",
  title: "المسمى", location: "الموقع", type: "النوع", posted: "نُشرت",
  employerNote: "نشر وظائفك ومشاهدات ومتقدمي كل وظيفة سيأتي مع حسابات أصحاب العمل. كل ما هنا من تغذية الوظائف المباشرة.",
  today: "اليوم", daysAgo: (n) => `منذ ${n} ي`, none: "لا توجد بيانات بعد.",
  countries: { MA: "المغرب", FR: "فرنسا", DE: "ألمانيا", BE: "بلجيكا", NL: "هولندا", SA: "السعودية" },
};

export const DASH: Record<Lang, DashDict> = { en, fr, ar };
