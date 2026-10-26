/**
 * Editorial content for the French SEO pages: city job pages, CV example pages, cover-letter guide.
 * Written to be useful on its own (not boilerplate) — each page also pulls live jobs or links to the builder.
 */

export interface City {
  slug: string; name: string; patterns: string[]; // patterns are matched case-insensitively against jobs.location
  intro: string[]; sectors: { t: string; d: string }[]; tips: string[]; faq: { q: string; a: string }[];
}

export const CITIES: City[] = [
  {
    slug: "casablanca", name: "Casablanca", patterns: ["casablanca"],
    intro: [
      "Casablanca est la capitale économique du Maroc et le premier bassin d'emploi du pays. On y trouve le siège de la plupart des grandes entreprises, des banques et des cabinets de conseil, ainsi que le port et de nombreuses zones industrielles autour de la ville.",
      "Les recruteurs y reçoivent beaucoup de candidatures : un CV clair, adapté à l'offre et facile à lire par un logiciel de tri fait vraiment la différence. Voici les offres ouvertes en ce moment, puis des repères pour postuler.",
    ],
    sectors: [
      { t: "Finance et assurance", d: "Banques, assurances et sociétés de gestion, avec le pôle financier de Casablanca Finance City." },
      { t: "Relation client et offshoring", d: "Centres d'appels et services externalisés, souvent bilingues français-arabe ou français-anglais." },
      { t: "Industrie et logistique", d: "Usines, entrepôts et transport autour du port et des zones industrielles de l'agglomération." },
      { t: "Commerce et distribution", d: "Grande distribution, négoce et fonctions commerciales dans toute la région." },
    ],
    tips: [
      "Indiquez Casablanca ou le Grand Casablanca dans l'en-tête de votre CV : de nombreux recruteurs filtrent par ville.",
      "Mentionnez vos langues avec un niveau précis (par exemple « Français : courant, Anglais : B2 ») : beaucoup de postes l'exigent.",
      "Pour une candidature depuis une autre ville, précisez votre disponibilité et votre date d'installation possible.",
    ],
    faq: [
      { q: "Quels secteurs recrutent le plus à Casablanca ?", a: "La finance, la relation client, l'industrie, la logistique et le commerce concentrent une grande partie des offres, mais cela varie selon les mois. La liste ci-dessus montre les offres actuellement ouvertes." },
      { q: "Faut-il parler français pour travailler à Casablanca ?", a: "Pour la plupart des postes en entreprise, oui : le français est la langue de travail courante. L'anglais est un vrai plus, et il est exigé dans les centres de services et les groupes internationaux." },
    ],
  },
  {
    slug: "marrakech", name: "Marrakech", patterns: ["marrakech", "marrakesh"],
    intro: [
      "Marrakech est le grand pôle touristique du Maroc : hôtels, riads, restauration, agences de voyage et commerces liés à l'accueil y emploient une grande partie de la population active. La ville accueille aussi des activités de services et de relation client.",
      "Les recruteurs du secteur de l'hôtellerie regardent d'abord vos langues, votre sens du service et votre expérience terrain. Voici les offres ouvertes à Marrakech, puis des conseils pour adapter votre CV.",
    ],
    sectors: [
      { t: "Hôtellerie et restauration", d: "Réception, service en salle, cuisine, gouvernante et direction d'établissement." },
      { t: "Tourisme et loisirs", d: "Agences, activités, transport touristique et animation." },
      { t: "Relation client", d: "Services clients et centres de contact, souvent multilingues." },
      { t: "Commerce et artisanat", d: "Boutiques, vente et métiers liés à l'artisanat et à la décoration." },
    ],
    tips: [
      "Mettez vos langues en haut du CV : français, anglais, arabe, mais aussi espagnol, allemand ou italien sont très recherchés dans le tourisme.",
      "Décrivez vos expériences en saison : dates précises, nom de l'établissement, nombre de couverts ou de chambres gérés.",
      "Ajoutez une photo professionnelle si vous visez la réception ou la vente en contact direct avec la clientèle.",
    ],
    faq: [
      { q: "Peut-on trouver du travail à Marrakech sans expérience ?", a: "Oui, notamment en hôtellerie, restauration et vente, où les employeurs forment souvent les débutants. Mettez en avant vos langues et votre disponibilité." },
      { q: "Le travail est-il saisonnier à Marrakech ?", a: "Une partie des postes dépend de la saison touristique. Les offres indiquent en général s'il s'agit d'un CDI, d'un CDD ou d'un contrat saisonnier." },
    ],
  },
  {
    slug: "rabat", name: "Rabat", patterns: ["rabat"],
    intro: [
      "Rabat est la capitale administrative du Maroc. Les ministères, les établissements publics, les ambassades et les organisations internationales y sont installés, ce qui en fait un marché de l'emploi différent de Casablanca : plus de fonctions administratives, juridiques et de conseil.",
      "On y trouve aussi des entreprises de technologie, notamment autour de la zone de Rabat-Salé, et de nombreux étudiants et jeunes diplômés des universités et grandes écoles. Voici les offres ouvertes à Rabat.",
    ],
    sectors: [
      { t: "Administration et secteur public", d: "Établissements publics, concours et postes contractuels, souvent sur dossier." },
      { t: "Conseil, juridique et finance", d: "Cabinets, fonctions support et organisations internationales." },
      { t: "Technologies et numérique", d: "Développement logiciel, support informatique et services numériques." },
      { t: "Enseignement et formation", d: "Établissements privés, centres de formation et recherche." },
    ],
    tips: [
      "Pour les postes publics ou parapublics, respectez à la lettre la liste de pièces demandée : un dossier incomplet est écarté sans lecture.",
      "Indiquez vos diplômes avec l'établissement et l'année : c'est un critère de tri fréquent à Rabat.",
      "Pour les organisations internationales, un CV en anglais complet est souvent demandé en plus de la version française.",
    ],
    faq: [
      { q: "Les concours de la fonction publique sont-ils sur ce site ?", a: "Certaines offres de recrutement publiques sont relayées quand elles sont publiées en ligne. Vérifiez toujours les conditions et la date limite sur le site officiel de l'organisme." },
      { q: "Quel CV pour un poste dans une organisation internationale ?", a: "Un CV d'une à deux pages, chronologique, en anglais ou en français selon l'offre, avec des résultats chiffrés. Le créateur de CV de opportunty propose des modèles adaptés." },
    ],
  },
  {
    slug: "tanger", name: "Tanger", patterns: ["tanger", "tangier"],
    intro: [
      "Tanger est devenue l'un des grands pôles industriels du Maroc grâce au port Tanger Med, aux zones franches et aux usines installées dans la région, notamment dans l'automobile, l'aéronautique et le textile. La ville recrute donc beaucoup d'ouvriers qualifiés, de techniciens et de profils logistiques.",
      "On y trouve aussi des centres de relation client et des services pour les entreprises du nord. Voici les offres ouvertes à Tanger et des conseils pour postuler.",
    ],
    sectors: [
      { t: "Automobile et industrie", d: "Production, maintenance, qualité et méthodes dans les usines de la région." },
      { t: "Logistique et transport", d: "Port, entrepôts, douane et transit." },
      { t: "Relation client", d: "Centres de contact avec des profils francophones, hispanophones et anglophones." },
      { t: "Textile et services", d: "Confection, commerce et services aux entreprises." },
    ],
    tips: [
      "Pour l'industrie, listez vos habilitations et formations (sécurité, conduite d'engins, qualité) dans une rubrique à part.",
      "L'espagnol est un vrai atout à Tanger, en relation client comme en commerce : indiquez-le avec votre niveau.",
      "Précisez si vous êtes disponible en horaires postés (2×8, 3×8) : c'est souvent un critère de sélection.",
    ],
    faq: [
      { q: "Quels profils recrutent à Tanger ?", a: "Principalement des opérateurs, techniciens, responsables de production, logisticiens et conseillers clientèle. Les offres ci-dessus montrent ce qui est ouvert actuellement." },
      { q: "Faut-il un diplôme pour travailler dans l'industrie à Tanger ?", a: "Beaucoup de postes de production demandent un niveau bac ou une formation professionnelle, avec une formation en interne. Les postes de technicien et d'ingénieur exigent un diplôme adapté." },
    ],
  },
];
export const CITY_BY_SLUG = Object.fromEntries(CITIES.map((c) => [c.slug, c]));

