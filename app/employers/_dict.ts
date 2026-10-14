import type { Lang } from "../i18n";

export interface EmpDict {
  badge: string; loginTitle: string; loginNote: string; signupTitle: string; signupNote: string;
  company: string; workEmail: string; password: string; passwordMin: string;
  signIn: string; signingIn: string; createAccount: string; creating: string;
  noAccount: string; createOne: string; haveAccount: string;
  checkInbox: string; notEmployer: string; wrongAccount: string;
  employerAccount: string; jobSeeker: string; hiringLink: string; perks: string[];
}

const en: EmpDict = {
  badge: "For employers", loginTitle: "Employer sign in", loginNote: "Access your hiring dashboard.",
  signupTitle: "Create an employer account", signupNote: "Reach candidates in Morocco, Europe and Saudi Arabia.",
  company: "Company name", workEmail: "Work email", password: "Password", passwordMin: "Password (6+ characters)",
  signIn: "Sign in", signingIn: "Signing in…", createAccount: "Create employer account", creating: "Creating account…",
  noAccount: "New here?", createOne: "Create an employer account", haveAccount: "Already have an employer account?",
  checkInbox: "Check your inbox: we sent a confirmation link to {email}.",
  notEmployer: "This is a job seeker account. Sign in with an employer account, or create one.",
  wrongAccount: "Please sign in with your employer account.",
  employerAccount: "This is an employer account. Employers sign in from “For employers” on the home page.",
  jobSeeker: "Looking for a job? Job seeker sign in", hiringLink: "Hiring? Employer sign in",
  perks: ["Live view of the hiring market by country", "Post jobs and track applicants (coming soon)", "Job seekers across 6 countries"],
};
const fr: EmpDict = {
  badge: "Recruteurs", loginTitle: "Connexion recruteur", loginNote: "Accédez à votre tableau de bord de recrutement.",
  signupTitle: "Créer un compte recruteur", signupNote: "Touchez des candidats au Maroc, en Europe et en Arabie saoudite.",
  company: "Nom de l'entreprise", workEmail: "Email professionnel", password: "Mot de passe", passwordMin: "Mot de passe (6 caractères min.)",
  signIn: "Se connecter", signingIn: "Connexion…", createAccount: "Créer le compte recruteur", creating: "Création du compte…",
  noAccount: "Nouveau ici ?", createOne: "Créer un compte recruteur", haveAccount: "Vous avez déjà un compte recruteur ?",
  checkInbox: "Vérifiez votre boîte mail : nous avons envoyé un lien de confirmation à {email}.",
  notEmployer: "Ceci est un compte candidat. Connectez-vous avec un compte recruteur ou créez-en un.",
  wrongAccount: "Veuillez vous connecter avec votre compte recruteur.",
  employerAccount: "Ceci est un compte recruteur. Les recruteurs se connectent depuis « Recruteurs » sur la page d'accueil.",
  jobSeeker: "Vous cherchez un emploi ? Connexion candidat", hiringLink: "Vous recrutez ? Connexion recruteur",
  perks: ["Vue en direct du marché de l'emploi par pays", "Publiez des offres et suivez les candidats (bientôt)", "Des candidats dans 6 pays"],
};
const ar: EmpDict = {
  badge: "لأصحاب العمل", loginTitle: "تسجيل دخول صاحب العمل", loginNote: "ادخل إلى لوحة التوظيف الخاصة بك.",
  signupTitle: "أنشئ حساب صاحب عمل", signupNote: "تواصل مع مرشحين في المغرب وأوروبا والسعودية.",
  company: "اسم الشركة", workEmail: "البريد المهني", password: "كلمة المرور", passwordMin: "كلمة المرور (6 أحرف على الأقل)",
  signIn: "تسجيل الدخول", signingIn: "جارٍ الدخول…", createAccount: "أنشئ حساب صاحب عمل", creating: "جارٍ إنشاء الحساب…",
  noAccount: "جديد هنا؟", createOne: "أنشئ حساب صاحب عمل", haveAccount: "لديك حساب صاحب عمل؟",
  checkInbox: "تحقق من بريدك: أرسلنا رابط التأكيد إلى {email}.",
  notEmployer: "هذا حساب باحث عن عمل. سجّل الدخول بحساب صاحب عمل أو أنشئ واحداً.",
  wrongAccount: "يرجى تسجيل الدخول بحساب صاحب العمل.",
  employerAccount: "هذا حساب صاحب عمل. يسجّل أصحاب العمل الدخول من «للشركات» في الصفحة الرئيسية.",
  jobSeeker: "تبحث عن عمل؟ دخول الباحثين عن عمل", hiringLink: "توظّف؟ دخول أصحاب العمل",
  perks: ["نظرة مباشرة على سوق التوظيف حسب الدولة", "انشر الوظائف وتابع المتقدمين (قريباً)", "باحثون عن عمل في 6 دول"],
};

export const EMP: Record<Lang, EmpDict> = { en, fr, ar };
