/**
 * Original editorial content for each country landing page: it is what
 * makes /jobs/country/* more than a list of scraped offers. Keep statements
 * general and verifiable; avoid figures that change (salaries, visa rules).
 */
import type { CountryCode } from "@/app/i18n";

export interface Guide {
  intro: string[];
  cvTips: string[];
  agencies: { name: string; note: string }[];
  faq: { q: string; a: string }[];
}

export const GUIDES: Record<CountryCode, Guide> = {
  MA: {
    intro: [
      "Morocco's job market is concentrated around Casablanca, Rabat, Tangier, Marrakech and Agadir. Offshoring and customer-relations centres, IT services, industry and automotive, logistics, banking and tourism are among the sectors that recruit most often.",
      "French is the main working language in most private-sector offers, with Arabic and English requested for specific roles. Employers usually read the CV first, so a clear, well-structured French CV is the single most useful thing you can prepare.",
    ],
    cvTips: [
      "Write the CV in French unless the offer is in English; keep it to one page, two if you have more than ten years of experience.",
      "Put your languages and their level in a visible section: Arabic, French and English are often selection criteria.",
      "List your city and mobility (willing to relocate or work remotely), because many employers recruit nationally.",
      "A professional photo is still common on Moroccan CVs, but it is optional; use a plain, recent one if you include it.",
      "For each role, state results with numbers (volumes, targets reached, team size) rather than listing duties.",
    ],
    agencies: [
      { name: "ANAPEC", note: "Morocco's national employment agency, with a public job platform and support for job seekers." },
      { name: "Your university or school career centre", note: "Many Moroccan schools run recruitment forums and internship boards." },
    ],
    faq: [
      { q: "Should my CV be in French or Arabic for jobs in Morocco?", a: "French for most private-sector offers. Use Arabic or English only when the job posting is written in that language or explicitly requires it." },
      { q: "Do I need a photo on my CV in Morocco?", a: "It is common but not required. If you add one, keep it professional; if the employer asks for none, leave it out." },
      { q: "How long should a Moroccan CV be?", a: "One page for early-career profiles and up to two for experienced ones. Recruiters scan quickly, so put the most relevant experience first." },
    ],
  },
  FR: {
    intro: [
      "France recruits across Paris and Île-de-France, Lyon, Toulouse, Marseille, Bordeaux, Nantes and Lille. Tech, engineering, healthcare, retail, hospitality, construction and public services all post jobs year round.",
      "Applications are usually a CV plus a cover letter (lettre de motivation) tailored to the offer. Recruiters often filter CVs with an applicant tracking system, so mirroring the vocabulary of the job posting helps.",
    ],
    cvTips: [
      "Use reverse-chronological order and keep the CV to one page, two at most for senior profiles.",
      "A photo is optional in France and many recruiters prefer none; never include date of birth beyond what is needed, and skip marital status.",
      "Add a short headline (the job you are targeting) at the top, followed by a two-line summary.",
      "Mention your level in each language (for example B2 or C1) and list the tools and certifications from the offer.",
      "Send a cover letter when the offer asks for one, and keep it to a few short paragraphs about why this company and this role.",
    ],
    agencies: [
      { name: "France Travail", note: "The public employment service, with an official job board and registration for job seekers." },
      { name: "APEC", note: "The association for executive and professional recruitment, useful for managers and engineers." },
    ],
    faq: [
      { q: "Is a cover letter mandatory in France?", a: "Not always, but it is expected when the offer asks for it. Even when optional, a short tailored letter can set you apart." },
      { q: "Should I put a photo on a French CV?", a: "It is optional. Many recruiters evaluate CVs without one, so leaving it out is a safe choice." },
      { q: "Can I apply in English?", a: "Yes for international companies and English-language offers. Otherwise write the CV and letter in French." },
    ],
  },
  DE: {
    intro: [
      "Germany's largest job markets are Berlin, Munich, Hamburg, Frankfurt, Stuttgart, Cologne and Düsseldorf. Engineering, IT, healthcare, manufacturing, logistics and skilled trades have steady demand.",
      "German applications are formal and complete. Employers expect a clear CV (Lebenslauf), a cover letter (Anschreiben) matched to the role, and copies of relevant certificates and references.",
    ],
    cvTips: [
      "Use a tabular, reverse-chronological Lebenslauf of one to two pages with exact month-and-year dates and no unexplained gaps.",
      "A photo is common but optional; if you add one, make it a neutral professional portrait.",
      "State your German level using the CEFR scale (A1–C2) and any certificate such as Goethe or TestDaF.",
      "Attach degrees, work references (Arbeitszeugnisse) and certificates as a single, well-named PDF when the employer asks for them.",
      "Write a specific cover letter for each application; generic letters are quickly spotted.",
    ],
    agencies: [
      { name: "Bundesagentur für Arbeit", note: "The federal employment agency with Germany's official job exchange." },
      { name: "Make it in Germany", note: "The government portal for skilled workers considering a move to Germany." },
    ],
    faq: [
      { q: "Do I need to speak German to find a job in Germany?", a: "For many roles, yes. International tech and research teams often work in English, but daily life and most employers expect at least basic German." },
      { q: "Is a photo required on a German CV?", a: "No. It remains common, but it is optional and employers cannot require it." },
      { q: "How long should a German CV be?", a: "Usually one to two pages. Keep it factual and chronological, with dates for every position." },
    ],
  },
  BE: {
    intro: [
      "Belgium is trilingual and its job market is regional: Brussels is bilingual French and Dutch, Flanders works in Dutch and Wallonia in French, with German used in the east. Many offers are in Brussels, Antwerp, Ghent, Liège and Charleroi.",
      "Language skills decide a lot here. Check the language of the offer and the language level it requires, and write your CV in the language of the posting.",
    ],
    cvTips: [
      "Write the CV in the language of the job posting (French, Dutch or English) and list every language you speak with a clear level.",
      "Keep it to one or two pages in reverse-chronological order, with your commune or city so employers can judge commuting distance.",
      "A photo is optional; if you include one, keep it simple and professional.",
      "Mention your work permit or right-to-work status if relevant, since employers ask early.",
      "Add a tailored cover letter when requested, written in the same language as the CV.",
    ],
    agencies: [
      { name: "Actiris", note: "The public employment service of the Brussels-Capital Region." },
      { name: "VDAB", note: "The employment service of Flanders." },
      { name: "Le Forem", note: "The employment service of Wallonia." },
    ],
    faq: [
      { q: "Which language should my CV be in for Belgium?", a: "The language of the job posting: French for Wallonia and most Brussels roles, Dutch for Flanders, English only when the offer is in English." },
      { q: "Do I need to speak Dutch and French?", a: "Not for every job, but bilingual candidates have a clear advantage, especially in Brussels." },
      { q: "Where can I find official public job offers?", a: "Actiris in Brussels, VDAB in Flanders and Le Forem in Wallonia publish regional job boards." },
    ],
  },
  NL: {
    intro: [
      "The Netherlands recruits mainly around Amsterdam, Rotterdam, The Hague, Utrecht and Eindhoven. Tech, logistics, finance, life sciences, hospitality and the public sector are active, and many international companies work in English.",
      "Dutch employers value directness and a concise CV. Expect a short motivation letter alongside it, and be ready to explain how your experience fits the specific vacancy.",
    ],
    cvTips: [
      "Keep the CV to two pages at most, with a short profile at the top and your most relevant experience first.",
      "A photo is optional and not expected; focus on skills and concrete results.",
      "State your Dutch and English levels honestly, since many roles require one or both.",
      "Use plain, direct wording and avoid long paragraphs: recruiters scan quickly.",
      "Write a short, specific motivation letter (a few paragraphs) when the vacancy asks for one.",
    ],
    agencies: [
      { name: "UWV", note: "The Dutch employee insurance agency, which runs the official job-seeker service." },
      { name: "IND", note: "The immigration and naturalisation service, for work permit and residence information." },
    ],
    faq: [
      { q: "Can I work in the Netherlands without speaking Dutch?", a: "Yes in many international and tech roles where English is the working language, though Dutch widens your options considerably." },
      { q: "Do Dutch employers expect a cover letter?", a: "Often yes. Keep it short and specific to the vacancy." },
      { q: "Should I include a photo?", a: "It is optional and not expected on a Dutch CV." },
    ],
  },
  SA: {
    intro: [
      "Saudi Arabia is hiring at scale across Riyadh, Jeddah, the Eastern Province and giga-projects such as NEOM. Construction, energy, engineering, healthcare, technology, hospitality and retail are major sectors, and Saudization policies push many employers to hire locally.",
      "Offers are published in both Arabic and English. A clear English CV is standard for most professional roles, and an Arabic version helps for local and public-sector employers.",
    ],
    cvTips: [
      "Prepare the CV in English, and in Arabic as well for roles that are posted in Arabic.",
      "State your nationality, current location and notice period or availability; Gulf employers often ask for them up front.",
      "A professional photo is more common on Gulf CVs than in Europe, but follow the instructions in each job posting.",
      "List professional licences and certifications that matter for the role (engineering, healthcare, safety), with issuing bodies and dates.",
      "Mention previous Gulf or international experience and any language skills in Arabic and English.",
    ],
    agencies: [
      { name: "Jadarat", note: "The national employment platform operated by Saudi Arabia's human-resources ministry." },
      { name: "Qiwa", note: "The labour-services platform for work contracts and employment services." },
    ],
    faq: [
      { q: "Should my CV be in Arabic or English for jobs in Saudi Arabia?", a: "English for most professional and international employers; add an Arabic version when the posting is in Arabic or the employer is a local or public-sector organisation." },
      { q: "Is a photo normal on a CV in Saudi Arabia?", a: "It is common in the Gulf. Include one if the posting or company culture suggests it, and keep it professional." },
      { q: "Do I need a work visa before applying?", a: "Employers usually sponsor the visa after a job offer. Check the official government platforms and the employer's instructions before you travel." },
    ],
  },
};
