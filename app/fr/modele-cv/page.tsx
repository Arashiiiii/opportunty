import type { Metadata } from "next";
import Link from "next/link";
import { PROFESSIONS } from "@/lib/seo-pages";
import { FrPage, frH1, frH2, frP, frUl, frLink } from "../../_components/FrContent";

export const metadata: Metadata = {
  title: "Exemples de CV par métier — modèles et conseils | opportunty",
  description: "Exemples de CV pour comptable, développeur, commercial, assistant administratif, conseiller clientèle et plus. Résumés, missions et compétences prêts à adapter.",
  alternates: { canonical: "/fr/modele-cv" },
};

export default function Page() {
  return (
    <FrPage crumbs={[{ name: "Modèles de CV" }]}>
      <h1 style={frH1}>Exemples de CV par métier</h1>
      <p style={frP}>Pour chaque métier, vous trouvez un exemple de résumé, des missions chiffrées, les compétences à indiquer et les erreurs à éviter. Choisissez votre métier, adaptez le contenu à votre parcours, puis créez votre CV gratuitement.</p>
      <h2 style={frH2}>Choisir un métier</h2>
      <ul style={frUl}>{PROFESSIONS.map((p) => <li key={p.slug} style={frP}><Link href={`/fr/modele-cv/${p.slug}`} style={frLink}>CV {p.name.toLowerCase()}</Link></li>)}</ul>
      <p style={frP}>Votre métier n'est pas dans la liste ? Le <Link href="/fr/createur-de-cv-gratuit" style={frLink}>créateur de CV</Link> fonctionne pour tous les profils, et la <Link href="/fr/lettre-de-motivation" style={frLink}>lettre de motivation</Link> suit la même logique.</p>
    </FrPage>
  );
}
