/** Copy for every page except the homepage (which has its own, richer dictionary in app/i18n.ts). */
import type { Lang } from "../i18n";

export interface UiDict {
  signIn: string; createAccount: string; notNow: string;
  gateTitle: string; gateMsg: string;
  loginTitle: string; loginNote: string; email: string; password: string; signingIn: string; noAccount: string; createOne: string;
  signupTitle: string; signupNote: string; passwordMin: string; creatingAccount: string; checkInbox: string; haveAccount: string;
  payTitle: string; cvSavedNamed: string; cvSaved: string; payNote: string; payBtn: string; payBtnTitle: string; backToEditor: string;
  payRedirecting: string; payConfirming: string; payFailed: string; payPending: string; paidTitle: string; paidNote: string; downloadNow: string; printTitle: string; printHint: string; printLocked: string;
  needSignInBuild: string; needSignInNote: string; myCVs: string; home: string; firstCV: string; nCVs: (n: number) => string;
  translating: string; translatedTo: string; undo: string; translateFailed: string; reportTitle: string; reportFit: string; reportChanged: string; reportMissing: string; reportMissingNote: string; reportMatched: string; reportRestore: string; reportClose: string; reportBasic: string; newCV: string; uploadCV: string; uploadingCV: string; uploadFailed: string; deleteCV: string; clearAll: string; confirmDelete: string; confirmClear: string; deleteFailed: string; noCVs: string; noCVsNote: string; createFirst: string; chooseTemplate: string;
  saving: string; saved: string; savedDevice: string; downloadPdf: string; reach30: string; signInToDownload: string; downloadTitle: string;
  complete: string; savingShort: string; previewTab: string; formTab: string; gateDownloadTitle: string; gateDownloadMsg: string;
  scoreTitle: string; scoreImprove: string; scoreDone: string; scoreGate: string; scoreItems: Record<string, string>;
  dragReorder: string; hideSection: string; showSection: string; hide: string; show: string;
  fit: string; templates: string; aiRewrite: string; remove: string;
  firstName: string; lastName: string; jobTitle: string; phone: string; city: string; linkedin: string; website: string;
  changePhoto: string; click: string;
  certification: string; certName: string; issuer: string; year: string; addCert: string;
  newEducation: string; degree: string; school: string; start: string; end: string; details: string; addEducation: string;
  newJob: string; role: string; company: string; present: string; achievements: string; addExperience: string;
  language: string; level: string; mastery: string; addLanguage: string;
  project: string; name: string; description: string; addProject: string;
  group: string; skillsList: string; addGroup: string;
  sections: Record<string, string>; photo: string;
}

