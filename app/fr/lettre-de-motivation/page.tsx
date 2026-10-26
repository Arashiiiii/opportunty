import type { Metadata } from "next";
import Link from "next/link";
import { FrPage, frH1, frH2, frH3, frP, frUl, frBtn, frLink } from "../../_components/FrContent";

export const metadata: Metadata = {
  title: "Lettre de motivation : modèle, structure et exemple | opportunty",
  description: "Comment écrire une lettre de motivation efficace : structure en 4 parties, exemple complet, erreurs à éviter. Modèle à adapter pour un emploi ou un stage.",
  alternates: { canonical: "/fr/lettre-de-motivation" },
  openGraph: { type: "article", url: "/fr/lettre-de-motivation", title: "Lettre de motivation : modèle, structure et exemple", description: "Structure en 4 parties, exemple complet et erreurs à éviter." },
};

const quote: React.CSSProperties = { margin: "0 0 12px", padding: "16px 20px", borderInlineStart: "4px solid #0079a8", background: "#f3f2ed", borderRadius: 8, fontSize: 15.5, lineHeight: 1.75, color: "#26343d", whiteSpace: "pre-line" };

export default function Page() {
  return (
    <FrPage crumbs={[{ name: "Lettre de motivation" }]}>
      <h1 style={frH1}>Lettre de motivation : modèle et exemple</h1>
      <p style={frP}>La lettre de motivation explique pourquoi vous voulez ce poste dans cette entreprise, et ce que vous apportez. Elle complète votre CV : le CV montre ce que vous avez fait, la lettre montre pourquoi cela intéresse l'employeur. Voici une structure simple, un exemple complet et les erreurs à éviter.</p>

      <h2 style={frH2}>La structure en 4 parties</h2>
      <ol style={frUl}>
        <li style={frP}><b>L'accroche.</b> Dites quel poste vous visez et ce qui vous attire dans l'entreprise, en une ou deux phrases précises.</li>
        <li style={frP}><b>Ce que vous apportez.</b> Choisissez deux expériences ou réalisations qui répondent directement à l'offre, avec un chiffre ou un résultat.</li>
        <li style={frP}><b>Pourquoi cette entreprise.</b> Montrez que vous la connaissez : un produit, un projet, une valeur, un marché.</li>
        <li style={frP}><b>La conclusion.</b> Proposez un entretien, indiquez votre disponibilité et remerciez en une phrase.</li>
      </ol>
      <p style={frP}>Visez une page, soit environ 250 à 300 mots. Écrivez à une personne précise quand vous la connaissez, sinon « Madame, Monsieur ».</p>

      <h2 style={frH2}>Exemple de lettre pour un poste de comptable</h2>
      <div style={quote}>{`Objet : Candidature au poste de comptable

Madame, Monsieur,

Votre annonce pour un poste de comptable au sein de votre société à Casablanca a retenu toute mon attention. Votre activité de distribution, qui demande un suivi précis des stocks et de la facturation, correspond à l'expérience que j'ai acquise ces cinq dernières années.

Dans mon poste actuel en cabinet, je tiens la comptabilité complète de 25 sociétés : saisie, rapprochements bancaires, déclarations de TVA et préparation du bilan. J'ai ramené le délai de clôture mensuelle de 8 à 5 jours grâce à un tableau de suivi que j'ai créé sur Excel, et j'ai réduit de 15 % les retards de paiement des clients par des relances régulières.

Je souhaite aujourd'hui rejoindre une entreprise où je pourrai suivre l'ensemble du cycle comptable au même endroit et participer au pilotage de la trésorerie. Je maîtrise Sage et je suis disponible sous un mois.

Je serais heureux de vous rencontrer pour vous présenter mon parcours plus en détail. Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Prénom Nom
Téléphone · E-mail`}</div>
      <p style={frP}>Remplacez chaque détail par le vôtre. Le point important est que chaque paragraphe répond à un besoin de l'employeur, avec des faits.</p>

      <h2 style={frH2}>Exemple d'accroche pour un stage</h2>
      <div style={quote}>{`Étudiant en 3e année de gestion à l'université, je recherche un stage de fin d'études de quatre mois en finance d'entreprise. Votre société m'intéresse particulièrement parce que vous publiez des analyses de marché que j'ai utilisées pour mon projet de fin d'année, et j'aimerais apprendre à produire ce type de travail.`}</div>

      <h2 style={frH2}>Erreurs à éviter</h2>
      <h3 style={frH3}>Répéter son CV</h3>
      <p style={frP}>Ne recopiez pas la liste de vos expériences : choisissez celles qui répondent à l'offre et expliquez ce qu'elles ont donné.</p>
      <h3 style={frH3}>Utiliser la même lettre partout</h3>
      <p style={frP}>Une lettre générique se repère tout de suite. Changez au moins l'accroche, le nom de l'entreprise et les exemples selon l'annonce.</p>
      <h3 style={frH3}>Fautes et lettre trop longue</h3>
      <p style={frP}>Relisez à voix haute, faites relire par une personne de confiance, et tenez-vous à une page.</p>

      <h2 style={frH2}>Et le CV ?</h2>
      <p style={frP}>Une bonne lettre ne remplace pas un CV clair. Créez le vôtre avec notre <Link href="/fr/createur-de-cv-gratuit" style={frLink}>créateur de CV gratuit</Link>, inspirez-vous des <Link href="/fr/modele-cv" style={frLink}>exemples de CV par métier</Link> et trouvez une offre dans votre ville : <Link href="/fr/emploi" style={frLink}>emploi au Maroc par ville</Link>.</p>
      <p style={{ margin: 0 }}><Link href="/cv/builder" style={frBtn}>Créer mon CV</Link></p>
    </FrPage>
  );
}
