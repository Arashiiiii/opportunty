import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { JOB_COLUMNS, type JobRow } from "@/lib/jobs-seo";
import { CITIES, CITY_BY_SLUG } from "@/lib/seo-pages";
import { FrPage, FrJobs, frH1, frH2, frH3, frP, frUl, frBtn, frLink } from "../../../_components/FrContent";

export const revalidate = 1800;
export const dynamicParams = false;
export function generateStaticParams() { return CITIES.map((c) => ({ city: c.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const c = CITY_BY_SLUG[(await params).city];
  if (!c) return {};
  const title = `Offres d'emploi à ${c.name} — dernières annonces | opportunty`;
  const description = `Consultez les offres d'emploi à ${c.name} mises à jour chaque jour, avec des conseils pour postuler et un créateur de CV gratuit adapté aux recruteurs marocains.`;
  return { title, description, alternates: { canonical: `/fr/emploi/${c.slug}` }, openGraph: { type: "website", url: `/fr/emploi/${c.slug}`, title, description } };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const c = CITY_BY_SLUG[(await params).city];
  if (!c) notFound();
  const { data } = await createPublicClient().from("jobs").select(JOB_COLUMNS).eq("is_active", true)
    .or(c.patterns.map((p) => `location.ilike.*${p}*`).join(",")).order("created_at", { ascending: false }).limit(40);
  const jobs = (data ?? []) as JobRow[];
  return (
    <FrPage crumbs={[{ name: "Emploi au Maroc", href: "/fr/emploi" }, { name: c.name }]}>
      <h1 style={frH1}>Offres d'emploi à {c.name}</h1>
      {c.intro.map((t) => <p key={t} style={frP}>{t}</p>)}

      <h2 style={frH2}>{jobs.length > 0 ? `${jobs.length} offres ouvertes à ${c.name}` : `Offres à ${c.name}`}</h2>
      <FrJobs jobs={jobs} empty={`Aucune offre ouverte à ${c.name} pour le moment. Consultez toutes les offres du Maroc ci-dessous.`} />
      <p style={{ ...frP, marginTop: 16 }}><Link href="/jobs/country/morocco" style={frLink}>Voir toutes les offres au Maroc →</Link></p>

      <h2 style={frH2}>Les secteurs qui recrutent à {c.name}</h2>
      <ul style={frUl}>{c.sectors.map((s) => <li key={s.t} style={frP}><b>{s.t}.</b> {s.d}</li>)}</ul>

      <h2 style={frH2}>Postuler à {c.name} : nos conseils</h2>
      <ul style={frUl}>{c.tips.map((t) => <li key={t} style={frP}>{t}</li>)}</ul>
      <p style={frP}>Adaptez votre CV à chaque annonce : reprenez les mots-clés de l'offre là où ils correspondent à votre expérience. Notre <Link href="/fr/createur-de-cv-gratuit" style={frLink}>créateur de CV gratuit</Link> le fait avec l'IA, et vous pouvez voir des <Link href="/fr/modele-cv" style={frLink}>exemples de CV par métier</Link> ou rédiger votre <Link href="/fr/lettre-de-motivation" style={frLink}>lettre de motivation</Link>.</p>
      <p style={{ margin: "8px 0 0" }}><Link href="/cv/builder" style={frBtn}>Créer mon CV gratuitement</Link></p>

      <h2 style={frH2}>Questions fréquentes</h2>
      {c.faq.map((f) => (<div key={f.q} style={{ marginBottom: 14 }}><h3 style={frH3}>{f.q}</h3><p style={{ ...frP, margin: 0 }}>{f.a}</p></div>))}

      <h2 style={frH2}>Autres villes</h2>
      <ul style={frUl}>{CITIES.filter((o) => o.slug !== c.slug).map((o) => <li key={o.slug}><Link href={`/fr/emploi/${o.slug}`} style={frLink}>Emploi à {o.name}</Link></li>)}</ul>
    </FrPage>
  );
}
