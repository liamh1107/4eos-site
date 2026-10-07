import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { BackLink } from "@/components/ui/BackLink";
import { Sheet } from "@/components/layout/Sheet";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { site } from "@/lib/site";
import { hours } from "@/lib/content";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/support", {
  title: "Support",
  description: `Existing clients: reach the 4EOS help desk. ${site.phone} · ${site.helpdesk}.`,
});

const channels = [
  {
    label: "Call",
    value: site.phone,
    href: site.phoneHref,
    note: "Fastest for anything urgent.",
  },
  {
    label: "Email",
    value: site.helpdesk,
    href: `mailto:${site.helpdesk}`,
    note: "Creates a ticket automatically.",
  },
  {
    label: "Hours",
    value: hours,
    note: "CompleteCare monitoring runs 24/7.",
  },
];

export default function SupportPage() {
  return (
    <Page phase="unmanaged">
      <Sheet tone="ink">
        <div className="sheet-pad sheet-y grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <BackLink href="/" label="Home" />
            <p className="micro mt-6 text-fg-faint">Help desk</p>
            <h1 className="display page-display mt-5">
              Existing client. We already know the environment.
            </h1>
            <p className="lede mt-8">
              Down completely? Call, do not email. Outages get priority.
            </p>
            <a
              href="https://4eos.screenconnect.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bar-btn bar-btn-line bar-btn-glow mt-8 inline-flex"
            >
              Remote support
            </a>
            <ul className="mt-12">
              {channels.map((c) => (
                <li key={c.label} className="border-t border-hairline py-5 last:border-b">
                  <p className="micro text-fg-faint">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="mt-1 block text-[17px] tracking-tight hover:text-gold">
                      {c.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-[17px] tracking-tight">{c.value}</p>
                  )}
                  <p className="body-sm mt-1">{c.note}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <IntakeForm
              endpoint="/api/support"
              intent="support"
              submitLabel="Open ticket"
            />
          </div>
        </div>
      </Sheet>
    </Page>
  );
}
