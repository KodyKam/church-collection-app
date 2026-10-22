// app/api/collections/[id]/void/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Authenticate the current user.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to void a collection." },
        { status: 401 }
      );
    }

    // 2. Get the collection ID from the route.
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Collection ID is required." },
        { status: 400 }
      );
    }

    // 3. Validate the reason supplied by the user.
    let body: { reason?: unknown };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON request is required." },
        { status: 400 }
      );
    }

    if (typeof body.reason !== "string" || !body.reason.trim()) {
      return NextResponse.json(
        { error: "A reason is required to void a collection." },
        { status: 400 }
      );
    }

    const reason = body.reason.trim();

    if (reason.length > 500) {
      return NextResponse.json(
        { error: "The reason must be 500 characters or fewer." },
        { status: 400 }
      );
    }

    // 4. Verify that the collection belongs to this user.
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("id, voided_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (collectionError) {
      console.error("Collection lookup error:", collectionError);

      return NextResponse.json(
        { error: "Could not verify the collection." },
        { status: 500 }
      );
    }

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found." },
        { status: 404 }
      );
    }

    // 5. Do not allow an already-voided collection to be voided again.
    if (collection.voided_at) {
      return NextResponse.json(
        { error: "This collection has already been voided." },
        { status: 409 }
      );
    }

    // 6. Record the void atomically, provided it is still active.
    const { data: updatedCollection, error: updateError } = await supabase
      .from("collections")
      .update({
        voided_at: new Date().toISOString(),
        voided_by: user.id,
        void_reason: reason,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .is("voided_at", null)
      .select("id, voided_at, voided_by, void_reason")
      .maybeSingle();

    if (updateError) {
      console.error("Collection void error:", updateError);

      return NextResponse.json(
        { error: "Could not void the collection." },
        { status: 500 }
      );
    }

    // Another request may have voided the collection first.
    if (!updatedCollection) {
      return NextResponse.json(
        { error: "The collection may already have been voided. Refresh and check its status." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      collection: updatedCollection,
    });
  } catch (error) {
    console.error("Unexpected collection void error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred while voiding the collection." },
      { status: 500 }
    );
  }
}