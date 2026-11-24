import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isEmployer } from "@/app/employers/_role";

/** The signed-in user from the request cookies, or null. */
export async function currentUser(): Promise<User | null> {
  const { data: { user } } = await (await createClient()).auth.getUser();
  return user ?? null;
}

export async function currentEmployer(): Promise<User | null> {
  const u = await currentUser();
  return u && isEmployer(u) ? u : null;
}

/** Owner(s) of the site: comma-separated emails in ADMIN_EMAILS (Vercel env). Nobody is admin when it is unset. */
export function isAdmin(user: User | null | undefined): boolean {
  const list = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!user?.email && list.includes(user.email.toLowerCase());
}
