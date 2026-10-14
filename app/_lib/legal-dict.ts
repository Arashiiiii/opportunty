import type { Lang } from "../i18n";
import { COMPANY as C } from "./company";

export type Section = { h: string; p: string[] };
export type LegalDoc = { title: string; intro: string; sections: Section[] };
export type LegalSlug = "privacy" | "terms" | "cookies" | "legal" | "about";

export const FOOTER: Record<Lang, {
  tagline: string; product: string; company: string; legal: string;
  jobs: string; cvBuilder: string; employers: string; about: string; contact: string;
  terms: string; privacy: string; cookies: string; notice: string; rights: string; made: string;
}> = {
  en: { tagline: "Find work you actually want — and a CV tailored to it.", product: "Product", company: "Company", legal: "Legal",
    jobs: "Job search", cvBuilder: "CV builder", employers: "For employers", about: "About", contact: "Contact",
    terms: "Terms of use", privacy: "Privacy policy", cookies: "Cookies", notice: "Legal notice", rights: "All rights reserved.", made: "Made in Morocco" },
  fr: { tagline: "Trouvez le travail que vous voulez — et un CV adapté.", product: "Produit", company: "Société", legal: "Légal",
    jobs: "Offres d'emploi", cvBuilder: "Créateur de CV", employers: "Employeurs", about: "À propos", contact: "Contact",
    terms: "CGU", privacy: "Politique de confidentialité", cookies: "Cookies", notice: "Mentions légales", rights: "Tous droits réservés.", made: "Fait au Maroc" },
  ar: { tagline: "اعثر على العمل الذي تريده — وسيرة ذاتية مناسبة له.", product: "المنتج", company: "الشركة", legal: "قانوني",
    jobs: "البحث عن عمل", cvBuilder: "منشئ السيرة الذاتية", employers: "للمشغّلين", about: "من نحن", contact: "اتصل بنا",
    terms: "شروط الاستخدام", privacy: "سياسة الخصوصية", cookies: "ملفات تعريف الارتباط", notice: "الإشعار القانوني", rights: "جميع الحقوق محفوظة.", made: "صُنع في المغرب" },
};

export const LAST_UPDATED = "2026-10-14";
export const UPDATED_LABEL: Record<Lang, string> = { en: "Last updated", fr: "Dernière mise à jour", ar: "آخر تحديث" };

const email = C.contactEmail, pEmail = C.privacyEmail;

