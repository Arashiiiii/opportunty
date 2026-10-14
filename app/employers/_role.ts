import type { User } from "@supabase/supabase-js";

/** Account type lives in auth user_metadata.role ("employer"); everyone else is a job seeker. */
export const isEmployer = (user: User | null | undefined): boolean => user?.user_metadata?.role === "employer";
