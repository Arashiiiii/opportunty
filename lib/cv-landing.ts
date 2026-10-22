import type { Metadata } from "next";
import type { SeoLang } from "./site-i18n";
import { SITE_URL } from "./site";

export const CV_LANDING_PATH: Record<SeoLang, string> = { en: "/free-cv-builder", fr: "/fr/createur-de-cv-gratuit", ar: "/ar/free-cv-builder" };

interface Copy {
  title: string; description: string; h1: string; intro: string; cta: string; jobsCta: string;
  stepsH: string; steps: { t: string; d: string }[];
  whyH: string; why: string[];
  tplH: string; tpl: string;
  faqH: string; faq: { q: string; a: string }[];
  jobsH: string; jobsP: string;
}

export const CV_COPY: Record<SeoLang, Copy> = {
  en: {
    title: "Free CV builder with AI — 10 ATS-friendly templates | opportunty",
    description: "Build a professional CV online for free. Upload your old CV or start from scratch, edit it live, and let AI tailor it to a job offer. English, French and Arabic.",
    h1: "Free CV builder with AI",
    intro: "Build a clean, ATS-friendly CV in minutes. Upload the CV you already have or start from a blank page, edit it live in your browser, and let AI adapt it to the exact job you are applying for. You only sign in at the last step, when you download the PDF.",
    cta: "Build my CV", jobsCta: "Browse jobs first",
    stepsH: "How it works",
    steps: [
      { t: "Upload or start blank", d: "Drop in your current CV (PDF or Word) and we fill the editor for you, or begin with an empty template." },
      { t: "Edit live", d: "Change your experience, education, skills and languages and watch the preview update instantly. Switch template and accent colour any time." },
      { t: "Tailor it to a job", d: "Paste or pick a job offer and the AI rewrites your summary and bullet points around the keywords the employer asks for, without inventing experience." },
      { t: "Download the PDF", d: "Sign in with a one-time email code and download a clean PDF that recruiters and applicant tracking systems can read." },
    ],
    whyH: "Why an ATS-friendly CV matters",
    why: [
      "Many employers in Morocco, France, Germany and the Gulf filter applications with an applicant tracking system (ATS) before a person reads them. A CV with columns, icons or images in the wrong places can be read out of order or not at all.",
      "Our templates use a clear structure, real text instead of images, and standard section titles, so your name, jobs and skills are parsed correctly. Tailoring the wording to the job offer also raises the chance that the right keywords are found.",
    ],
    tplH: "10 templates, 3 languages",
    tpl: "Choose from ten layouts, from a simple single column to a modern two-column design. Write your CV in English, French or Arabic, including right-to-left layout for Arabic.",
    faqH: "Frequently asked questions",
    faq: [
      { q: "Is the CV builder really free?", a: "Editing, previewing and tailoring your CV in the browser costs nothing and needs no account. A one-time payment applies only when you download a template as PDF." },
      { q: "Do I need to create an account first?", a: "No. You can upload, edit and preview your CV before signing in. We ask you to sign in with an email code only when you download." },
      { q: "Can the AI invent experience?", a: "The AI rewrites and reorders what you already wrote so it matches the job offer. You review every change, and you should always check that the result is true before sending it." },
      { q: "Which CV format do employers expect?", a: "In France and Morocco a one-page or two-page CV is common. In Germany a clear, chronological CV is expected. In Saudi Arabia and the Gulf employers often want personal details and a photo. Our country guides explain each market." },
      { q: "Can I write my CV in Arabic?", a: "Yes. The editor supports Arabic with right-to-left layout, as well as French and English." },
    ],
    jobsH: "Find a job to apply to",
    jobsP: "Not sure where to apply? Browse open positions in Morocco, France, Germany, Belgium, the Netherlands and Saudi Arabia, then tailor your CV to the one you pick.",
  },
  fr: {
    title: "Créateur de CV gratuit avec IA — 10 modèles compatibles ATS | opportunty",
    description: "Créez un CV professionnel en ligne gratuitement. Importez votre ancien CV ou partez de zéro, modifiez-le en direct et laissez l'IA l'adapter à une offre d'emploi. Français, anglais et arabe.",
    h1: "Créateur de CV gratuit avec IA",
    intro: "Créez un CV clair et compatible ATS en quelques minutes. Importez le CV que vous avez déjà ou partez d'une page blanche, modifiez-le en direct dans votre navigateur et laissez l'IA l'adapter à l'offre visée. Vous ne vous connectez qu'à la dernière étape, au moment de télécharger le PDF.",
    cta: "Créer mon CV", jobsCta: "Voir les offres d'abord",
    stepsH: "Comment ça marche",
    steps: [
      { t: "Importez ou partez de zéro", d: "Déposez votre CV actuel (PDF ou Word) et l'éditeur se remplit automatiquement, ou commencez avec un modèle vide." },
      { t: "Modifiez en direct", d: "Changez votre expérience, vos études, vos compétences et vos langues et voyez l'aperçu se mettre à jour. Changez de modèle et de couleur à tout moment." },
      { t: "Adaptez-le à une offre", d: "Collez ou choisissez une offre : l'IA reformule votre résumé et vos missions autour des mots-clés demandés, sans inventer d'expérience." },
      { t: "Téléchargez le PDF", d: "Connectez-vous avec un code reçu par e-mail et téléchargez un PDF propre, lisible par les recruteurs et les logiciels de tri de candidatures." },
    ],
    whyH: "Pourquoi un CV compatible ATS",
    why: [
      "De nombreux employeurs au Maroc, en France, en Allemagne et dans le Golfe filtrent les candidatures avec un logiciel de suivi des candidats (ATS) avant qu'une personne ne les lise. Un CV avec des colonnes, des icônes ou des images mal placées peut être lu dans le désordre, voire pas du tout.",
      "Nos modèles utilisent une structure claire, du vrai texte plutôt que des images et des titres de rubriques standards : votre nom, vos postes et vos compétences sont donc bien reconnus. Adapter les mots à l'offre augmente aussi les chances que les bons mots-clés soient trouvés.",
    ],
    tplH: "10 modèles, 3 langues",
    tpl: "Choisissez parmi dix mises en page, d'une simple colonne à un design moderne en deux colonnes. Rédigez votre CV en français, en anglais ou en arabe, avec une mise en page de droite à gauche pour l'arabe.",
    faqH: "Questions fréquentes",
    faq: [
      { q: "Le créateur de CV est-il vraiment gratuit ?", a: "Modifier, prévisualiser et adapter votre CV dans le navigateur est gratuit et ne demande pas de compte. Un paiement unique s'applique seulement quand vous téléchargez un modèle en PDF." },
      { q: "Faut-il créer un compte d'abord ?", a: "Non. Vous pouvez importer, modifier et prévisualiser votre CV avant de vous connecter. La connexion par code e-mail n'est demandée qu'au téléchargement." },
      { q: "L'IA peut-elle inventer des expériences ?", a: "L'IA reformule et réordonne ce que vous avez écrit pour l'aligner sur l'offre. Vous relisez chaque modification et vous devez toujours vérifier que le résultat est exact avant l'envoi." },
      { q: "Quel format de CV attendent les employeurs ?", a: "En France et au Maroc, un CV d'une à deux pages est courant. En Allemagne, un CV chronologique et clair est attendu. En Arabie saoudite et dans le Golfe, les employeurs demandent souvent des informations personnelles et une photo. Nos guides par pays détaillent chaque marché." },
      { q: "Puis-je rédiger mon CV en arabe ?", a: "Oui. L'éditeur gère l'arabe avec une mise en page de droite à gauche, ainsi que le français et l'anglais." },
    ],
    jobsH: "Trouvez une offre pour postuler",
    jobsP: "Vous ne savez pas où postuler ? Parcourez les offres au Maroc, en France, en Allemagne, en Belgique, aux Pays-Bas et en Arabie saoudite, puis adaptez votre CV à celle que vous choisissez.",
  },
  ar: {
    title: "منشئ سيرة ذاتية مجاني بالذكاء الاصطناعي — 10 قوالب متوافقة مع ATS | opportunty",
    description: "أنشئ سيرة ذاتية احترافية مجانًا عبر الإنترنت. ارفع سيرتك القديمة أو ابدأ من الصفر، عدّلها مباشرة ودع الذكاء الاصطناعي يكيّفها مع عرض العمل. بالعربية والفرنسية والإنجليزية.",
    h1: "منشئ سيرة ذاتية مجاني بالذكاء الاصطناعي",
    intro: "أنشئ سيرة ذاتية واضحة ومتوافقة مع أنظمة ATS في دقائق. ارفع سيرتك الحالية أو ابدأ بصفحة فارغة، عدّلها مباشرة في المتصفح ودع الذكاء الاصطناعي يكيّفها مع الوظيفة التي تتقدم إليها. لا تسجّل الدخول إلا في الخطوة الأخيرة عند تنزيل ملف PDF.",
    cta: "أنشئ سيرتي الذاتية", jobsCta: "تصفّح الوظائف أولًا",
    stepsH: "كيف يعمل",
    steps: [
      { t: "ارفع سيرتك أو ابدأ من الصفر", d: "ارفع سيرتك الحالية (PDF أو Word) فيملأ المحرر بياناتك تلقائيًا، أو ابدأ بقالب فارغ." },
      { t: "عدّل مباشرة", d: "غيّر خبراتك ودراستك ومهاراتك ولغاتك وشاهد المعاينة تتحدث فورًا. يمكنك تغيير القالب واللون في أي وقت." },
      { t: "كيّفها مع الوظيفة", d: "الصق عرض العمل أو اخترْه فيعيد الذكاء الاصطناعي صياغة ملخصك ومهامك حول الكلمات المفتاحية التي يطلبها صاحب العمل، دون اختلاق خبرات." },
      { t: "نزّل ملف PDF", d: "سجّل الدخول برمز يصلك بالبريد الإلكتروني ونزّل ملف PDF نظيفًا يقرؤه المسؤولون عن التوظيف وأنظمة فرز الطلبات." },
    ],
    whyH: "لماذا سيرة متوافقة مع ATS",
    why: [
      "تعتمد كثير من الشركات في المغرب وفرنسا وألمانيا ودول الخليج على نظام تتبع المتقدمين (ATS) لتصفية الطلبات قبل أن يقرأها شخص. قد تُقرأ السيرة التي تحتوي على أعمدة أو أيقونات أو صور في أماكن غير مناسبة بترتيب خاطئ أو لا تُقرأ إطلاقًا.",
      "تستخدم قوالبنا بنية واضحة ونصًا حقيقيًا بدل الصور وعناوين أقسام معتادة، فيُقرأ اسمك ووظائفك ومهاراتك بشكل صحيح. كما أن تكييف الصياغة مع عرض العمل يزيد فرصة العثور على الكلمات المفتاحية المطلوبة.",
    ],
    tplH: "10 قوالب و3 لغات",
    tpl: "اختر من عشرة تصاميم، من عمود واحد بسيط إلى تصميم عصري بعمودين. اكتب سيرتك بالعربية أو الفرنسية أو الإنجليزية مع دعم الاتجاه من اليمين إلى اليسار للعربية.",
    faqH: "أسئلة شائعة",
    faq: [
      { q: "هل المنشئ مجاني فعلًا؟", a: "التعديل والمعاينة والتكييف داخل المتصفح مجاني ولا يتطلب حسابًا. يُطلب دفع لمرة واحدة فقط عند تنزيل قالب بصيغة PDF." },
      { q: "هل يجب إنشاء حساب أولًا؟", a: "لا. يمكنك رفع سيرتك وتعديلها ومعاينتها قبل تسجيل الدخول. نطلب الدخول برمز البريد الإلكتروني عند التنزيل فقط." },
      { q: "هل يمكن للذكاء الاصطناعي أن يختلق خبرات؟", a: "يعيد الذكاء الاصطناعي صياغة وترتيب ما كتبته أنت ليتوافق مع العرض. تراجع كل تغيير، وعليك دائمًا التأكد من صحة النتيجة قبل الإرسال." },
      { q: "ما شكل السيرة الذي يتوقعه أصحاب العمل؟", a: "في فرنسا والمغرب تُعدّ السيرة من صفحة إلى صفحتين شائعة. في ألمانيا يُتوقع ترتيب زمني واضح. في السعودية والخليج يطلب أصحاب العمل غالبًا بيانات شخصية وصورة. توضح أدلة الدول لدينا كل سوق." },
      { q: "هل يمكنني كتابة سيرتي بالعربية؟", a: "نعم. يدعم المحرر العربية بالاتجاه من اليمين إلى اليسار، إضافة إلى الفرنسية والإنجليزية." },
    ],
    jobsH: "ابحث عن وظيفة للتقديم",
    jobsP: "لا تعرف أين تتقدم؟ تصفّح الوظائف المتاحة في المغرب وفرنسا وألمانيا وبلجيكا وهولندا والسعودية ثم كيّف سيرتك مع الوظيفة التي تختارها.",
  },
};

export function cvLandingMetadata(l: SeoLang): Metadata {
  const c = CV_COPY[l];
  const languages = Object.fromEntries(Object.entries(CV_LANDING_PATH).map(([k, p]) => [k, `${SITE_URL}${p}`])) as Record<string, string>;
  languages["x-default"] = `${SITE_URL}${CV_LANDING_PATH.en}`;
  return {
    title: c.title, description: c.description,
    alternates: { canonical: CV_LANDING_PATH[l], languages },
    openGraph: { type: "website", url: CV_LANDING_PATH[l], title: c.title, description: c.description, siteName: "opportunty.com" },
  };
}