const en: UiDict = {
  signIn: "Sign in", createAccount: "Create account", notNow: "Not now",
  gateTitle: "Sign in to continue", gateMsg: "opportunity.com saves and downloads CVs to a real account — no anonymous sessions — so this step needs you signed in.",
  loginTitle: "Sign in", loginNote: "A real account is required — opportunity.com doesn't use anonymous sessions.", email: "Email", password: "Password",
  signingIn: "Signing in…", noAccount: "No account yet?", createOne: "Create one",
  signupTitle: "Create your account", signupNote: "Job feed + AI-tailored CVs, saved to your own account.", passwordMin: "Password (min 6 characters)",
  creatingAccount: "Creating account…", checkInbox: "Check your inbox to confirm {email}, then sign in.", haveAccount: "Already have an account?",
  payTitle: "Unlock your PDF download", cvSavedNamed: "Your CV “{name}” ({template}) is saved and ready.", cvSaved: "Your CV is saved and ready.",
  payNote: "One-time payment for this template, no subscription. You'll be redirected to our secure payment partner and brought straight back to download.",
  payBtn: "Pay & download", payBtnTitle: "Secure checkout", backToEditor: "← Back to editor",
  payRedirecting: "Redirecting to secure checkout…", payConfirming: "Confirming your payment…", payFailed: "Something went wrong. Please try again.", payPending: "We haven't received the payment confirmation yet. Refresh this page in a moment.", paidTitle: "Payment received — thank you!", paidNote: "This template is unlocked. Download your CV as a PDF; you can come back and download it again any time.", downloadNow: "Download PDF", printTitle: "Your CV is ready", printHint: "In the print window choose “Save as PDF” as the destination, and turn off headers and footers.", printLocked: "Please unlock this template first.",
  needSignInBuild: "Sign in to build your CV", needSignInNote: "opportunity.com saves your CVs to a real account — no anonymous sessions.",
  myCVs: "My CVs", home: "← Home", firstCV: "Create your first professional CV", nCVs: (n) => `${n} CV${n > 1 ? "s" : ""} saved`,
  translating: "Translating your CV…", translatedTo: "CV translated", undo: "Undo", translateFailed: "Couldn't translate the CV text. Only the headings changed.", reportTitle: "Tailored for {job}", reportFit: "Match with this job", reportChanged: "What we changed", reportMissing: "Asked by the job, not on your CV", reportMissingNote: "Add these only if you really have them.", reportMatched: "Already covered", reportRestore: "Restore my original CV", reportClose: "Close", reportBasic: "Basic tailoring was used (AI unavailable right now).", newCV: "+ New CV", uploadCV: "Upload your CV", uploadingCV: "Reading…", uploadFailed: "Couldn't read that file. Try a text-based PDF or a DOCX.", deleteCV: "Delete", clearAll: "Clear all CVs", confirmDelete: "Delete this CV? This cannot be undone.", confirmClear: "Delete ALL your saved CVs? This cannot be undone.", deleteFailed: "Could not delete. Please try again.", noCVs: "No CVs yet", noCVsNote: "Create a professional CV in a few minutes.", createFirst: "Create my first CV", chooseTemplate: "Choose a template",
  saving: "Saving…", saved: "Saved", savedDevice: "Saved on this device", downloadPdf: "Download PDF", reach30: "Reach 30% to download",
  signInToDownload: "Sign in to download", downloadTitle: "Download as PDF", complete: "complete", savingShort: "Saving…",
  previewTab: "👁 Preview", formTab: "✎ Form", gateDownloadTitle: "Sign in to download",
  gateDownloadMsg: "Your CV stays saved in this browser while you edit. Downloading it needs a real account — that's also where you'll complete payment.",
  scoreTitle: "CV completeness", scoreImprove: "To improve", scoreDone: "Done", scoreGate: "PDF download unlocks at 30% completeness.",
  scoreItems: {
    "contact-full": "Complete first name, email and phone", title: "Add a professional title", photo: "Add a profile photo",
    summary: "Write a professional summary (50+ words)", "exp-exists": "Add at least one work experience", "exp-bullets": "Give each job 2+ key points",
    education: "Add a degree or education", skills: "List at least 5 skills", languages: "Add the languages you speak",
    linkedin: "Add your LinkedIn URL", certifications: "Add a certification",
  },
  dragReorder: "Drag to reorder", hideSection: "Hide section", showSection: "Show section", hide: "Hide", show: "Show",
  fit: "Fit", templates: "Templates", aiRewrite: "Rewrite with AI", remove: "Remove",
  firstName: "First name", lastName: "Last name", jobTitle: "Job title", phone: "Phone", city: "City", linkedin: "LinkedIn", website: "Website / Portfolio",
  changePhoto: "Click to change photo", click: "click",
  certification: "Certification", certName: "Name", issuer: "Issuer", year: "Year", addCert: "+ Add a certification",
  newEducation: "New education", degree: "Degree", school: "School", start: "Start", end: "End", details: "Details (optional)", addEducation: "+ Add education",
  newJob: "New position", role: "Role", company: "Company", present: "Present", achievements: "Achievements", addExperience: "+ Add experience",
  language: "Language", level: "Level", mastery: "Proficiency", addLanguage: "+ Add a language",
  project: "Project", name: "Name", description: "Description", addProject: "+ Add a project",
  group: "Group", skillsList: "Skills (comma-separated)", addGroup: "+ Add a group",
  sections: { summary: "Profile", experience: "Experience", education: "Education", skills: "Skills", languages: "Languages", certifications: "Certifications", projects: "Projects", interests: "Interests" }, photo: "+ Photo",
};

