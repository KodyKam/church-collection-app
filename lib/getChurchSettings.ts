// lib/getChurchSettings.ts
import { createServerSupabaseClient } from "./supabaseServer";

export const dynamic = "force-dynamic";
export async function getChurchSettings() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("church_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()
    .throwOnError();

  if (error) {
    console.error("Church fetch error:", error);
    return null;
  }

  return data;
}