export interface Profession {
  slug: string; name: string; // name = the job as people search for it
  intro: string; summary: string; bullets: string[]; hard: string[]; soft: string[]; mistakes: string[];
  searchHint: string; // keyword used to link to matching jobs
}

export const PROFESSIONS: Profession[] = [
  {
    slug: "comptable", name: "Comptable", searchHint: "comptable",
    intro: "Un recruteur qui cherche un comptable veut voir en dix secondes votre niveau (comptable unique, aide-comptable, chef comptable), les logiciels que vous maîtrisez et la taille des dossiers que vous avez traités. Le CV doit donc être très précis sur les volumes et les outils.",
    summary: "Comptable avec 5 ans d'expérience en cabinet et en PME, responsable de la tenue complète de la comptabilité, des déclarations de TVA et de la préparation du bilan. À l'aise avec Sage et Excel, rigoureuse et habituée à respecter les clôtures mensuelles.",
    bullets: [
      "Tenue de la comptabilité générale et auxiliaire de 25 sociétés clientes (saisie, lettrage, rapprochements bancaires).",
      "Établissement des déclarations de TVA et préparation des éléments pour l'impôt sur les sociétés.",
      "Réalisation des clôtures mensuelles en 5 jours ouvrés au lieu de 8, grâce à un tableau de suivi sur Excel.",
      "Suivi des comptes clients : relances et réduction des retards de paiement de 15 %.",
    ],
    hard: ["Comptabilité générale et analytique", "TVA et déclarations fiscales", "Sage, Ciel ou Odoo", "Excel (tableaux croisés, RECHERCHEV)", "Rapprochements bancaires", "Clôture et bilan"],
    soft: ["Rigueur", "Respect des délais", "Confidentialité", "Sens de l'organisation"],
    mistakes: ["Écrire « tenue de la comptabilité » sans préciser le nombre de dossiers ni les logiciels utilisés.", "Oublier de distinguer ce que vous avez fait seul de ce que vous avez fait sous supervision."],
  },
  {
    slug: "developpeur-web", name: "Développeur web", searchHint: "développeur",
    intro: "Pour un poste de développeur, le CV est lu par un recruteur technique : il cherche vos technologies, vos projets et un lien vers votre code. Un CV d'une page, avec les technologies regroupées par catégorie, est plus efficace qu'une longue liste.",
    summary: "Développeur web full-stack avec 3 ans d'expérience en React, Node.js et PostgreSQL. A livré des applications utilisées par plus de 10 000 utilisateurs, avec un soin particulier pour les performances et les tests. Contributeur actif sur GitHub.",
    bullets: [
      "Développement d'une application de réservation en React et Node.js, utilisée par 10 000 clients par mois.",
      "Réduction du temps de chargement des pages de 3,2 s à 1,1 s grâce au découpage du code et à la mise en cache.",
      "Mise en place de tests automatisés et d'une intégration continue, diminuant les erreurs en production de moitié.",
      "Conception d'une API REST documentée et utilisée par l'équipe mobile.",
    ],
    hard: ["JavaScript / TypeScript", "React ou Vue", "Node.js, PHP ou Python", "SQL (PostgreSQL, MySQL)", "Git et GitHub", "API REST", "Tests et CI/CD"],
    soft: ["Travail en équipe", "Autonomie", "Communication avec les non-techniques", "Curiosité"],
    mistakes: ["Lister vingt technologies sans indiquer lesquelles vous maîtrisez vraiment.", "Ne pas mettre de lien vers GitHub ou un projet en ligne."],
  },
  {
    slug: "commercial", name: "Commercial", searchHint: "commercial",
    intro: "En vente, les résultats parlent plus que les mots. Un CV de commercial convaincant montre des chiffres : objectifs, chiffre d'affaires, nombre de clients, taux de conversion. Le type de clientèle (particuliers, entreprises) et le cycle de vente doivent aussi apparaître.",
    summary: "Commercial terrain avec 4 ans d'expérience en vente B2B, spécialisé dans la prospection et la fidélisation de PME. A dépassé ses objectifs annuels trois années de suite. Bilingue français-arabe, à l'aise en négociation et en suivi de portefeuille.",
    bullets: [
      "Gestion d'un portefeuille de 120 clients PME dans la région de Casablanca.",
      "Dépassement des objectifs : 118 % du chiffre d'affaires cible en 2025.",
      "Prospection de 30 nouveaux comptes par trimestre par visites et appels.",
      "Mise en place d'un suivi hebdomadaire sur CRM, améliorant le taux de relance de 25 %.",
    ],
    hard: ["Prospection et négociation", "Gestion de portefeuille", "CRM (HubSpot, Zoho)", "Devis et contrats", "Reporting commercial", "Excel"],
    soft: ["Écoute", "Persévérance", "Aisance relationnelle", "Sens du résultat"],
    mistakes: ["Parler de « bons résultats » sans les chiffrer.", "Omettre le permis de conduire quand le poste est itinérant."],
  },
  {
    slug: "assistant-administratif", name: "Assistant administratif", searchHint: "assistant",
    intro: "Le poste d'assistant administratif repose sur l'organisation et la maîtrise des outils bureautiques. Le recruteur cherche des preuves de fiabilité : types de documents gérés, outils utilisés, interlocuteurs, et capacité à travailler en autonomie.",
    summary: "Assistante administrative avec 3 ans d'expérience dans une PME de services. Gère l'agenda de la direction, la facturation et l'accueil, avec une grande maîtrise du pack Office. Organisée, discrète et bilingue français-anglais.",
    bullets: [
      "Gestion de l'agenda, des déplacements et de la correspondance de deux directeurs.",
      "Saisie et suivi de 150 factures clients et fournisseurs par mois.",
      "Classement numérique de l'ensemble des contrats, réduisant le temps de recherche de documents.",
      "Accueil téléphonique et physique, orientation des visiteurs et traitement du courrier.",
    ],
    hard: ["Word, Excel, Outlook", "Gestion d'agenda", "Facturation et suivi des paiements", "Rédaction de courriers", "Archivage", "Accueil téléphonique"],
    soft: ["Organisation", "Discrétion", "Politesse", "Gestion des priorités"],
    mistakes: ["Se contenter de « gestion administrative » sans exemples concrets.", "Ne pas indiquer le niveau de français et d'anglais écrit."],
  },
  {
    slug: "conseiller-clientele", name: "Conseiller clientèle", searchHint: "conseiller",
    intro: "Les centres de relation client recrutent en continu au Maroc. Le CV doit montrer vos langues, votre aisance à l'oral et votre capacité à tenir des objectifs de qualité. Même sans expérience en centre d'appels, vos expériences de contact client comptent.",
    summary: "Conseiller clientèle francophone avec 2 ans d'expérience en centre de contact, habitué à traiter 60 appels par jour avec un taux de satisfaction de 92 %. Excellente expression orale, à l'aise sur les outils de ticketing et disponible en horaires décalés.",
    bullets: [
      "Traitement de 60 appels et messages par jour pour une marque de télécommunications.",
      "Maintien d'un taux de satisfaction client de 92 % sur les 12 derniers mois.",
      "Résolution de 80 % des demandes dès le premier contact.",
      "Formation de deux nouveaux conseillers à l'outil de gestion des tickets.",
    ],
    hard: ["Gestion d'appels entrants et sortants", "Outils de ticketing et CRM", "Saisie rapide", "Français courant à l'écrit et à l'oral", "Anglais ou espagnol (selon le poste)"],
    soft: ["Patience", "Écoute active", "Gestion du stress", "Clarté d'expression"],
    mistakes: ["Ne pas préciser les langues et le niveau, alors que c'est le premier critère de tri.", "Oublier de mentionner votre disponibilité pour des horaires décalés ou le week-end."],
  },
  {
    slug: "marketing-digital", name: "Chargé de marketing digital", searchHint: "marketing",
    intro: "En marketing digital, un bon CV prouve que vous savez lancer des actions et mesurer leur effet. Citez les canaux (réseaux sociaux, emailing, publicité en ligne, SEO), les outils et surtout les résultats : audience, leads, coût d'acquisition, ventes.",
    summary: "Chargé de marketing digital avec 3 ans d'expérience en e-commerce. A fait passer le trafic d'un site de 5 000 à 25 000 visites par mois grâce au SEO et aux réseaux sociaux. À l'aise avec Google Analytics, Meta Ads et Canva.",
    bullets: [
      "Animation de 4 comptes de réseaux sociaux et croissance de l'audience de 40 % en 6 mois.",
      "Gestion d'un budget publicitaire mensuel de 20 000 MAD avec un coût par lead réduit de 30 %.",
      "Rédaction et optimisation de 40 articles de blog pour le référencement naturel.",
      "Envoi de newsletters à 15 000 abonnés avec un taux d'ouverture de 28 %.",
    ],
    hard: ["SEO", "Meta Ads et Google Ads", "Google Analytics", "Emailing", "Rédaction web", "Canva ou Photoshop"],
    soft: ["Créativité", "Esprit d'analyse", "Curiosité", "Adaptabilité"],
    mistakes: ["Décrire des tâches (« gestion des réseaux sociaux ») sans aucun résultat mesuré.", "Ne pas mettre de lien vers un compte ou une campagne que vous avez réalisés."],
  },
  {
    slug: "stagiaire", name: "Stagiaire / étudiant", searchHint: "stage",
    intro: "Sans expérience professionnelle, votre CV doit mettre en avant votre formation, vos projets et vos qualités. Les recruteurs de stage s'attendent à un CV d'une seule page, clair, avec des projets universitaires concrets et des centres d'intérêt qui disent quelque chose de vous.",
    summary: "Étudiant en 3e année de gestion à la recherche d'un stage de fin d'études de 4 mois en finance d'entreprise. Rigoureux et motivé, avec une première expérience associative en organisation d'événements et une bonne maîtrise d'Excel.",
    bullets: [
      "Projet de fin d'année : étude financière d'une PME réelle et présentation devant un jury.",
      "Trésorier d'un club étudiant : suivi d'un budget de 15 000 MAD et rapports mensuels.",
      "Job d'été en caisse : accueil de 200 clients par jour et gestion des encaissements.",
      "Participation à un concours d'études de cas organisé par l'université.",
    ],
    hard: ["Excel (niveau intermédiaire)", "Word et PowerPoint", "Langues avec niveau précis", "Logiciel lié à votre filière"],
    soft: ["Motivation", "Capacité d'apprentissage", "Esprit d'équipe", "Ponctualité"],
    mistakes: ["Remplir le CV de généralités (« dynamique, sérieux ») sans aucun exemple.", "Dépasser une page : pour un stage, une page suffit."],
  },
  {
    slug: "ingenieur-industriel", name: "Ingénieur industriel", searchHint: "ingénieur",
    intro: "Dans l'industrie, le recruteur cherche des résultats sur la production : rendement, qualité, délais, sécurité. Un CV d'ingénieur doit préciser le secteur, la taille du site, les méthodes utilisées (Lean, Six Sigma, 5S) et les gains obtenus.",
    summary: "Ingénieur industriel avec 4 ans d'expérience dans l'automobile, spécialisé en amélioration continue et en méthodes. A réduit les rebuts de 18 % sur une ligne de production grâce à une démarche Lean. À l'aise avec AutoCAD et SAP.",
    bullets: [
      "Pilotage d'un projet Lean sur une ligne de 120 opérateurs, réduisant les rebuts de 18 %.",
      "Mise à jour des gammes de fabrication et standardisation de 30 postes de travail.",
      "Animation de la réunion qualité hebdomadaire et suivi des indicateurs (TRS, PPM).",
      "Formation de 40 opérateurs aux règles de sécurité et aux 5S.",
    ],
    hard: ["Lean manufacturing et 5S", "Six Sigma", "Gestion de production et planification", "SAP ou ERP équivalent", "AutoCAD / SolidWorks", "Normes qualité (ISO 9001, IATF)"],
    soft: ["Leadership", "Résolution de problèmes", "Esprit d'équipe", "Rigueur"],
    mistakes: ["Lister des méthodes sans dire sur quel projet vous les avez appliquées.", "Ne pas indiquer le secteur et la taille de l'usine."],
  },
];
export const PROFESSION_BY_SLUG = Object.fromEntries(PROFESSIONS.map((p) => [p.slug, p]));
