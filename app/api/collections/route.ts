import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json([]);

  let query = supabase
    .from("collections")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json([]);
  }

  return NextResponse.json(data);
}