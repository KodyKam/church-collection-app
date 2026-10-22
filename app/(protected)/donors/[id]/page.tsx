import type { Metadata } from "next";
import { getChurchSettings } from "@/lib/getChurchSettings";
import DonorHistoryClient from "./DonorHistoryClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Donor Contribution History",
};

export default async function DonorHistoryPage({ params }: PageProps) {
  const { id } = await params;
  const church = await getChurchSettings();

  return <DonorHistoryClient donorId={id} church={church} />;
}
