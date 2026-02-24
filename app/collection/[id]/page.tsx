// app/collection/[id]/page.tsx
import { createClient } from "@supabase/supabase-js";
import CollectionPreview from "@/components/CollectionPreview";
import type { Metadata } from "next";

// server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: "Collection Preview",
};

export default async function Page({ params }: PageProps) {
  // ✅ Unwrap params promise
  const { id } = await params;

  // Fetch collection + donations
  const { data: collection, error } = await supabase
    .from("collections")
    .select("*, donations(*)")
    .eq("id", id)
    .single();

  if (error || !collection) {
    return <div style={{ padding: "2rem" }}>Collection not found.</div>;
  }

  // Create signed URL for deposit slip (1 hour)
  let depositUrl: string | null = null;
  if (collection.deposit_slip_url) {
    const { data: signedData, error: signedError } = await supabase.storage
      .from("deposit-slips")
      .createSignedUrl(collection.deposit_slip_url, 60 * 60);

    if (!signedError) depositUrl = signedData?.signedUrl || null;
  }

  // ✅ Pass data to client component for PDF/buttons
  return <CollectionPreview collection={collection} depositUrl={depositUrl} />;
}