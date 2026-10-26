import type { Metadata } from "next";
import Link from "next/link";
import { CITIES } from "@/lib/seo-pages";
import { FrPage, frH1, frH2, frP, frUl, frLink } from "../../_components/FrContent";

export const metadata: Metadata = {
  title: "Offres d'emploi au Maroc par ville — Casablanca, Rabat, Marrakech, Tanger | opportunty",
  description: "Trouvez des offres d'emploi au Maroc ville par ville : Casablanca, Rabat, Marrakech et Tanger. Offres mises à jour chaque jour et créateur de CV gratuit.",
  alternates: { canonical: "/fr/emploi" },
};

export default function Page() {
  return (
    <FrPage crumbs={[{ name: "Emploi au Maroc" }]}>
      <h1 style={frH1}>Offres d'emploi au Maroc par ville</h1>
      <p style={frP}>Le marché de l'emploi marocain varie beaucoup d'une ville à l'autre : finance et services à Casablanca, administration à Rabat, tourisme à Marrakech, industrie à Tanger. Choisissez votre ville pour voir les offres ouvertes et des conseils adaptés pour postuler.</p>
      <h2 style={frH2}>Choisir une ville</h2>
      <ul style={frUl}>{CITIES.map((c) => <li key={c.slug} style={frP}><Link href={`/fr/emploi/${c.slug}`} style={frLink}>Emploi à {c.name}</Link></li>)}</ul>
      <p style={frP}>Vous cherchez ailleurs ? <Link href="/jobs/country/morocco" style={frLink}>Toutes les offres au Maroc</Link>, ou les offres en <Link href="/jobs/country/france" style={frLink}>France</Link>, <Link href="/jobs/country/germany" style={frLink}>Allemagne</Link> et <Link href="/jobs/country/saudi-arabia" style={frLink}>Arabie saoudite</Link>.</p>
    </FrPage>
  );
}
