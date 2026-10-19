-- Applied to project wbylajifhgafnzlgtdhr on 2026-10-19.
-- Unknown locations no longer default to France (they stay NULL), Belgian/German regions are recognised,
-- and rows the old 'FR' fallback misfiled were re-inferred. Keep in sync with app/_lib/country.ts.
CREATE OR REPLACE FUNCTION public.infer_job_country(loc text)
 RETURNS text LANGUAGE plpgsql IMMUTABLE AS $function$
begin
  if loc ~* 'saudi|ksa|riyadh|jeddah|jidda|makkah|mecca|medina|madinah|dammam|khobar|dhahran|jubail|tabuk|abha|taif|yanbu|neom|qassim|hail\y|jazan|najran|الرياض|جدة|مكة|المدينة|الدمام|الخبر|السعودية' then return 'SA'; end if;
  if loc ~* 'morocco|maroc|casablanca|rabat|marrakesh|marrakech|tangier|tanger|agadir|f[eè]s\y|mekn[eè]s|oujda|t[eé]touan|kenitra|k[eé]nitra|settat|mellal|safi|el jadida|nador|laayoune|essaouira|mohammedia|sal[eé]\y|المغرب' then return 'MA'; end if;
  if loc ~* 'hasselt|genk|vlaanderen|flanders|wallon|hainaut|kortrijk|courtrai|aalst|oostende|ostend|roeselare|sint-niklaas|turnhout|ottignies|louvain-la-neuve|dilsen|verviers|tournai|la louvi[eè]re|lokeen|beveren|zaventem|vilvoorde|waterloo|arlon' then return 'BE'; end if;
  if loc ~* 'zuid-holland|noord-holland|noord-brabant|gelderland|overijssel|limburg|zeeland|drenthe|friesland|flevoland|groningen|tilburg|den haag|the hague|enschede|utrecht|barendrecht|oldenzaal|gulpen|holland|amsterdam|rotterdam|eindhoven|breda|nijmegen|arnhem|almere|maastricht|delft|leiden|haarlem|zwolle|apeldoorn|amersfoort|dordrecht|zoetermeer|nederland|netherlands' then return 'NL'; end if;
  if loc ~* 'anderlecht|la hulpe|bruxelles|brussel|charleroi|braine|seneffe|gand\y|gent\y|mons\y|dinant|brabant|li[eè]ge|luik|antwerp|antwerpen|anvers|namur|leuven|louvain|mechelen|bruges|brugge|wavre|nivelles|belg' then return 'BE'; end if;
  if loc ~* 'nordrhein|westfalen|\ynrw\y|bayern|bavaria|baden|hessen|niedersachsen|sachsen|brandenburg|rheinland|schleswig|th[uü]ringen|mecklenburg|w[uü]rzburg|kehl|essen\y|wegscheid|monheim|g[oö]rlitz|marktsteft|bottrop|saarbr[uü]cken|papenburg|berlin|m[uü]nchen|munich|hamburg|k[oö]ln|cologne|frankfurt|stuttgart|d[uü]sseldorf|dortmund|bremen|hannover|hanover|leipzig|dresden|n[uü]rnberg|nuremberg|bonn|mannheim|karlsruhe|augsburg|wiesbaden|bochum|duisburg|deutschland|german' then return 'DE'; end if;
  if loc ~* 'paris|toulouse|lyon|marseille|nice\y|nantes|bordeaux|lille|strasbourg|montpellier|rennes|grenoble|dijon|besan[cç]on|argenteuil|puteaux|dagneux|pornichet|beauvais|dunkerque|vitrolles|issy|v[eé]lizy|garenne|saint-vulbas|ch[aâ]lons|bron\y|ergu[eé]|[iî]le-de-france|france' then return 'FR'; end if;
  return null;
end $function$;

update public.jobs set "Country" = public.infer_job_country(location)
where "Country" = 'FR' and public.infer_job_country(coalesce(location,'')) is distinct from 'FR'
  and public.infer_job_country(coalesce(location,'')) is not null;
