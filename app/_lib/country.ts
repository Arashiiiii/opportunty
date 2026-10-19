import type { CountryCode } from "../i18n";

/**
 * Guess a job's country from its location text. Mirrors the database function
 * public.infer_job_country (keep both in sync). Order matters: unambiguous
 * Belgian places come before the Dutch list so "Limburg"/"Brabant" regions
 * don't get misfiled. Returns null when nothing matches — never a silent guess.
 */
const CITY_COUNTRY: [CountryCode, RegExp][] = [
  ["SA", /saudi|ksa|riyadh|jeddah|jidda|makkah|mecca|medina|madinah|dammam|khobar|dhahran|jubail|tabuk|abha|taif|yanbu|neom|qassim|hail\b|jazan|najran|الرياض|جدة|مكة|المدينة|الدمام|الخبر|السعودية/i],
  ["MA", /morocco|maroc|casablanca|rabat|marrakesh|marrakech|tangier|tanger|agadir|f[eè]s\b|mekn[eè]s|oujda|t[eé]touan|kenitra|k[eé]nitra|settat|mellal|safi|el jadida|nador|laayoune|essaouira|mohammedia|sal[eé]\b|المغرب/i],
  ["BE", /hasselt|genk|vlaanderen|flanders|wallon|hainaut|kortrijk|courtrai|aalst|oostende|ostend|roeselare|sint-niklaas|turnhout|ottignies|louvain-la-neuve|dilsen|verviers|tournai|la louvi[eè]re|beveren|zaventem|vilvoorde|waterloo|arlon/i],
  ["NL", /zuid-holland|noord-holland|noord-brabant|gelderland|overijssel|limburg|zeeland|drenthe|friesland|flevoland|groningen|tilburg|den haag|the hague|enschede|utrecht|barendrecht|oldenzaal|gulpen|holland|amsterdam|rotterdam|eindhoven|breda|nijmegen|arnhem|almere|maastricht|delft|leiden|haarlem|zwolle|apeldoorn|amersfoort|dordrecht|zoetermeer|nederland|netherlands/i],
  ["BE", /anderlecht|la hulpe|bruxelles|brussel|charleroi|braine|seneffe|gand\b|gent\b|mons\b|dinant|brabant|li[eè]ge|luik|antwerp|antwerpen|anvers|namur|leuven|louvain|mechelen|bruges|brugge|wavre|nivelles|belg/i],
  ["DE", /nordrhein|westfalen|\bnrw\b|bayern|bavaria|baden|hessen|niedersachsen|sachsen|brandenburg|rheinland|schleswig|th[uü]ringen|mecklenburg|w[uü]rzburg|kehl|essen\b|wegscheid|monheim|g[oö]rlitz|marktsteft|bottrop|saarbr[uü]cken|papenburg|berlin|m[uü]nchen|munich|hamburg|k[oö]ln|cologne|frankfurt|stuttgart|d[uü]sseldorf|dortmund|bremen|hannover|hanover|leipzig|dresden|n[uü]rnberg|nuremberg|bonn|mannheim|karlsruhe|augsburg|wiesbaden|bochum|duisburg|deutschland|german/i],
  ["FR", /paris|toulouse|lyon|marseille|nice\b|nantes|bordeaux|lille|strasbourg|montpellier|rennes|grenoble|dijon|besan[cç]on|argenteuil|puteaux|dagneux|pornichet|beauvais|dunkerque|vitrolles|issy|v[eé]lizy|garenne|saint-vulbas|ch[aâ]lons|bron\b|ergu[eé]|[iî]le-de-france|france/i],
];

export function inferCountryOrNull(location: string): CountryCode | null {
  for (const [c, re] of CITY_COUNTRY) if (re.test(location)) return c;
  return null;
}

/** Legacy callers that need a value: unknown places fall back to France. */
export function inferCountry(location: string): CountryCode {
  return inferCountryOrNull(location) ?? "FR";
}

/** Drop repeat postings of the same role at the same company (e.g. "Bruxelles" and "Brussel"). Keeps the first (newest). */
export function dedupeJobs<T extends { title: string; company: string }>(jobs: T[]): T[] {
  const seen = new Set<string>();
  return jobs.filter((j) => {
    const k = `${j.title.trim().toLowerCase()}|${j.company.trim().toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
