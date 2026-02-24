// app/page.tsx
import CollectionForm from "../components/CollectionForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Collection Entry",
  description: "Create a new collection entry for the weekly church offerings.",
}

export default function Home() {
  return <CollectionForm />;
}