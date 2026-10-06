// app/api/donors/[id]/history/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { id } = await params;

  // Make sure the donor belongs to the logged-in user.
  const { data: donor, error: donorError } = await supabase
    .from("donors")
    .select("id, name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (donorError || !donor) {
    return NextResponse.json(
      { error: "Donor not found" },
      { status: 404 }
    );
  }

  // Get this donor's historical donations.
  const { data: donations, error: donationsError } = await supabase
    .from("donations")
    .select("id, donor_name, amount, donation_type, created_at")
    .eq("donor_id", donor.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (donationsError) {
    console.error("Donor history error:", donationsError);

    return NextResponse.json(
      { error: "Could not load donor history" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    donor,
    donations: donations || [],
  });
}