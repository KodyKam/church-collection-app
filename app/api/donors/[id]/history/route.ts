// app/api/donors/[id]/history/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Authenticate the requester.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 2. Make sure the donor belongs to the logged-in user.
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

    // 3. Retrieve this donor's historical donations.
    // Include collection_id so we can look up each parent collection.
    const { data: donations, error: donationsError } = await supabase
      .from("donations")
      .select("id, donor_name, amount, donation_type, created_at, collection_id")
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

    const donationRecords = donations || [];

    // 4. Collect the IDs of the collections linked to these donations.
    const collectionIds = [
      ...new Set(
        donationRecords
          .map((donation) => donation.collection_id)
          .filter((collectionId): collectionId is string => Boolean(collectionId))
      ),
    ];

    // 5. Retrieve the associated collections, including void information.
    const collectionsById: Record<
      string,
      {
        id: string;
        date: string;
        service_type: string | null;
        voided_at: string | null;
        void_reason: string | null;
      }
    > = {};

    if (collectionIds.length > 0) {
      const { data: collections, error: collectionsError } = await supabase
        .from("collections")
        .select("id, date, service_type, voided_at, void_reason")
        .eq("user_id", user.id)
        .in("id", collectionIds);

      if (collectionsError) {
        console.error("Donor history collections error:", collectionsError);

        return NextResponse.json(
          { error: "Could not load collection details for donor history" },
          { status: 500 }
        );
      }

      for (const collection of collections || []) {
        collectionsById[collection.id] = collection;
      }
    }

    // 6. Attach collection details to each donation.
    // Keep voided donations in the response for historical reference.
    const donationsWithCollections = donationRecords.map((donation) => ({
      ...donation,
      amount: Number(donation.amount) || 0,
      collection: donation.collection_id
        ? collectionsById[donation.collection_id] ?? null
        : null,
    }));

    return NextResponse.json({
      donor,
      donations: donationsWithCollections,
    });
  } catch (error) {
    console.error("Unexpected donor history error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred while loading donor history" },
      { status: 500 }
    );
  }
}