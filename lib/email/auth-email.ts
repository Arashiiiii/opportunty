/**
 * Branded transactional auth emails (confirm signup, reset password, magic
 * link, email change, invite, reauthentication) in EN / FR / AR.
 *
 * Table-based layout with inline styles only: Gmail, Outlook and Apple Mail
 * strip <style> blocks and ignore flexbox/grid. Colours match the site
 * (ink #0e1a21, cream #ffffff, orange #0079a8).
 */

export type Lang = "en" | "fr" | "ar";
export type AuthEmailType = "signup" | "recovery" | "magiclink" | "invite" | "email_change" | "reauthentication";

interface Copy {
  subject: string;
  preheader: string;
  title: string;
  body: string;
  cta: string;
  codeLabel: string;
  fallback: string;
  ignore: string;
  expires: string;
}

const COPY: Record<Lang, Record<AuthEmailType, Copy>> = {
  en: {
    signup: { subject: "Confirm your email to start on opportunty.", preheader: "One tap to activate your account and build your CV.", title: "Welcome aboard — confirm your email", body: "You're one step away from jobs matched to your CV. Confirm your address to activate your account.", cta: "Confirm my email", codeLabel: "Or enter this code", fallback: "Button not working? Paste this link into your browser:", ignore: "If you didn't create an account, you can safely ignore this email.", expires: "This link expires in 24 hours." },
    recovery: { subject: "Reset your opportunty. password", preheader: "Choose a new password in one tap.", title: "Reset your password", body: "We received a request to reset the password for your account. Tap the button to choose a new one.", cta: "Choose a new password", codeLabel: "Or enter this code", fallback: "Button not working? Paste this link into your browser:", ignore: "If you didn't ask for this, ignore this email — your password stays the same.", expires: "This link expires in 1 hour." },
    magiclink: { subject: "Your sign-in link for opportunty.", preheader: "Tap to sign in — no password needed.", title: "Sign in to opportunty.", body: "Use the button below to sign in instantly. No password needed.", cta: "Sign me in", codeLabel: "Or enter this code", fallback: "Button not working? Paste this link into your browser:", ignore: "If you didn't request this, you can ignore this email.", expires: "This link expires in 1 hour." },
    invite: { subject: "You've been invited to opportunty.", preheader: "Accept your invitation and set up your account.", title: "You're invited", body: "You've been invited to join opportunty. Accept the invitation to set up your account.", cta: "Accept invitation", codeLabel: "Or enter this code", fallback: "Button not working? Paste this link into your browser:", ignore: "If you weren't expecting this invitation, you can ignore this email.", expires: "" },
    email_change: { subject: "Confirm your new email address", preheader: "Confirm the change to keep your account secure.", title: "Confirm your new email", body: "Confirm this address to finish changing the email on your opportunty. account.", cta: "Confirm new email", codeLabel: "Or enter this code", fallback: "Button not working? Paste this link into your browser:", ignore: "If you didn't request this change, secure your account right away.", expires: "" },
    reauthentication: { subject: "Your opportunty. verification code", preheader: "Use this code to confirm it's you.", title: "Confirm it's you", body: "Enter this code to continue with your sensitive action.", cta: "", codeLabel: "Your code", fallback: "", ignore: "If you didn't request this, ignore this email.", expires: "This code expires in 10 minutes." },
  },
  fr: {
    signup: { subject: "Confirmez votre e-mail pour démarrer sur opportunty.", preheader: "Un clic pour activer votre compte et créer votre CV.", title: "Bienvenue — confirmez votre e-mail", body: "Vous êtes à une étape d'offres adaptées à votre CV. Confirmez votre adresse pour activer votre compte.", cta: "Confirmer mon e-mail", codeLabel: "Ou saisissez ce code", fallback: "Le bouton ne fonctionne pas ? Collez ce lien dans votre navigateur :", ignore: "Si vous n'avez pas créé de compte, ignorez simplement cet e-mail.", expires: "Ce lien expire dans 24 heures." },
    recovery: { subject: "Réinitialisez votre mot de passe opportunty.", preheader: "Choisissez un nouveau mot de passe en un clic.", title: "Réinitialiser votre mot de passe", body: "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte. Touchez le bouton pour en choisir un nouveau.", cta: "Choisir un nouveau mot de passe", codeLabel: "Ou saisissez ce code", fallback: "Le bouton ne fonctionne pas ? Collez ce lien dans votre navigateur :", ignore: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail — votre mot de passe reste inchangé.", expires: "Ce lien expire dans 1 heure." },
    magiclink: { subject: "Votre lien de connexion opportunty.", preheader: "Touchez pour vous connecter — sans mot de passe.", title: "Connexion à opportunty.", body: "Utilisez le bouton ci-dessous pour vous connecter instantanément, sans mot de passe.", cta: "Me connecter", codeLabel: "Ou saisissez ce code", fallback: "Le bouton ne fonctionne pas ? Collez ce lien dans votre navigateur :", ignore: "Si vous n'avez rien demandé, ignorez cet e-mail.", expires: "Ce lien expire dans 1 heure." },
    invite: { subject: "Vous êtes invité(e) sur opportunty.", preheader: "Acceptez l'invitation et configurez votre compte.", title: "Vous êtes invité(e)", body: "Vous avez été invité(e) à rejoindre opportunty. Acceptez l'invitation pour configurer votre compte.", cta: "Accepter l'invitation", codeLabel: "Ou saisissez ce code", fallback: "Le bouton ne fonctionne pas ? Collez ce lien dans votre navigateur :", ignore: "Si vous n'attendiez pas cette invitation, ignorez cet e-mail.", expires: "" },
    email_change: { subject: "Confirmez votre nouvelle adresse e-mail", preheader: "Confirmez le changement pour sécuriser votre compte.", title: "Confirmez votre nouvel e-mail", body: "Confirmez cette adresse pour terminer le changement d'e-mail de votre compte opportunty.", cta: "Confirmer le nouvel e-mail", codeLabel: "Ou saisissez ce code", fallback: "Le bouton ne fonctionne pas ? Collez ce lien dans votre navigateur :", ignore: "Si vous n'êtes pas à l'origine de ce changement, sécurisez votre compte immédiatement.", expires: "" },
    reauthentication: { subject: "Votre code de vérification opportunty.", preheader: "Utilisez ce code pour confirmer que c'est bien vous.", title: "Confirmez que c'est vous", body: "Saisissez ce code pour poursuivre votre action sensible.", cta: "", codeLabel: "Votre code", fallback: "", ignore: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.", expires: "Ce code expire dans 10 minutes." },
  },
  ar: {
    signup: { subject: "أكّد بريدك الإلكتروني للبدء في opportunty.", preheader: "نقرة واحدة لتفعيل حسابك وإنشاء سيرتك الذاتية.", title: "مرحباً بك — أكّد بريدك الإلكتروني", body: "أنت على بُعد خطوة من وظائف تناسب سيرتك الذاتية. أكّد عنوانك لتفعيل حسابك.", cta: "تأكيد بريدي الإلكتروني", codeLabel: "أو أدخل هذا الرمز", fallback: "الزر لا يعمل؟ الصق هذا الرابط في متصفحك:", ignore: "إذا لم تُنشئ حساباً، يمكنك تجاهل هذه الرسالة بأمان.", expires: "ينتهي هذا الرابط خلال 24 ساعة." },
    recovery: { subject: "إعادة تعيين كلمة المرور في opportunty.", preheader: "اختر كلمة مرور جديدة بنقرة واحدة.", title: "إعادة تعيين كلمة المرور", body: "تلقّينا طلباً لإعادة تعيين كلمة مرور حسابك. اضغط الزر لاختيار كلمة مرور جديدة.", cta: "اختيار كلمة مرور جديدة", codeLabel: "أو أدخل هذا الرمز", fallback: "الزر لا يعمل؟ الصق هذا الرابط في متصفحك:", ignore: "إذا لم تطلب ذلك، تجاهل هذه الرسالة — ستبقى كلمة مرورك كما هي.", expires: "ينتهي هذا الرابط خلال ساعة واحدة." },
    magiclink: { subject: "رابط تسجيل الدخول إلى opportunty.", preheader: "اضغط لتسجيل الدخول — دون كلمة مرور.", title: "تسجيل الدخول إلى opportunty.", body: "استخدم الزر أدناه لتسجيل الدخول فوراً دون كلمة مرور.", cta: "تسجيل الدخول", codeLabel: "أو أدخل هذا الرمز", fallback: "الزر لا يعمل؟ الصق هذا الرابط في متصفحك:", ignore: "إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.", expires: "ينتهي هذا الرابط خلال ساعة واحدة." },
    invite: { subject: "تمت دعوتك إلى opportunty.", preheader: "اقبل الدعوة وأعدّ حسابك.", title: "لقد تمت دعوتك", body: "تمت دعوتك للانضمام إلى opportunty. اقبل الدعوة لإعداد حسابك.", cta: "قبول الدعوة", codeLabel: "أو أدخل هذا الرمز", fallback: "الزر لا يعمل؟ الصق هذا الرابط في متصفحك:", ignore: "إذا لم تكن تتوقع هذه الدعوة، تجاهل هذه الرسالة.", expires: "" },
    email_change: { subject: "أكّد عنوان بريدك الإلكتروني الجديد", preheader: "أكّد التغيير للحفاظ على أمان حسابك.", title: "أكّد بريدك الإلكتروني الجديد", body: "أكّد هذا العنوان لإتمام تغيير البريد الإلكتروني في حسابك على opportunty.", cta: "تأكيد البريد الجديد", codeLabel: "أو أدخل هذا الرمز", fallback: "الزر لا يعمل؟ الصق هذا الرابط في متصفحك:", ignore: "إذا لم تطلب هذا التغيير، فأمّن حسابك فوراً.", expires: "" },
    reauthentication: { subject: "رمز التحقق الخاص بك في opportunty.", preheader: "استخدم هذا الرمز لتأكيد هويتك.", title: "أكّد أنك أنت", body: "أدخل هذا الرمز لمتابعة الإجراء الحساس.", cta: "", codeLabel: "رمزك", fallback: "", ignore: "إذا لم تطلب ذلك، تجاهل هذه الرسالة.", expires: "ينتهي هذا الرمز خلال 10 دقائق." },
  },
};

const FOOT: Record<Lang, string> = {
  en: "Jobs and an AI CV builder, in one place.",
  fr: "Offres d'emploi et créateur de CV par IA, au même endroit.",
  ar: "وظائف ومنشئ سيرة ذاتية بالذكاء الاصطناعي في مكان واحد.",
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export function pickLang(v: unknown): Lang {
  return v === "fr" || v === "ar" ? v : "en";
}

export interface AuthEmailInput {
  type: AuthEmailType;
  lang: Lang;
  /** Verification URL (omitted for reauthentication). */
  link?: string;
  /** 6-digit OTP. */
  code?: string;
  siteUrl: string;
}

export function renderAuthEmail({ type, lang, link, code, siteUrl }: AuthEmailInput): { subject: string; html: string; text: string } {
  const c = COPY[lang][type];
  const rtl = lang === "ar";
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";
  const font = rtl ? "'Segoe UI',Tahoma,Arial,sans-serif" : "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
  const logo = `${siteUrl}/email/logo.png`;

  const button = link && c.cta
    ? `<tr><td style="padding:8px 0 28px"><a href="${esc(link)}" style="display:inline-block;background:#0079a8;color:#ffffff;font-weight:700;font-size:16px;line-height:20px;text-decoration:none;padding:15px 30px;border-radius:12px;box-shadow:0 6px 16px rgba(0,121,168,.28)">${esc(c.cta)}</a></td></tr>`
    : "";

  const codeBlock = code
    ? `<tr><td style="padding:0 0 ${link ? "24" : "28"}px"><div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5f7280;margin-bottom:8px">${esc(c.codeLabel)}</div><div dir="ltr" style="display:inline-block;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:28px;font-weight:700;letter-spacing:.32em;color:#0e1a21;background:#f3f2ed;border:1px solid rgba(14,26,33,.12);border-radius:12px;padding:12px 20px">${esc(code)}</div></td></tr>`
    : "";

  const fallback = link && c.fallback
    ? `<tr><td style="padding:0 0 22px;font-size:13px;line-height:20px;color:#26343d">${esc(c.fallback)}<br><a href="${esc(link)}" style="color:#0079a8;word-break:break-all;text-decoration:underline" dir="ltr">${esc(link)}</a></td></tr>`
    : "";

  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${esc(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f2ed;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(c.preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f2ed"><tr><td align="center" style="padding:32px 14px">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;font-family:${font}">
    <tr><td align="${align}" style="padding:0 6px 18px" dir="${dir}">
      <a href="${esc(siteUrl)}" style="text-decoration:none;color:#0e1a21;font-size:20px;font-weight:700;letter-spacing:-.4px"><img src="${esc(logo)}" width="30" height="30" alt="" style="vertical-align:middle;border:0;border-radius:8px;margin:0 8px"><span dir="ltr" style="vertical-align:middle;unicode-bidi:isolate">opportunty<span style="color:#0079a8">.</span></span></a>
    </td></tr>
    <tr><td style="background:#ffffff;border:1px solid rgba(14,26,33,.1);border-radius:20px;overflow:hidden">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="height:6px;background:#0079a8;background-image:linear-gradient(90deg,#0079a8,#25a8e0);font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td align="${align}" dir="${dir}" style="padding:36px 36px 12px;color:#0e1a21">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:0 0 12px;font-size:28px;line-height:34px;font-weight:700;letter-spacing:-.6px;color:#0e1a21">${esc(c.title)}</td></tr>
            <tr><td style="padding:0 0 26px;font-size:16px;line-height:25px;color:#26343d">${esc(c.body)}</td></tr>
            ${button}${codeBlock}${fallback}
            <tr><td style="padding:20px 0 0;border-top:1px solid rgba(14,26,33,.1);font-size:13px;line-height:20px;color:#26343d">${esc(c.ignore)}${c.expires ? ` ${esc(c.expires)}` : ""}</td></tr>
          </table>
        </td></tr>
        <tr><td style="height:28px;font-size:0;line-height:0">&nbsp;</td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:22px 10px 0;font-size:12.5px;line-height:19px;color:#5f7280">
      <div style="font-weight:600;color:#26343d">opportunty<span style="color:#0079a8">.</span></div>
      <div>${esc(FOOT[lang])}</div>
      <div style="margin-top:6px"><a href="${esc(siteUrl)}" style="color:#5f7280;text-decoration:underline">${esc(siteUrl.replace(/^https?:\/\//, ""))}</a></div>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const text = [c.title, "", c.body, "", link ? `${c.cta}: ${link}` : "", code ? `${c.codeLabel}: ${code}` : "", "", c.ignore, c.expires].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
  return { subject: c.subject, html, text };
}
