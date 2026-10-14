"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { inferCountry } from "@/app/_lib/country";
import { isEmployer } from "@/app/employers/_role";
import { BarList, Card, Columns, Grid, Kpis, Shell, Table, MUTED, useDash } from "../_ui";

const supabase = createClient();

interface Job { id: string; title: string; company: string; location: string; job_type: string | null; tags: string[] | null; created_at: string }
const dayMs = 86_400_000;

const top = (items: string[], n: number) => {
  const m = new Map<string, number>();
  items.forEach((i) => { const k = i.trim(); if (k) m.set(k, (m.get(k) ?? 0) + 1); });
  return [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, value]) => ({ label, value }));
};

export default function EmployerDashboard() {
  const { d, lang } = useDash();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isEmployer(user)) { window.location.href = user ? "/employers/login?wrong=1" : "/employers/login"; return; }
      const { data, error } = await supabase.from("jobs").select("id, title, company, location, job_type, tags, created_at")
        .eq("is_active", true).order("created_at", { ascending: false }).limit(1000);
      if (error) setFailed(true); else setJobs((data ?? []) as Job[]);
    })();
  }, []);

  if (failed) return <Shell active="employer" title={d.employerTitle} sub={d.error}><div /></Shell>;
  if (!jobs) return <Shell active="employer" title={d.employerTitle} sub={d.loading}><div /></Shell>;

  const now = Date.now();
  const age = (j: Job) => Math.floor((now - new Date(j.created_at).getTime()) / dayMs);
  const withCountry = jobs.map((j) => ({ ...j, country: inferCountry(j.location ?? "") }));
  const byCountry = top(withCountry.map((j) => d.countries[j.country] ?? j.country), 6);
  const companies = new Set(jobs.map((j) => j.company.trim().toLowerCase()).filter(Boolean));

  const days = Array.from({ length: 30 }, (_, i) => 29 - i);
  const perDay = days.map((n) => jobs.filter((j) => age(j) === n).length);
  const dayLabels = days.map((n) => (n === 0 ? d.today : `-${n}d`));

  const fmtAge = (j: Job) => (age(j) <= 0 ? d.today : d.daysAgo(age(j)));
  void lang;

  return (
    <Shell active="employer" title={d.employerTitle} sub={d.employerSub}>
      <Kpis items={[
        { label: d.eActive, value: String(jobs.length), note: d.eActiveNote },
        { label: d.eNew7, value: String(jobs.filter((j) => age(j) < 7).length), note: d.eNew7Note },
        { label: d.eCompanies, value: String(companies.size), note: d.eCompaniesNote },
        { label: d.eCountries, value: String(byCountry.length), note: d.eCountriesNote },
      ]} />

      <Grid>
        <Card title={d.perDay} sub={d.perDaySub}><Columns values={perDay} labels={dayLabels} empty={d.none} /></Card>
        <Card title={d.byCountry} sub={d.byCountrySub}><BarList rows={byCountry} empty={d.none} /></Card>
      </Grid>

      <Grid>
        <Card title={d.topCompanies} sub={d.topCompaniesSub}><BarList rows={top(jobs.map((j) => j.company), 8)} empty={d.none} /></Card>
        <Card title={d.topSkills} sub={d.topSkillsSub}><BarList rows={top(jobs.flatMap((j) => j.tags ?? []), 8)} empty={d.none} /></Card>
      </Grid>

      <Grid>
        <Card title={d.byType} sub={d.byTypeSub}><BarList rows={top(jobs.map((j) => j.job_type ?? ""), 6)} empty={d.none} /></Card>
        <Card title={d.latest} sub={d.latestSub}>
          <Table
            head={[d.title, d.location, d.posted]}
            empty={d.none}
            rows={jobs.slice(0, 6).map((j) => [
              <span key="t" dir="auto" style={{ fontWeight: 600 }}>{j.title}</span>,
              <span key="l" dir="auto" style={{ color: MUTED }}>{j.location}</span>,
              fmtAge(j),
            ])}
          />
        </Card>
      </Grid>

      <p style={{ color: "#939084", fontSize: 13.5, maxWidth: 640, lineHeight: 1.5 }}>{d.employerNote}</p>
    </Shell>
  );
}
