// app/(protected)/layout.tsx
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { getChurchSettings } from "@/lib/getChurchSettings";
import LayoutWrapper from "@/components/LayoutWrapper";

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

  return <LayoutWrapper church={church}>{children}</LayoutWrapper>;
}