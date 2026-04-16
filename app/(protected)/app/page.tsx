// app/(protected)/page.tsx
import CollectionForm from "../../../components/CollectionForm";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getChurchSettings } from "@/lib/getChurchSettings";

export const metadata: Metadata = {
  title: "New Collection Entry | Tithr",
  description: "Create a new collection entry for the weekly church offerings.",
};

export default async function Home() {
  const church = await getChurchSettings();

  // 🚨 safety check (shouldn't happen but good practice)
  if (!church) {
    redirect("/setup");
  }

  const isExpired =
    church.subscription_status !== "active" &&
    new Date(church.trial_ends_at) < new Date();

  if (isExpired) {
    redirect("/billing");
  }

  return <CollectionForm />;
}