const fr: UiDict = {
  signIn: "Connexion", createAccount: "Créer un compte", notNow: "Pas maintenant",
  gateTitle: "Connectez-vous pour continuer", gateMsg: "opportunity.com enregistre et télécharge les CV sur un vrai compte — sans session anonyme — cette étape nécessite donc une connexion.",
  loginTitle: "Connexion", loginNote: "Un vrai compte est requis — opportunity.com n'utilise pas de sessions anonymes.", email: "E-mail", password: "Mot de passe",
  signingIn: "Connexion…", noAccount: "Pas encore de compte ?", createOne: "En créer un",
  signupTitle: "Créez votre compte", signupNote: "Offres d'emploi + CV adaptés par l'IA, enregistrés sur votre compte.", passwordMin: "Mot de passe (6 caractères min.)",
  creatingAccount: "Création du compte…", checkInbox: "Consultez votre boîte mail pour confirmer {email}, puis connectez-vous.", haveAccount: "Vous avez déjà un compte ?",
  payTitle: "Débloquez le téléchargement PDF", cvSavedNamed: "Votre CV « {name} » ({template}) est enregistré et prêt.", cvSaved: "Votre CV est enregistré et prêt.",
  payNote: "Paiement unique pour ce modèle, sans abonnement. Vous serez redirigé vers notre partenaire de paiement sécurisé puis ramené ici pour télécharger.",
  payBtn: "Payer et télécharger", payBtnTitle: "Paiement sécurisé", backToEditor: "← Retour à l'éditeur",
  payRedirecting: "Redirection vers le paiement sécurisé…", payConfirming: "Confirmation de votre paiement…", payFailed: "Une erreur est survenue. Veuillez réessayer.", payPending: "Nous n'avons pas encore reçu la confirmation du paiement. Actualisez la page dans un instant.", paidTitle: "Paiement reçu — merci !", paidNote: "Ce modèle est débloqué. Téléchargez votre CV en PDF ; vous pourrez le retélécharger à tout moment.", downloadNow: "Télécharger le PDF", printTitle: "Votre CV est prêt", printHint: "Dans la fenêtre d'impression, choisissez « Enregistrer au format PDF » et désactivez les en-têtes et pieds de page.", printLocked: "Veuillez d'abord débloquer ce modèle.",
  needSignInBuild: "Connectez-vous pour créer votre CV", needSignInNote: "opportunity.com enregistre vos CV sur un vrai compte — sans session anonyme.",
  myCVs: "Mes CV", home: "← Accueil", firstCV: "Créez votre premier CV professionnel", nCVs: (n) => `${n} CV enregistré${n > 1 ? "s" : ""}`,
  translating: "Traduction du CV…", translatedTo: "CV traduit", undo: "Annuler", translateFailed: "Traduction impossible. Seuls les titres ont changé.", reportTitle: "Adapté pour {job}", reportFit: "Adéquation avec l'offre", reportChanged: "Ce qui a changé", reportMissing: "Demandé par l'offre, absent de votre CV", reportMissingNote: "Ajoutez-les seulement si vous les maîtrisez vraiment.", reportMatched: "Déjà couvert", reportRestore: "Restaurer mon CV d'origine", reportClose: "Fermer", reportBasic: "Adaptation basique utilisée (IA indisponible pour le moment).", newCV: "+ Nouveau CV", uploadCV: "Importer votre CV", uploadingCV: "Lecture…", uploadFailed: "Impossible de lire ce fichier. Essayez un PDF texte ou un DOCX.", deleteCV: "Supprimer", clearAll: "Supprimer tous les CV", confirmDelete: "Supprimer ce CV ? Action irréversible.", confirmClear: "Supprimer TOUS vos CV enregistrés ? Action irréversible.", deleteFailed: "Suppression impossible. Réessayez.", noCVs: "Aucun CV pour l'instant", noCVsNote: "Créez un CV professionnel en quelques minutes.", createFirst: "Créer mon premier CV", chooseTemplate: "Choisissez un modèle",
  saving: "Enregistrement…", saved: "Enregistré", savedDevice: "Enregistré sur cet appareil", downloadPdf: "Télécharger PDF", reach30: "Atteignez 30 % pour télécharger",
  signInToDownload: "Connectez-vous pour télécharger", downloadTitle: "Télécharger en PDF", complete: "complet", savingShort: "Enregistrement…",
  previewTab: "👁 Aperçu", formTab: "✎ Formulaire", gateDownloadTitle: "Connectez-vous pour télécharger",
  gateDownloadMsg: "Votre CV reste enregistré dans ce navigateur pendant que vous le modifiez. Le télécharger nécessite un vrai compte — c'est aussi là que vous réglerez le paiement.",
  scoreTitle: "Complétude du CV", scoreImprove: "Pour progresser", scoreDone: "Complété", scoreGate: "Le téléchargement PDF est activé à partir de 30 % de complétion.",
  scoreItems: {
    "contact-full": "Compléter prénom, email et téléphone", title: "Ajouter un titre professionnel", photo: "Ajouter une photo de profil",
    summary: "Rédiger un résumé professionnel (50+ mots)", "exp-exists": "Ajouter au moins une expérience professionnelle", "exp-bullets": "Détailler chaque poste avec 2+ points clés",
    education: "Ajouter une formation ou diplôme", skills: "Lister au moins 5 compétences", languages: "Indiquer les langues parlées",
    linkedin: "Ajouter votre URL LinkedIn", certifications: "Ajouter une certification",
  },
  dragReorder: "Glisser pour réordonner", hideSection: "Masquer la section", showSection: "Afficher la section", hide: "Masquer", show: "Afficher",
  fit: "Ajuster", templates: "Modèles", aiRewrite: "Reformuler avec l'IA", remove: "Supprimer",
  firstName: "Prénom", lastName: "Nom", jobTitle: "Titre du poste", phone: "Téléphone", city: "Ville", linkedin: "LinkedIn", website: "Site web / Portfolio",
  changePhoto: "Cliquez pour changer la photo", click: "cliquer",
  certification: "Certification", certName: "Nom", issuer: "Émetteur", year: "Année", addCert: "+ Ajouter une certification",
  newEducation: "Nouvelle formation", degree: "Diplôme", school: "École", start: "Début", end: "Fin", details: "Détails (optionnel)", addEducation: "+ Ajouter une formation",
  newJob: "Nouveau poste", role: "Poste", company: "Entreprise", present: "Présent", achievements: "Réalisations", addExperience: "+ Ajouter une expérience",
  language: "Langue", level: "Niveau", mastery: "Maîtrise", addLanguage: "+ Ajouter une langue",
  project: "Projet", name: "Nom", description: "Description", addProject: "+ Ajouter un projet",
  group: "Groupe", skillsList: "Compétences (séparées par virgules)", addGroup: "+ Ajouter un groupe",
  sections: { summary: "Profil", experience: "Expérience", education: "Formation", skills: "Compétences", languages: "Langues", certifications: "Certifications", projects: "Projets", interests: "Centres d'intérêt" }, photo: "+ Photo",
};

