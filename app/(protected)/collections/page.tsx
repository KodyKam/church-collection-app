// app/(protected)/collections/page.tsx
import { redirect } from "next/navigation";
import { getChurchSettings } from "@/lib/getChurchSettings";
import CollectionsClient from "./CollectionsClient";

export default async function CollectionsPage() {
  const church = await getChurchSettings();

  if (!church) {
    redirect("/setup");
  }

  const isExpired =
    church.subscription_status !== "active" &&
    new Date(church.trial_ends_at) < new Date();

  if (isExpired) {
    redirect("/billing");
  }

  return <CollectionsClient />;
}