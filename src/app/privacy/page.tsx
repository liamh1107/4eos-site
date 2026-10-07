import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { LegalSections } from "@/components/legal/LegalSections";
import { site } from "@/lib/site";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/privacy", {
  title: "Privacy",
  description: "How 4EOS collects, uses, and shares information on this website.",
});

const updated = "September 26, 2026";

export default function PrivacyPage() {
  return (
    <InnerPage
      phase="discovery"
      kicker="Privacy"
      title="Privacy policy."
      lede={`Effective ${updated}. This policy explains how ${site.name} handles information collected on this website.`}
    >
      <LegalSections
        sections={[
          {
            heading: "Who we are",
            paragraphs: [
              `${site.name} provides managed IT, cybersecurity, and related services to businesses. Our office is at ${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}.`,
              `This policy covers ${site.url.replace("https://", "")}. A signed service agreement covers work we do for a client. Questions about this policy go to ${site.helpdesk} or ${site.phone}.`,
            ],
          },
          {
            heading: "Information we collect",
            paragraphs: [
              "If you contact us or request support, we collect the details you choose to send: your name, email address, company, phone number, and message. We use that information to respond to you.",
              "Please do not send passwords, payment card numbers, medical records, or other sensitive files through a website form. Call the help desk for those matters.",
              "When you browse the site, we collect usage information such as the pages you open, roughly how long a page stays in view, how far you scroll, and whether you use a phone number, an email address, or a contact link. A contact or support form is counted as a request. The words you type into a form are not added to that usage record.",
              "A first-party cookie stores a random visitor identifier so we can tell a new visit from a return visit. It is not tied to your name, email, or phone number. We do not use advertising cookies.",
              "Our hosting provider may keep ordinary server logs, including an IP address and browser type, to operate and protect the site. We may use an IP address briefly to determine an approximate city, state, and network name, and then discard the address. That lookup does not identify you by name. Our analytics records do not keep the IP address.",
            ],
          },
          {
            heading: "How we use information",
            paragraphs: [
              "We use information to reply to inquiries, provide support, operate and protect the website, understand which pages are useful, and meet our legal obligations.",
              "A phone number you submit is used only to respond to that request. We do not use it for marketing calls or texts.",
              "We do not sell personal information, and we do not share it for advertising.",
            ],
          },
          {
            heading: "Who we share it with",
            paragraphs: [
              "We share information with service providers that host the website, deliver messages, and help us respond to requests. They may use the information only to perform those services for us.",
              "We may also disclose information if the law requires it, or if we are involved in a merger, acquisition, or sale of assets. A successor would remain subject to this policy for information collected under it.",
            ],
          },
          {
            heading: "How long we keep it",
            paragraphs: [
              "We keep an inquiry for as long as we need it to respond and to maintain a record of the request. Usage records are kept for about thirteen months and then deleted.",
            ],
          },
          {
            heading: "Your choices",
            paragraphs: [
              `Email ${site.helpdesk} if you want a copy of a website inquiry, a correction, or deletion of that inquiry. You can also control cookies in your browser. Blocking the visitor cookie means we will treat later visits as new.`,
            ],
          },
          {
            heading: "Security",
            paragraphs: [
              "We use reasonable administrative and technical safeguards designed to protect information we collect. No method of transmission or storage is completely secure.",
            ],
          },
          {
            heading: "Children",
            paragraphs: [
              "This website is directed at businesses. It is not directed at children under 13, and we do not knowingly collect personal information from them. If you believe a child has sent us information, contact us and we will delete it.",
            ],
          },
          {
            heading: "Other sites",
            paragraphs: [
              "Links to social networks and to remote support leave this website and are governed by those services' own policies. A remote-support session starts only when you choose that link.",
            ],
          },
          {
            heading: "Changes",
            paragraphs: [
              "We may update this policy from time to time. The effective date at the top of the page will change when we do.",
            ],
          },
        ]}
      />
    </InnerPage>
  );
}