const ar: UiDict = {
  signIn: "تسجيل الدخول", createAccount: "إنشاء حساب", notNow: "ليس الآن",
  gateTitle: "سجّل الدخول للمتابعة", gateMsg: "يحفظ opportunity.com السير الذاتية ويحمّلها في حساب حقيقي — بدون جلسات مجهولة — لذلك تحتاج هذه الخطوة إلى تسجيل الدخول.",
  loginTitle: "تسجيل الدخول", loginNote: "يلزم حساب حقيقي — لا يستخدم opportunity.com جلسات مجهولة.", email: "البريد الإلكتروني", password: "كلمة المرور",
  signingIn: "جارٍ تسجيل الدخول…", noAccount: "ليس لديك حساب؟", createOne: "أنشئ حساباً",
  signupTitle: "أنشئ حسابك", signupNote: "وظائف + سير ذاتية مكيّفة بالذكاء الاصطناعي، محفوظة في حسابك.", passwordMin: "كلمة المرور (6 أحرف على الأقل)",
  creatingAccount: "جارٍ إنشاء الحساب…", checkInbox: "تحقق من بريدك الإلكتروني لتأكيد {email}، ثم سجّل الدخول.", haveAccount: "لديك حساب بالفعل؟",
  payTitle: "افتح تنزيل ملف PDF", cvSavedNamed: "سيرتك الذاتية «{name}» ({template}) محفوظة وجاهزة.", cvSaved: "سيرتك الذاتية محفوظة وجاهزة.",
  payNote: "دفعة واحدة لهذا القالب دون اشتراك. ستُحوَّل إلى شريك الدفع الآمن ثم تعود مباشرة للتنزيل.",
  payBtn: "ادفع وحمّل", payBtnTitle: "دفع آمن", backToEditor: "← العودة إلى المحرر",
  payRedirecting: "جارٍ التحويل إلى الدفع الآمن…", payConfirming: "جارٍ تأكيد الدفع…", payFailed: "حدث خطأ. يرجى المحاولة مرة أخرى.", payPending: "لم نتلقَّ تأكيد الدفع بعد. حدّث الصفحة بعد لحظات.", paidTitle: "تم استلام الدفع — شكرًا!", paidNote: "تم فتح هذا القالب. حمّل سيرتك بصيغة PDF، ويمكنك تنزيلها مجددًا في أي وقت.", downloadNow: "تنزيل PDF", printTitle: "سيرتك جاهزة", printHint: "في نافذة الطباعة اختر «حفظ بصيغة PDF» وعطّل الترويسة والتذييل.", printLocked: "يرجى فتح هذا القالب أولاً.",
  needSignInBuild: "سجّل الدخول لإنشاء سيرتك الذاتية", needSignInNote: "يحفظ opportunity.com سيرك الذاتية في حساب حقيقي — بدون جلسات مجهولة.",
  myCVs: "سيرتي الذاتية", home: "→ الرئيسية", firstCV: "أنشئ أول سيرة ذاتية احترافية", nCVs: (n) => `${n} سيرة محفوظة`,
  translating: "جارٍ ترجمة السيرة…", translatedTo: "تمت ترجمة السيرة", undo: "تراجع", translateFailed: "تعذّرت ترجمة النص. تغيّرت العناوين فقط.", reportTitle: "مخصّصة لـ {job}", reportFit: "التطابق مع الوظيفة", reportChanged: "ما الذي تغيّر", reportMissing: "مطلوب في الوظيفة وغير موجود في سيرتك", reportMissingNote: "أضفها فقط إن كنت تتقنها فعلاً.", reportMatched: "مغطّى بالفعل", reportRestore: "استعادة سيرتي الأصلية", reportClose: "إغلاق", reportBasic: "تم استخدام تخصيص أساسي (الذكاء الاصطناعي غير متاح حالياً).", newCV: "+ سيرة جديدة", uploadCV: "ارفع سيرتك الذاتية", uploadingCV: "جارٍ القراءة…", uploadFailed: "تعذّرت قراءة الملف. جرّب PDF نصياً أو DOCX.", deleteCV: "حذف", clearAll: "حذف كل السير", confirmDelete: "حذف هذه السيرة؟ لا يمكن التراجع.", confirmClear: "حذف كل سيرك المحفوظة؟ لا يمكن التراجع.", deleteFailed: "تعذّر الحذف. حاول مجدداً.", noCVs: "لا توجد سير ذاتية بعد", noCVsNote: "أنشئ سيرة ذاتية احترافية في دقائق.", createFirst: "أنشئ أول سيرة ذاتية", chooseTemplate: "اختر قالباً",
  saving: "جارٍ الحفظ…", saved: "تم الحفظ", savedDevice: "محفوظ على هذا الجهاز", downloadPdf: "تحميل PDF", reach30: "اصل إلى 30% للتحميل",
  signInToDownload: "سجّل الدخول للتحميل", downloadTitle: "تحميل بصيغة PDF", complete: "مكتمل", savingShort: "جارٍ الحفظ…",
  previewTab: "👁 معاينة", formTab: "✎ النموذج", gateDownloadTitle: "سجّل الدخول للتحميل",
  gateDownloadMsg: "تبقى سيرتك الذاتية محفوظة في هذا المتصفح أثناء التعديل. يتطلب تحميلها حساباً حقيقياً — وهناك ستُتمّ الدفع أيضاً.",
  scoreTitle: "اكتمال السيرة الذاتية", scoreImprove: "للتحسين", scoreDone: "مكتمل", scoreGate: "يُفعَّل تحميل PDF عند اكتمال 30%.",
  scoreItems: {
    "contact-full": "أكمل الاسم والبريد والهاتف", title: "أضف مسمىً وظيفياً", photo: "أضف صورة شخصية",
    summary: "اكتب ملخصاً مهنياً (50 كلمة فأكثر)", "exp-exists": "أضف خبرة مهنية واحدة على الأقل", "exp-bullets": "اذكر نقطتين رئيسيتين أو أكثر لكل وظيفة",
    education: "أضف شهادة أو تعليماً", skills: "اذكر 5 مهارات على الأقل", languages: "أضف اللغات التي تتحدثها",
    linkedin: "أضف رابط LinkedIn", certifications: "أضف شهادة مهنية",
  },
  dragReorder: "اسحب لإعادة الترتيب", hideSection: "إخفاء القسم", showSection: "إظهار القسم", hide: "إخفاء", show: "إظهار",
  fit: "ملاءمة", templates: "القوالب", aiRewrite: "إعادة الصياغة بالذكاء الاصطناعي", remove: "حذف",
  firstName: "الاسم الأول", lastName: "اسم العائلة", jobTitle: "المسمى الوظيفي", phone: "الهاتف", city: "المدينة", linkedin: "LinkedIn", website: "الموقع / المعرض",
  changePhoto: "انقر لتغيير الصورة", click: "انقر",
  certification: "شهادة", certName: "الاسم", issuer: "الجهة المانحة", year: "السنة", addCert: "+ إضافة شهادة",
  newEducation: "تعليم جديد", degree: "الشهادة", school: "المؤسسة", start: "البداية", end: "النهاية", details: "تفاصيل (اختياري)", addEducation: "+ إضافة تعليم",
  newJob: "وظيفة جديدة", role: "المنصب", company: "الشركة", present: "حتى الآن", achievements: "الإنجازات", addExperience: "+ إضافة خبرة",
  language: "اللغة", level: "المستوى", mastery: "الإتقان", addLanguage: "+ إضافة لغة",
  project: "مشروع", name: "الاسم", description: "الوصف", addProject: "+ إضافة مشروع",
  group: "المجموعة", skillsList: "المهارات (مفصولة بفواصل)", addGroup: "+ إضافة مجموعة",
  sections: { summary: "الملف الشخصي", experience: "الخبرة", education: "التعليم", skills: "المهارات", languages: "اللغات", certifications: "الشهادات", projects: "المشاريع", interests: "الاهتمامات" }, photo: "+ صورة",
};

export const UI: Record<Lang, UiDict> = { en, fr, ar };
