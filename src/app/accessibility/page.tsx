import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { LegalSections } from "@/components/legal/LegalSections";
import { site } from "@/lib/site";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/accessibility", {
  title: "Accessibility",
  description: "4EOS is working to make this website conform to WCAG 2.2 Level AA.",
});

const updated = "September 26, 2026";

export default function AccessibilityPage() {
  return (
    <InnerPage
      phase="discovery"
      kicker="Accessibility"
      title="Accessibility."
      lede={`Effective ${updated}. ${site.name} wants this website to be usable by as many people as possible.`}
    >
      <LegalSections
        sections={[
          {
            heading: "Our commitment",
            paragraphs: [
              "We intend for people to be able to perceive, operate, and understand this website, including with a keyboard, a screen reader, browser zoom, and their own text settings.",
            ],
          },
          {
            heading: "Standard",
            paragraphs: [
              "We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.2, Level AA, published by the World Wide Web Consortium. That is our target. This page is not a claim that every part of the site has been formally audited.",
            ],
          },
          {
            heading: "How we build pages",
            paragraphs: [
              "Pages use text you can resize, controls you can reach and operate from a keyboard, and labels on form fields. The particle field behind the pages is decorative and is hidden from assistive technology.",
              "If motion makes a page difficult, turn on reduced motion in your operating system. The field then holds still.",
              "The site is written to work with current versions of major browsers and with commonly used screen readers.",
            ],
          },
          {
            heading: "Known limits",
            paragraphs: [
              "Third-party services linked from this site, including remote support, are outside these pages and may not meet the same standard. Some older files may be harder to use than the pages around them.",
              "If you need the same information in another format, ask us. You do not have to use the website to reach the help desk.",
            ],
          },
          {
            heading: "Feedback",
            paragraphs: [
              `If a page blocks you, email ${site.helpdesk} or call ${site.phone}. Tell us the page address, what you were trying to do, and, if you are comfortable doing so, the browser and assistive technology you were using. We will respond and work on a fix.`,
            ],
          },
        ]}
      />
    </InnerPage>
  );
}
