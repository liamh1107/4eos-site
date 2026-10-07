import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";
import { JsonLd } from "@/components/seo/JsonLd";
import { withCanonical } from "@/lib/metadata";
import { websiteSchema } from "@/lib/schema";

export const metadata: Metadata = withCanonical("/");

export default function Home() {
  return (
    <>
      <JsonLd data={websiteSchema()} />
      <HomeView />
    </>
  );
}
