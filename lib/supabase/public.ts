import { createClient } from "@supabase/supabase-js";

/** Cookie-free anon client for public, cacheable reads (job pages, sitemap). RLS exposes only active jobs. */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
