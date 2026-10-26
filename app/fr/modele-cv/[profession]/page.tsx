import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { JOB_COLUMNS, type JobRow } from "@/lib/jobs-seo";
import { PROFESSIONS, PROFESSION_BY_SLUG } from "@/lib/seo-pages";
import { FrPage, FrJobs, frH1, frH2, frH3, frP, frUl, frBtn, frLink } from "../../../_components/FrContent";

export const revalidate = 3600;
export const dynamicParams = false;
export function generateStaticParams() { return PROFESSIONS.map((p) => ({ profession: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ profession: string }> }): Promise<Metadata> {
  const p = PROFESSION_BY_SLUG[(await params).profession];
  if (!p) return {};
  const title = `Exemple de CV ${p.name.toLowerCase()} : modèle et conseils | opportunty`;
  const description = `Exemple de CV pour un poste de ${p.name.toLowerCase()} : résumé, missions, compétences et erreurs à éviter. Créez votre CV gratuitement avec un modèle compatible ATS.`;
  return { title, description, alternates: { canonical: `/fr/modele-cv/${p.slug}` }, openGraph: { type: "article", url: `/fr/modele-cv/${p.slug}`, title, description } };
}

export default async function ProfessionPage({ params }: { params: Promise<{ profession: string }> }) {
  const p = PROFESSION_BY_SLUG[(await params).profession];
  if (!p) notFound();
  const { data } = await createPublicClient().from("jobs").select(JOB_COLUMNS).eq("is_active", true).eq("Country", "MA")
    .ilike("title", `%${p.searchHint}%`).order("created_at", { ascending: false }).limit(5);
  const jobs = (data ?? []) as JobRow[];
  const lower = p.name.toLowerCase();
  return (
    <FrPage crumbs={[{ name: "Modèles de CV", href: "/fr/modele-cv" }, { name: p.name }]}>
      <h1 style={frH1}>Exemple de CV {lower}</h1>
      <p style={frP}>{p.intro}</p>
      <p style={{ margin: "0 0 8px" }}><Link href="/cv/builder" style={frBtn}>Créer mon CV de {lower}</Link></p>

      <h2 style={frH2}>Comment structurer votre CV de {lower}</h2>
      <p style={frP}>Un CV d'une à deux pages, dans cet ordre : <b>en-tête</b> (nom, titre visé, ville, téléphone, e-mail), <b>résumé</b> de 2 à 3 lignes, <b>expériences</b> de la plus récente à la plus ancienne, <b>formation</b>, <b>compétences</b> et <b>langues</b>. Utilisez du vrai texte et des titres de rubriques classiques : c'est ce qui permet aux logiciels de tri de lire correctement votre CV.</p>

      <h2 style={frH2}>Exemple de résumé professionnel</h2>
      <blockquote style={{ margin: "0 0 12px", padding: "14px 18px", borderInlineStart: "4px solid #0079a8", background: "#f3f2ed", borderRadius: 8, fontSize: 16, lineHeight: 1.7, color: "#26343d" }}>{p.summary}</blockquote>
      <p style={frP}>Adaptez ce texte à votre parcours : gardez la structure (métier, années d'expérience, résultat clé, outils) mais remplacez les chiffres par les vôtres.</p>

      <h2 style={frH2}>Exemples de missions à mettre en avant</h2>
      <ul style={frUl}>{p.bullets.map((b) => <li key={b} style={frP}>{b}</li>)}</ul>
      <p style={frP}>Commencez chaque ligne par un verbe d'action et ajoutez un chiffre dès que possible : volume, délai, pourcentage ou montant.</p>

      <h2 style={frH2}>Compétences à indiquer</h2>
      <h3 style={frH3}>Compétences techniques</h3>
      <ul style={frUl}>{p.hard.map((s) => <li key={s} style={frP}>{s}</li>)}</ul>
      <h3 style={frH3}>Qualités professionnelles</h3>
      <ul style={frUl}>{p.soft.map((s) => <li key={s} style={frP}>{s}</li>)}</ul>

      <h2 style={frH2}>Erreurs à éviter</h2>
      <ul style={frUl}>{p.mistakes.map((m) => <li key={m} style={frP}>{m}</li>)}</ul>

      <h2 style={frH2}>Offres de {lower} au Maroc</h2>
      <FrJobs jobs={jobs} empty="Aucune offre correspondante pour le moment. Consultez toutes les offres au Maroc." />
      <p style={{ ...frP, marginTop: 14 }}><Link href="/jobs/country/morocco" style={frLink}>Toutes les offres au Maroc →</Link></p>

      <h2 style={frH2}>Prochaine étape</h2>
      <p style={frP}>Rédigez votre CV avec notre <Link href="/fr/createur-de-cv-gratuit" style={frLink}>créateur de CV gratuit</Link> : importez votre ancien CV ou partez de zéro, puis laissez l'IA l'adapter à l'offre. N'oubliez pas la <Link href="/fr/lettre-de-motivation" style={frLink}>lettre de motivation</Link>.</p>
      <p style={{ margin: 0 }}><Link href="/cv/builder" style={frBtn}>Commencer mon CV</Link></p>
    </FrPage>
  );
}
