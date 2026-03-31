// app/(protected)/layout.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { getChurchSettings } from "@/lib/getChurchSettings";
import LayoutWrapper from "@/components/LayoutWrapper";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔐 Only protect THESE routes
  if (!user) {
    redirect("/login");
  }

  const church = await getChurchSettings();
  if (
  church.subscription_status !== "active" &&
  new Date(church.trial_ends_at) < new Date()
) {
  redirect("/billing");
}

  return <LayoutWrapper church={church}>{children}</LayoutWrapper>;
}