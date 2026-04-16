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

  // 🔐 Auth guard
  if (!user || !user.email_confirmed_at) {
    redirect("/login");
  }

  const church = await getChurchSettings();

  // 🚨 SAFETY: handle missing church
  if (!church) {
    redirect("/setup");
  }

  const isExpired =
    church.subscription_status !== "active" &&
    new Date(church.trial_ends_at) < new Date();

  // ❌ DO NOT redirect here anymore
  // 👉 Let pages decide

  return <LayoutWrapper church={church}>{children}</LayoutWrapper>;
}