export const LEGAL: Record<LegalSlug, Record<Lang, LegalDoc>> = {
  privacy: {
    en: { title: "Privacy policy", intro: `This policy explains what personal data ${C.brand} collects, why, and the choices you have.`, sections: [
      { h: "1. Who we are", p: [`${C.brand} is a job search and AI CV-building service operated by ${C.publisher}. For any privacy question write to ${pEmail}.`] },
      { h: "2. Data we collect", p: [
        "Account data: email address and password (stored hashed by our authentication provider), and for employers the company name.",
        "CV content: the information you type or upload (name, contact details, experience, education, skills). While you are signed out, your CV stays in your browser only.",
        "Usage data: technical logs (IP address, browser, pages requested) needed to run and secure the service, and your interface language and country choice, kept in your browser.",
        "Job listings: job offers shown on the site are gathered from public sources; they are not personal data about you." ] },
      { h: "3. Why we use it", p: ["To provide the service: show jobs, build and save your CV, tailor it to a job, translate it, and let you download it.", "To secure the service, prevent abuse and apply usage limits.", "To handle payments and support requests when these features are enabled.", "We do not sell your data and we do not use your CV for advertising."] },
      { h: "4. AI processing", p: ["When you ask us to read, tailor or translate a CV, its text and the job description are sent to our AI provider (Anthropic) solely to produce the result. We do not use your CV to train models."] },
      { h: "5. Service providers", p: ["We rely on: Supabase (database and authentication), Vercel (hosting), Anthropic (AI processing) and, when enabled, Dodo Payments (payments). They process data on our behalf under their own security commitments. Some are located outside Morocco and the EU; data may therefore be transferred internationally."] },
      { h: "6. Retention", p: ["Account and CV data are kept while your account is active. You can delete any CV at any time from “My CVs”, and ask us to delete your account and all associated data. Technical logs are kept for a limited period."] },
      { h: "7. Your rights", p: [`Under Moroccan Law 09-08 and, where applicable, the GDPR, you may access, correct, delete or export your data, object to or restrict its processing, and lodge a complaint with the CNDP (Morocco) or your local data-protection authority. Contact ${pEmail}; we answer within 30 days.`] },
      { h: "8. Security", p: ["Data is encrypted in transit, access to CVs is restricted to their owner, and we apply the principle of least privilege. No system is perfectly secure, so please use a strong, unique password."] },
      { h: "9. Children", p: ["The service is not intended for people under 16, and we do not knowingly collect their data."] },
      { h: "10. Changes", p: ["We may update this policy; the date above shows the latest version. Material changes will be announced on the site."] } ] },
    fr: { title: "Politique de confidentialité", intro: `Cette politique explique quelles données personnelles ${C.brand} collecte, pourquoi, et les choix dont vous disposez.`, sections: [
      { h: "1. Qui sommes-nous", p: [`${C.brand} est un service de recherche d'emploi et de création de CV par IA, exploité par ${C.publisher}. Pour toute question : ${pEmail}.`] },
      { h: "2. Données collectées", p: [
        "Données de compte : adresse e-mail et mot de passe (stocké sous forme hachée par notre prestataire d'authentification) et, pour les employeurs, le nom de l'entreprise.",
        "Contenu du CV : les informations que vous saisissez ou importez (nom, coordonnées, expérience, formation, compétences). Tant que vous n'êtes pas connecté, votre CV reste uniquement dans votre navigateur.",
        "Données d'usage : journaux techniques (adresse IP, navigateur, pages demandées) nécessaires au fonctionnement et à la sécurité, et vos choix de langue et de pays, conservés dans votre navigateur.",
        "Offres d'emploi : les offres affichées proviennent de sources publiques ; ce ne sont pas des données personnelles vous concernant." ] },
      { h: "3. Finalités", p: ["Fournir le service : afficher les offres, créer et enregistrer votre CV, l'adapter à une offre, le traduire et le télécharger.", "Sécuriser le service, prévenir les abus et appliquer des limites d'usage.", "Gérer les paiements et le support lorsque ces fonctions sont activées.", "Nous ne vendons pas vos données et n'utilisons pas votre CV à des fins publicitaires."] },
      { h: "4. Traitement par IA", p: ["Lorsque vous demandez la lecture, l'adaptation ou la traduction d'un CV, son texte et la description de l'offre sont envoyés à notre fournisseur d'IA (Anthropic) uniquement pour produire le résultat. Votre CV n'est pas utilisé pour entraîner des modèles."] },
      { h: "5. Prestataires", p: ["Nous utilisons : Supabase (base de données et authentification), Vercel (hébergement), Anthropic (IA) et, lorsque activé, Dodo Payments (paiements). Ils traitent les données pour notre compte. Certains sont situés hors du Maroc et de l'UE : des transferts internationaux peuvent avoir lieu."] },
      { h: "6. Conservation", p: ["Les données de compte et de CV sont conservées tant que votre compte est actif. Vous pouvez supprimer un CV à tout moment depuis « Mes CV » et demander la suppression de votre compte et de toutes les données associées. Les journaux techniques sont conservés pour une durée limitée."] },
      { h: "7. Vos droits", p: [`Conformément à la loi marocaine 09-08 et, le cas échéant, au RGPD, vous pouvez accéder à vos données, les rectifier, les supprimer, les exporter, vous opposer à leur traitement ou le limiter, et saisir la CNDP (Maroc) ou votre autorité locale. Contact : ${pEmail} ; réponse sous 30 jours.`] },
      { h: "8. Sécurité", p: ["Les données sont chiffrées en transit, l'accès aux CV est limité à leur propriétaire et nous appliquons le principe du moindre privilège. Aucun système n'est infaillible : choisissez un mot de passe fort et unique."] },
      { h: "9. Mineurs", p: ["Le service n'est pas destiné aux moins de 16 ans et nous ne collectons pas sciemment leurs données."] },
      { h: "10. Modifications", p: ["Nous pouvons mettre à jour cette politique ; la date ci-dessus indique la dernière version. Tout changement important sera signalé sur le site."] } ] },
    ar: { title: "سياسة الخصوصية", intro: `توضّح هذه السياسة البيانات الشخصية التي يجمعها ${C.brand} ولماذا، والخيارات المتاحة لك.`, sections: [
      { h: "1. من نحن", p: [`${C.brand} خدمة للبحث عن عمل وإنشاء السير الذاتية بالذكاء الاصطناعي يديرها ${C.publisher}. لأي سؤال: ${pEmail}.`] },
      { h: "2. البيانات التي نجمعها", p: [
        "بيانات الحساب: البريد الإلكتروني وكلمة المرور (تُخزَّن مُشفّرة لدى مزود المصادقة)، واسم الشركة للمشغّلين.",
        "محتوى السيرة الذاتية: المعلومات التي تكتبها أو ترفعها (الاسم، بيانات الاتصال، الخبرة، التعليم، المهارات). وما دمت غير مسجّل الدخول تبقى سيرتك في متصفحك فقط.",
        "بيانات الاستخدام: سجلات تقنية (عنوان IP، المتصفح، الصفحات المطلوبة) لازمة لتشغيل الخدمة وحمايتها، واختيارك للغة والبلد المحفوظ في متصفحك.",
        "عروض العمل: العروض المعروضة مجمّعة من مصادر عامة وليست بيانات شخصية عنك." ] },
      { h: "3. لماذا نستخدمها", p: ["لتقديم الخدمة: عرض الوظائف، وإنشاء السيرة وحفظها وملاءمتها مع وظيفة وترجمتها وتنزيلها.", "لحماية الخدمة ومنع إساءة الاستخدام وتطبيق حدود الاستعمال.", "لمعالجة المدفوعات وطلبات الدعم عند تفعيلها.", "لا نبيع بياناتك ولا نستخدم سيرتك للإعلانات."] },
      { h: "4. المعالجة بالذكاء الاصطناعي", p: ["عند طلب قراءة السيرة أو ملاءمتها أو ترجمتها يُرسَل نصها ووصف الوظيفة إلى مزود الذكاء الاصطناعي (Anthropic) لإنتاج النتيجة فقط. ولا تُستخدم سيرتك لتدريب النماذج."] },
      { h: "5. مزوّدو الخدمات", p: ["نعتمد على: Supabase (قاعدة البيانات والمصادقة)، وVercel (الاستضافة)، وAnthropic (الذكاء الاصطناعي)، وعند التفعيل Dodo Payments (الدفع). يعالجون البيانات نيابةً عنا، وبعضهم خارج المغرب والاتحاد الأوروبي، لذا قد تُنقل البيانات دوليًا."] },
      { h: "6. مدة الاحتفاظ", p: ["نحتفظ ببيانات الحساب والسير ما دام حسابك نشطًا. يمكنك حذف أي سيرة في أي وقت من «سيري الذاتية» وطلب حذف حسابك وكل بياناته. تُحفظ السجلات التقنية لمدة محدودة."] },
      { h: "7. حقوقك", p: [`وفق القانون المغربي 09-08 وعند الاقتضاء اللائحة الأوروبية (GDPR) يحق لك الولوج إلى بياناتك وتصحيحها وحذفها وتصديرها والاعتراض على معالجتها أو تقييدها، وتقديم شكوى إلى اللجنة الوطنية CNDP أو سلطة بلدك. راسلنا على ${pEmail} وسنردّ خلال 30 يومًا.`] },
      { h: "8. الأمان", p: ["تُشفَّر البيانات أثناء النقل، والوصول إلى السير مقتصر على صاحبها، ونطبّق مبدأ أقل الصلاحيات. لا يوجد نظام آمن تمامًا، لذا استخدم كلمة مرور قوية وفريدة."] },
      { h: "9. الأطفال", p: ["الخدمة غير موجّهة لمن هم دون 16 سنة ولا نجمع بياناتهم عن علم."] },
      { h: "10. التعديلات", p: ["قد نحدّث هذه السياسة، ويبيّن التاريخ أعلاه آخر نسخة. سنعلن عن التغييرات المهمة في الموقع."] } ] },
  },

  terms: {
    en: { title: "Terms of use (CGU)", intro: `These terms govern your use of ${C.brand}. By using the site you accept them.`, sections: [
      { h: "1. The service", p: [`${C.brand} lets you browse job offers, build CVs, and use AI to tailor, translate and download them. Employers can create an account to view the market and, when available, publish offers.`] },
      { h: "2. Accounts", p: ["You must provide accurate information and keep your password confidential. You are responsible for activity under your account. Job seekers and employers use separate accounts; an email address cannot hold both roles. You may close your account at any time."] },
      { h: "3. Job offers", p: ["Offers are collected from third-party sources. We do not employ, recruit or vouch for any advertiser, do not guarantee that an offer is accurate, available or lawful, and are not a party to any hiring. Always verify an employer before sharing sensitive information, and never pay to apply for a job."] },
      { h: "4. Your content and AI output", p: ["You keep ownership of your CV. You grant us a limited licence to process it to provide the service. AI-generated suggestions may contain errors: you are responsible for checking every statement of your CV before sending it, and for ensuring it is truthful."] },
      { h: "5. Acceptable use", p: ["You agree not to: upload unlawful or third-party personal content you have no right to share; scrape or overload the service; attempt to breach its security; post misleading job offers; or use the service for spam or fraud. We may apply usage limits and suspend accounts that breach these terms."] },
      { h: "6. Prices and payment", p: ["Editing a CV is free; downloading and some features may require payment, displayed before you confirm. Payments are processed by a third-party provider. Unless the law provides otherwise, digital content delivered on your request is not refundable once delivered."] },
      { h: "7. Intellectual property", p: ["The site, brand, templates and software belong to us or our licensors. Nothing in these terms transfers those rights to you beyond a personal, non-exclusive right to use the service."] },
      { h: "8. Liability", p: ["The service is provided “as is”. To the extent permitted by law, we are not liable for indirect losses, loss of opportunity, or the outcome of any application. Nothing excludes liability that cannot be excluded by law."] },
      { h: "9. Changes and termination", p: ["We may change the service or these terms; continued use after an update means acceptance. We may suspend access for breach of these terms."] },
      { h: "10. Governing law", p: [`These terms are governed by the laws of ${C.jurisdiction.en}. Courts of ${C.jurisdiction.en} have jurisdiction, without prejudice to mandatory consumer protections in your country of residence.`] },
      { h: "11. Contact", p: [`Questions: ${email}.`] } ] },
    fr: { title: "Conditions générales d'utilisation (CGU)", intro: `Les présentes CGU régissent votre utilisation de ${C.brand}. En utilisant le site, vous les acceptez.`, sections: [
      { h: "1. Le service", p: [`${C.brand} permet de consulter des offres d'emploi, de créer des CV et d'utiliser l'IA pour les adapter, les traduire et les télécharger. Les employeurs peuvent créer un compte pour consulter le marché et, lorsque disponible, publier des offres.`] },
      { h: "2. Comptes", p: ["Vous devez fournir des informations exactes et garder votre mot de passe confidentiel. Vous êtes responsable de l'activité de votre compte. Candidats et employeurs utilisent des comptes distincts ; une adresse e-mail ne peut pas cumuler les deux rôles. Vous pouvez fermer votre compte à tout moment."] },
      { h: "3. Offres d'emploi", p: ["Les offres proviennent de sources tierces. Nous n'employons ni ne recrutons pour aucun annonceur, ne garantissons pas l'exactitude, la disponibilité ou la légalité d'une offre et ne sommes pas partie à un recrutement. Vérifiez toujours l'employeur avant de communiquer des informations sensibles et ne payez jamais pour postuler."] },
      { h: "4. Votre contenu et les résultats de l'IA", p: ["Vous restez propriétaire de votre CV et nous accordez une licence limitée pour le traiter afin de fournir le service. Les suggestions de l'IA peuvent comporter des erreurs : il vous appartient de vérifier chaque information avant envoi et de vous assurer qu'elle est exacte."] },
      { h: "5. Utilisation acceptable", p: ["Vous vous engagez à ne pas : téléverser de contenu illicite ou des données personnelles de tiers sans droit ; extraire massivement ou surcharger le service ; tenter d'en contourner la sécurité ; publier des offres trompeuses ; l'utiliser pour du spam ou de la fraude. Nous pouvons appliquer des limites et suspendre les comptes contrevenants."] },
      { h: "6. Prix et paiement", p: ["La modification d'un CV est gratuite ; le téléchargement et certaines fonctions peuvent être payants, le prix étant affiché avant confirmation. Les paiements sont traités par un prestataire tiers. Sauf disposition légale contraire, un contenu numérique fourni à votre demande n'est pas remboursable une fois livré."] },
      { h: "7. Propriété intellectuelle", p: ["Le site, la marque, les modèles et le logiciel nous appartiennent ou appartiennent à nos concédants. Les CGU ne vous transfèrent qu'un droit personnel et non exclusif d'utiliser le service."] },
      { h: "8. Responsabilité", p: ["Le service est fourni « en l'état ». Dans la mesure permise par la loi, nous ne répondons pas des préjudices indirects, des pertes d'opportunité ni du résultat d'une candidature. Rien n'exclut une responsabilité qui ne peut l'être légalement."] },
      { h: "9. Modification et résiliation", p: ["Nous pouvons modifier le service ou les CGU ; la poursuite de l'utilisation vaut acceptation. Nous pouvons suspendre l'accès en cas de manquement."] },
      { h: "10. Droit applicable", p: [`Les CGU sont régies par le droit de ${C.jurisdiction.fr}. Les tribunaux de ${C.jurisdiction.fr} sont compétents, sans préjudice des protections impératives du consommateur de votre pays de résidence.`] },
      { h: "11. Contact", p: [`Questions : ${email}.`] } ] },
    ar: { title: "شروط الاستخدام", intro: `تحكم هذه الشروط استخدامك لـ ${C.brand}. باستخدامك للموقع فإنك توافق عليها.`, sections: [
      { h: "1. الخدمة", p: [`يتيح ${C.brand} تصفح عروض العمل وإنشاء السير الذاتية واستعمال الذكاء الاصطناعي لملاءمتها وترجمتها وتنزيلها. ويمكن للمشغّلين إنشاء حساب لمتابعة السوق ونشر العروض عند توفر ذلك.`] },
      { h: "2. الحسابات", p: ["عليك تقديم معلومات صحيحة والحفاظ على سرية كلمة المرور، وأنت مسؤول عن النشاط في حسابك. للباحثين عن عمل والمشغّلين حسابات منفصلة، ولا يمكن لبريد إلكتروني واحد أن يجمع الصفتين. يمكنك إغلاق حسابك في أي وقت."] },
      { h: "3. عروض العمل", p: ["تُجمع العروض من مصادر خارجية. لا نوظّف ولا نضمن أي معلن، ولا نضمن صحة العرض أو توفره أو قانونيته، ولسنا طرفًا في أي توظيف. تحقق من المشغّل قبل مشاركة معلومات حساسة ولا تدفع أبدًا مقابل التقديم لوظيفة."] },
      { h: "4. محتواك ومخرجات الذكاء الاصطناعي", p: ["تظل سيرتك ملكًا لك، وتمنحنا ترخيصًا محدودًا لمعالجتها لتقديم الخدمة. قد تحتوي اقتراحات الذكاء الاصطناعي على أخطاء، وأنت مسؤول عن مراجعة كل ما في سيرتك قبل إرسالها وعن صحته."] },
      { h: "5. الاستخدام المقبول", p: ["تلتزم بعدم: رفع محتوى غير قانوني أو بيانات أشخاص آخرين دون حق؛ استخراج البيانات بكثافة أو إرهاق الخدمة؛ محاولة اختراق أمنها؛ نشر عروض مضللة؛ أو استخدامها للبريد المزعج أو الاحتيال. يجوز لنا تطبيق حدود الاستخدام وتعليق الحسابات المخالفة."] },
      { h: "6. الأسعار والدفع", p: ["تعديل السيرة مجاني، وقد يكون التنزيل وبعض الميزات مدفوعة مع عرض السعر قبل التأكيد. تتم معالجة المدفوعات عبر مزود خارجي. ما لم ينص القانون على خلاف ذلك، لا يُسترد المحتوى الرقمي المسلَّم بناءً على طلبك."] },
      { h: "7. الملكية الفكرية", p: ["الموقع والعلامة والقوالب والبرمجيات ملك لنا أو لمرخّصينا، ولا تمنحك هذه الشروط سوى حق شخصي وغير حصري لاستخدام الخدمة."] },
      { h: "8. المسؤولية", p: ["تُقدَّم الخدمة «كما هي». وبالقدر الذي يسمح به القانون لا نتحمل الخسائر غير المباشرة أو ضياع الفرص أو نتيجة أي طلب توظيف."] },
      { h: "9. التعديل والإنهاء", p: ["يجوز لنا تعديل الخدمة أو الشروط، ويعني استمرارك في الاستخدام قبولها. ويجوز تعليق الوصول عند المخالفة."] },
      { h: "10. القانون الواجب التطبيق", p: [`تخضع هذه الشروط لقوانين ${C.jurisdiction.ar}، وتختص محاكمه بالنظر في النزاعات، دون المساس بحماية المستهلك الإلزامية في بلد إقامتك.`] },
      { h: "11. التواصل", p: [`للاستفسار: ${email}.`] } ] },
  },

  cookies: {
    en: { title: "Cookies & local storage", intro: "We use only what is needed to make the site work. We do not use advertising or cross-site tracking cookies.", sections: [
      { h: "Strictly necessary", p: ["Authentication cookies set by Supabase keep you signed in and secure your session.", "Browser storage (localStorage) remembers your interface language and country, your in-progress CV draft, and the latest AI tailoring report. These stay on your device."] },
      { h: "Analytics and advertising", p: ["We currently use none. If we add privacy-friendly analytics, we will list them here and ask for consent where the law requires it."] },
      { h: "Your choices", p: ["You can clear cookies and site data in your browser at any time; you will be signed out and local drafts will be lost. Blocking strictly necessary storage may prevent sign-in and the CV builder from working."] },
      { h: "Contact", p: [`Questions: ${pEmail}.`] } ] },
    fr: { title: "Cookies et stockage local", intro: "Nous n'utilisons que ce qui est nécessaire au fonctionnement du site. Aucun cookie publicitaire ni de suivi inter-sites.", sections: [
      { h: "Strictement nécessaires", p: ["Les cookies d'authentification posés par Supabase maintiennent votre connexion et sécurisent votre session.", "Le stockage du navigateur (localStorage) mémorise la langue et le pays, le brouillon de CV en cours et le dernier rapport d'adaptation IA. Ces données restent sur votre appareil."] },
      { h: "Mesure d'audience et publicité", p: ["Nous n'en utilisons actuellement aucune. Si nous ajoutons une mesure d'audience respectueuse de la vie privée, elle sera listée ici et soumise à consentement lorsque la loi l'exige."] },
      { h: "Vos choix", p: ["Vous pouvez effacer cookies et données du site dans votre navigateur ; vous serez déconnecté et les brouillons locaux seront perdus. Bloquer le stockage nécessaire peut empêcher la connexion et le créateur de CV de fonctionner."] },
      { h: "Contact", p: [`Questions : ${pEmail}.`] } ] },
    ar: { title: "ملفات تعريف الارتباط والتخزين المحلي", intro: "نستخدم فقط ما يلزم لتشغيل الموقع، ولا نستخدم ملفات إعلانية أو تتبعًا عبر المواقع.", sections: [
      { h: "الضرورية فقط", p: ["ملفات المصادقة من Supabase تُبقيك مسجّل الدخول وتحمي جلستك.", "يحفظ تخزين المتصفح (localStorage) لغة الواجهة والبلد ومسودة سيرتك الجارية وآخر تقرير ملاءمة بالذكاء الاصطناعي، وتبقى على جهازك."] },
      { h: "التحليلات والإعلانات", p: ["لا نستخدم أيًّا منها حاليًا. إن أضفنا تحليلات تحترم الخصوصية فسنذكرها هنا ونطلب الموافقة عند الاقتضاء."] },
      { h: "خياراتك", p: ["يمكنك مسح ملفات تعريف الارتباط وبيانات الموقع من متصفحك في أي وقت؛ سيتم تسجيل خروجك وتُفقد المسودات المحلية. وقد يمنع حجب التخزين الضروري تسجيل الدخول وعمل منشئ السيرة."] },
      { h: "التواصل", p: [`للاستفسار: ${pEmail}.`] } ] },
  },

  legal: {
    en: { title: "Legal notice", intro: "Information about the publisher and host of this website.", sections: [
      { h: "Publisher", p: [[`${C.brand} (${C.domain})`, `Publisher: ${C.publisher}`, C.legalForm && `Legal form: ${C.legalForm}`, C.registration && `Registration: ${C.registration}`, C.address && `Address: ${C.address}`, C.phone && `Phone: ${C.phone}`, `Email: ${email}`].filter(Boolean).join("\n")] },
      { h: "Hosting", p: [C.host] },
      { h: "Content", p: ["Job offers are collected from third-party public sources and remain the property of their publishers. To report an inaccurate or unlawful offer, or request removal of content, write to " + email + "."] },
      { h: "Intellectual property", p: ["The brand, design, templates and code are protected. Any reproduction without authorisation is prohibited."] } ] },
    fr: { title: "Mentions légales", intro: "Informations sur l'éditeur et l'hébergeur de ce site.", sections: [
      { h: "Éditeur", p: [[`${C.brand} (${C.domain})`, `Éditeur : ${C.publisher}`, C.legalForm && `Forme juridique : ${C.legalForm}`, C.registration && `Immatriculation : ${C.registration}`, C.address && `Adresse : ${C.address}`, C.phone && `Téléphone : ${C.phone}`, `E-mail : ${email}`].filter(Boolean).join("\n")] },
      { h: "Hébergement", p: [C.host] },
      { h: "Contenu", p: ["Les offres d'emploi proviennent de sources publiques tierces et restent la propriété de leurs éditeurs. Pour signaler une offre inexacte ou illicite ou demander le retrait d'un contenu : " + email + "."] },
      { h: "Propriété intellectuelle", p: ["La marque, le design, les modèles et le code sont protégés. Toute reproduction sans autorisation est interdite."] } ] },
    ar: { title: "الإشعار القانوني", intro: "معلومات عن ناشر هذا الموقع ومستضيفه.", sections: [
      { h: "الناشر", p: [[`${C.brand} (${C.domain})`, `الناشر: ${C.publisher}`, C.legalForm && `الشكل القانوني: ${C.legalForm}`, C.registration && `التسجيل: ${C.registration}`, C.address && `العنوان: ${C.address}`, C.phone && `الهاتف: ${C.phone}`, `البريد: ${email}`].filter(Boolean).join("\n")] },
      { h: "الاستضافة", p: [C.host] },
      { h: "المحتوى", p: ["عروض العمل مجمّعة من مصادر عامة خارجية وتبقى ملكًا لناشريها. للإبلاغ عن عرض غير دقيق أو غير قانوني أو لطلب إزالة محتوى: " + email + "."] },
      { h: "الملكية الفكرية", p: ["العلامة والتصميم والقوالب والكود محمية، ويمنع أي نسخ دون إذن."] } ] },
  },

  about: {
    en: { title: "About", intro: `${C.brand} helps people find work and apply with a CV that fits the job.`, sections: [
      { h: "What we do", p: ["We gather job offers from Morocco, Europe and Saudi Arabia in one feed. Drag a job onto your CV and AI rewrites it to match — keeping your facts, changing the emphasis — so you can edit, translate and download it in minutes."] },
      { h: "Why", p: ["Most applications fail at the first filter. A CV adapted to each offer, in the right language, is the cheapest way to improve your odds — and it should not require an account just to try."] },
      { h: "For employers", p: ["Employers get their own space to follow the hiring market by country, with tools to publish offers and track applicants on the way."] },
      { h: "Get in touch", p: [`Feedback and partnerships: ${email}.`] } ] },
    fr: { title: "À propos", intro: `${C.brand} aide à trouver un emploi et à postuler avec un CV adapté à l'offre.`, sections: [
      { h: "Ce que nous faisons", p: ["Nous réunissons dans un seul fil les offres du Maroc, d'Europe et d'Arabie saoudite. Glissez une offre sur votre CV et l'IA le réécrit pour y correspondre — vos faits restent, l'accent change — puis modifiez, traduisez et téléchargez en quelques minutes."] },
      { h: "Pourquoi", p: ["La plupart des candidatures échouent au premier filtre. Un CV adapté à chaque offre, dans la bonne langue, est le moyen le plus simple d'augmenter ses chances — sans compte obligatoire pour essayer."] },
      { h: "Pour les employeurs", p: ["Les employeurs disposent d'un espace dédié pour suivre le marché par pays, avec bientôt la publication d'offres et le suivi des candidats."] },
      { h: "Nous écrire", p: [`Retours et partenariats : ${email}.`] } ] },
    ar: { title: "من نحن", intro: `${C.brand} يساعدك على إيجاد عمل والتقديم بسيرة ذاتية تناسب الوظيفة.`, sections: [
      { h: "ماذا نفعل", p: ["نجمع عروض العمل من المغرب وأوروبا والسعودية في موجز واحد. اسحب وظيفة إلى سيرتك ليعيد الذكاء الاصطناعي صياغتها لتناسبها — تبقى حقائقك ويتغير التركيز — ثم عدّلها وترجمها ونزّلها في دقائق."] },
      { h: "لماذا", p: ["تفشل معظم الطلبات عند الفلترة الأولى. وسيرة ذاتية مُلائمة لكل عرض وباللغة الصحيحة هي أرخص وسيلة لتحسين فرصك، دون حاجة إلى حساب للتجربة."] },
      { h: "للمشغّلين", p: ["يحصل المشغّلون على فضاء خاص لمتابعة سوق التوظيف حسب البلد، مع نشر العروض ومتابعة المرشحين قريبًا."] },
      { h: "تواصل معنا", p: [`للملاحظات والشراكات: ${email}.`] } ] },
  },
};

