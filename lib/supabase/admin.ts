import { createClient } from "@supabase/supabase-js";

/** Service-role client — server only, bypasses RLS. Used to record purchases. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function recordPurchase(userId: string, templateId: string, paymentId: string) {
  const { error } = await createAdminClient()
    .from("cv_template_purchases")
    .upsert({ user_id: userId, template_id: templateId, payment_id: paymentId }, { onConflict: "user_id,template_id", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}
