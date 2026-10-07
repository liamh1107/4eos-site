import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { FaqList } from "@/components/seo/FaqList";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqs } from "@/lib/content";
import { faqSchema, graphSchema } from "@/lib/schema";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/faq", {
  title: "FAQ",
  description: "Straight answers on choosing a provider, VoIP, outsourcing, and cybersecurity.",
});

export default function FAQPage() {
  return (
    <InnerPage
      phase="discovery"
      kicker="Questions"
      title="Straight answers."
      lede="From choosing a provider to what VoIP should include."
    >
      <JsonLd data={graphSchema([faqSchema(faqs)])} />
      <FaqList items={faqs} />
    </InnerPage>
  );
}
