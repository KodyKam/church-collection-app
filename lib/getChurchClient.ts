// lib/getChurchClient.ts
import { supabase } from "./supabaseClient";

export async function getChurchClient() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("church_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Client church fetch error:", error);
    return null;
  }

  return data;
}