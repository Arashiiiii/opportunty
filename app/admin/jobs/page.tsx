import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser, isAdmin } from "@/lib/server-auth";
import { AdminJobs } from "./AdminJobs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Approve jobs", robots: { index: false, follow: false } };

export default async function Page() {
  if (!isAdmin(await currentUser())) notFound();
  const { data } = await createAdminClient().from("jobs")
    .select("id, title, company, location, Country, job_type, salary_range, description, external_url, created_at")
    .eq("moderation", "pending").not("employer_id", "is", null).order("created_at", { ascending: true });
  return <AdminJobs jobs={data ?? []} />;
}
