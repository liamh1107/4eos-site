import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { BackLink } from "@/components/ui/BackLink";
import { Sheet } from "@/components/layout/Sheet";
import { RiskQuiz } from "@/components/forms/RiskQuiz";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/assessment", {
  title: "IT Risk Quiz",
  description:
    "Twelve questions on business, cybersecurity, backup, compliance, infrastructure, and support. Get a risk score and a read on each area.",
});

export default function AssessmentPage() {
  return (
    <Page phase="discovery">
      <section className="px-[var(--sheet-inset)] pb-6 pt-[6vh]">
        <BackLink href="/" label="Home" />
        <p className="micro mt-6">
          <span className="field-copy">Free IT assessment</span>
        </p>
        <h1 className="display page-display mt-5 max-w-[18ch]">
          How exposed is
          <br />
          <span className="text-gold">your environment?</span>
        </h1>
        <p className="lede mt-6 max-w-[46ch]">
          <span className="field-copy">
            A twelve-question self-check across the six areas we review on every
            engagement. You get a risk score and a short read on each area. Nothing
            is sent until you ask for the full assessment.
          </span>
        </p>
      </section>
      <Sheet tone="ink">
        <div className="sheet-pad sheet-y">
          <RiskQuiz />
        </div>
      </Sheet>
    </Page>
  );
}
