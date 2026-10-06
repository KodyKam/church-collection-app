// app/api/donors/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json([]);
  }

  let query = supabase
    .from("donors")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Donor lookup error:", error);
    return NextResponse.json(
      { error: "Failed to load donors" },
      { status: 500 }
    );
  }

  return NextResponse.json(data || []);
}