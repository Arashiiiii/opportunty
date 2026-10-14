import type { CountryCode } from "../i18n";

/** Fallback only for rows/DBs without a `country` value: guess from the location text. */
const CITY_COUNTRY: [CountryCode, RegExp][] = [
  ["SA", /saudi|ksa|riyadh|jeddah|jidda|makkah|mecca|medina|madinah|dammam|khobar|dhahran|jubail|tabuk|abha|taif|yanbu|neom|qassim|hail\b|jazan|najran|الرياض|جدة|مكة|المدينة|الدمام|الخبر|السعودية/i],
  ["MA", /morocco|maroc|casablanca|rabat|marrakesh|marrakech|tangier|tanger|agadir|f[eè]s\b|mekn[eè]s|oujda|t[eé]touan|kenitra|k[eé]nitra|settat|mellal|safi|el jadida|nador|laayoune|essaouira|mohammedia|sal[eé]\b/i],
  ["NL", /zuid-holland|noord-holland|noord-brabant|gelderland|overijssel|limburg|zeeland|drenthe|friesland|flevoland|groningen|tilburg|den haag|the hague|enschede|utrecht|barendrecht|oldenzaal|gulpen|holland|amsterdam|rotterdam|eindhoven|groningen|breda|nijmegen|arnhem|almere|maastricht|delft|leiden|haarlem|zwolle|apeldoorn|nederland|netherlands/i],
  ["BE", /anderlecht|la hulpe|bruxelles|brussel|charleroi|braine|seneffe|gand\b|gent\b|mons\b|dinant|brabant|li[eè]ge|luik|antwerp|anvers|namur|leuven|louvain|mechelen|bruges|brugge|wavre|nivelles|belg/i],
  ["DE", /w[uü]rzburg|kehl|essen\b|wegscheid|monheim|g[oö]rlitz|marktsteft|bottrop|saarbr[uü]cken|papenburg|berlin|m[uü]nchen|munich|hamburg|k[oö]ln|cologne|frankfurt|stuttgart|d[uü]sseldorf|dortmund|bremen|hannover|leipzig|dresden|n[uü]rnberg|nuremberg|bonn|mannheim|karlsruhe|augsburg|wiesbaden|bochum|duisburg|deutschland|german/i],
  ["FR", /paris|toulouse|lyon|marseille|nice\b|nantes|bordeaux|lille|strasbourg|montpellier|rennes|grenoble|dijon|besan[cç]on|argenteuil|puteaux|dagneux|pornichet|beauvais|dunkerque|vitrolles|issy|v[eé]lizy|garenne|saint-vulbas|ch[aâ]lons|bron\b|ergu[eé]|france/i],
];
export function inferCountry(location: string): CountryCode {
  for (const [c, re] of CITY_COUNTRY) if (re.test(location)) return c;
  return "FR";
}

