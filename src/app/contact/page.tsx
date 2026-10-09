import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { BackLink } from "@/components/ui/BackLink";
import { Sheet } from "@/components/layout/Sheet";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { addressLine, site } from "@/lib/site";
import { hours, salesEmail } from "@/lib/content";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/contact", {
  title: "Contact",
  description: `Request a free IT assessment. ${site.phone} · ${addressLine}.`,
});

const routes = [
  { label: "Phone", value: site.phone, href: site.phoneHref },
  { label: "Support", value: site.helpdesk, href: `mailto:${site.helpdesk}` },
  { label: "New clients", value: salesEmail, href: `mailto:${salesEmail}` },
  { label: "Office", value: addressLine },
  { label: "Hours", value: hours },
];

export default function ContactPage() {
  return (
    <Page phase="discovery">
      <Sheet tone="ink" className="min-h-[calc(100svh-var(--nav-h)-var(--sheet-inset))]">
        <div className="sheet-pad sheet-y grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <BackLink href="/" label="Home" />
            <p className="micro mt-6 text-fg-faint">New client</p>
            <h1 className="display page-display mt-5">
              Tell us about the environment.
            </h1>
            <p className="lede mt-8">
              A senior engineer follows up, not a salesperson. An existing client
              with an issue should use Support.
            </p>
            <ul className="mt-12">
              {routes.map((r) => (
                <li key={r.label} className="border-t border-hairline py-5 last:border-b">
                  <p className="micro text-fg-faint">{r.label}</p>
                  {r.href ? (
                    <a href={r.href} className="mt-1 block text-[17px] tracking-tight hover:text-gold">
                      {r.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-[17px] tracking-tight">{r.value}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <IntakeForm
              endpoint="/api/contact"
              intent="assessment"
              submitLabel="Send"
            />
          </div>
        </div>
      </Sheet>
    </Page>
  );
}
