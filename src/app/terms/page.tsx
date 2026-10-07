import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { LegalSections } from "@/components/legal/LegalSections";
import { site } from "@/lib/site";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/terms", {
  title: "Terms",
  description: "Terms of use for the 4EOS website. Client work is covered by a signed agreement.",
});

const updated = "September 26, 2026";

export default function TermsPage() {
  return (
    <InnerPage
      phase="discovery"
      kicker="Terms"
      title="Terms of use."
      lede={`Effective ${updated}. These terms govern your use of the ${site.name} website. They do not replace a signed service agreement.`}
    >
      <LegalSections
        sections={[
          {
            heading: "Agreement",
            paragraphs: [
              `By using ${site.url.replace("https://", "")}, you agree to these terms. If you do not agree, please do not use the site. We may update these terms from time to time. The effective date above will change when we do, and your continued use of the site after that date is acceptance of the update.`,
            ],
          },
          {
            heading: "The website and our services",
            paragraphs: [
              "The site describes what 4EOS does in general. It is not an offer, a quote, or a promise of a particular price, response time, or security outcome. Work for a client is governed by the written agreement for that work.",
              "Sending a form does not make you a client. A client relationship begins when both sides have signed an agreement.",
              "Nothing on the site is legal, tax, accounting, or compliance advice.",
            ],
          },
          {
            heading: "Acceptable use",
            paragraphs: [
              "Use the site only for lawful purposes. Do not attempt to disrupt it, overload it, gain access you are not given, probe it without permission, or submit malware or any other harmful material through a form.",
              "Do not copy the site, its design, or its writing for your own commercial use without our written permission.",
            ],
          },
          {
            heading: "Intellectual property",
            paragraphs: [
              `The writing, marks, and design on this site belong to ${site.name} unless a credit says otherwise. To report a copyright concern, email ${site.helpdesk} with the page address and a description of the work you believe is affected.`,
            ],
          },
          {
            heading: "Information you submit",
            paragraphs: [
              "You are responsible for the accuracy of what you send us. Do not submit passwords, payment card numbers, or medical records through a website form. Call the help desk for those matters.",
              "We may discard a submission that appears to be automated.",
            ],
          },
          {
            heading: "Third-party services",
            paragraphs: [
              "Links to social networks and to remote support leave this site. Remote support is for an existing client, and only when we have asked you to connect. We are not responsible for third-party sites or for what you do after you leave.",
            ],
          },
          {
            heading: "Disclaimer",
            paragraphs: [
              "The website is provided as is and as available. To the extent the law allows, 4EOS disclaims warranties of merchantability, fitness for a particular purpose, and non-infringement, and any warranty that the site will be uninterrupted or error-free.",
            ],
          },
          {
            heading: "Limitation of liability",
            paragraphs: [
              "To the extent the law allows, 4EOS and its officers, employees, and agents are not liable for any indirect, incidental, special, consequential, or punitive damages, or for lost profits or lost data, arising out of your use of the website.",
              "Some states do not allow certain limitations. In those cases, the limitation applies only as far as the law allows. Nothing in these terms limits liability that the law says cannot be limited.",
            ],
          },
          {
            heading: "Privacy",
            paragraphs: [
              "Our collection and use of information on this website is described in the privacy policy. A usage record is separate from a form you send, and it does not include the words you type into that form.",
            ],
          },
          {
            heading: "Governing law",
            paragraphs: [
              `These terms are governed by the laws of the State of Indiana, without regard to conflict-of-law rules. Disputes about the website are heard in the state or federal courts located in Allen County, Indiana. Questions: ${site.helpdesk}, ${site.phone}.`,
            ],
          },
          {
            heading: "General",
            paragraphs: [
              "If a court finds that part of these terms is unenforceable, the rest remains in effect. These terms are the entire agreement between you and 4EOS about use of the website.",
            ],
          },
        ]}
      />
    </InnerPage>
  );
}