export const CONTACT: Record<Lang, {
  title: string; intro: string; name: string; email: string; topic: string; message: string; send: string;
  topics: string[]; direct: string; reply: string; privacyNote: string;
}> = {
  en: { title: "Contact us", intro: "Questions, feedback, a job offer to report or a partnership? We usually reply within two working days.", name: "Your name", email: "Your email", topic: "Topic", message: "Message", send: "Send message",
    topics: ["General question", "Technical problem", "Report a job offer", "Privacy / delete my data", "Employers", "Partnership"], direct: "Or write directly to", reply: "Your email app will open with the message ready to send.", privacyNote: "We only use your details to answer you." },
  fr: { title: "Nous contacter", intro: "Une question, un retour, une offre à signaler ou un partenariat ? Nous répondons généralement sous deux jours ouvrés.", name: "Votre nom", email: "Votre e-mail", topic: "Sujet", message: "Message", send: "Envoyer le message",
    topics: ["Question générale", "Problème technique", "Signaler une offre", "Confidentialité / supprimer mes données", "Employeurs", "Partenariat"], direct: "Ou écrivez directement à", reply: "Votre application e-mail s'ouvrira avec le message prêt à envoyer.", privacyNote: "Vos données ne servent qu'à vous répondre." },
  ar: { title: "اتصل بنا", intro: "سؤال أو ملاحظة أو عرض عمل للإبلاغ عنه أو شراكة؟ نرد عادةً خلال يومي عمل.", name: "اسمك", email: "بريدك الإلكتروني", topic: "الموضوع", message: "الرسالة", send: "إرسال الرسالة",
    topics: ["سؤال عام", "مشكلة تقنية", "الإبلاغ عن عرض عمل", "الخصوصية / حذف بياناتي", "المشغّلون", "شراكة"], direct: "أو راسلنا مباشرة على", reply: "سيفتح تطبيق البريد لديك والرسالة جاهزة للإرسال.", privacyNote: "نستخدم بياناتك فقط للرد عليك." },
};
